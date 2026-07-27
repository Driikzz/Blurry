import { IncomingMessage } from "http";
import crypto from "crypto";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { MessageFormat } from "../dtos/MessageFormat";
import { GameService } from "./gameService";
import { JoinGameDto, LeaveGameDto } from "../dtos/Games";
import { User } from "../entities/User";
import { WebSocketRoomService } from "./WebSocketRoomService";
import {
  BlurImageMetadataDto,
  RoundEndedDto,
  RoundStartedDto,
  SubmitAnswerDto,
} from "../dtos/GameRounds";
import { Game, GameStatus } from "../entities/Game";
import { GameRound } from "../entities/GameRound";
import { BLUR_STEPS } from "../constants/GameConfig";
import { ImageService } from "./ImageService";
import { GameImageCacheService } from "./GameImageCacheService";

export interface ClientInformations {
  ws: WebSocket;
  user: User;
  connectedAt: Date;
  ipAddress: string | undefined;
}

export enum MessageType {
  ERROR = "error",
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  ROUND_STARTED = "round_started",
  BLUR_IMAGE_METADATA = "blur_image_metadata",
  ROUND_ENDED = "round_ended",
  SUBMIT_ANSWER = "submit_answer",
  ANSWER_RESULT = "answer_result",
  GAME_FINISHED = "game_finished",
}

export class WebSocketService {
  static current: WebSocketService | null = null;

  ws: WebSocketServer;
  clients: Map<string, ClientInformations>;
  gameService: GameService;
  roomService: WebSocketRoomService;
  imageService: ImageService;
  imageCache: GameImageCacheService;
  roundTimers: Map<number, ReturnType<typeof setTimeout>[]>;
  transitioningRounds: Set<number>;

  constructor(webSocket: WebSocketServer) {
    WebSocketService.current = this;
    this.ws = webSocket;
    this.clients = new Map<string, ClientInformations>();
    this.gameService = new GameService();
    this.roomService = new WebSocketRoomService();
    this.imageService = new ImageService();
    this.imageCache = new GameImageCacheService();
    this.roundTimers = new Map();
    this.transitioningRounds = new Set();
  }

  initialize() {
    this.ws.on("connection", (websocket, request) =>
      this.initConnection(websocket, request)
    );
  }

  initConnection(ws: WebSocket, request: IncomingMessage) {
    const clientId = crypto.randomUUID();

    const user = (request as any).user as User;

    // Store client with metadata
    this.clients.set(clientId, {
      ws,
      user,
      connectedAt: new Date(),
      ipAddress: request.socket.remoteAddress,
    });

    // Send welcome message with client ID
    ws.send(
      JSON.stringify({
        type: "connected",
        clientId,
        message: "Welcome to the WebSocket server",
      })
    );

    this.handleIncommingMessage(ws, request, clientId);
    this.handleConnectionClose(ws, request, clientId);
    this.handleErrors(ws, request, clientId);
  }

  handleIncommingMessage(
    ws: WebSocket,
    request: IncomingMessage,
    clientId: string
  ) {
    ws.on("message", (data) => {
      const message = this.validateRecieveMessage(ws, data);
      if (!message) return;

      switch (message.type) {
        case MessageType.JOIN_ROOM:
          void this.handleJoinRoom(
            ws,
            message as MessageFormat<JoinGameDto>,
            clientId
          );
          break;
        case MessageType.LEAVE_ROOM:
          this.roomService.leaveRoom(
            clientId,
            message as MessageFormat<LeaveGameDto>
          );
          break;
        case MessageType.SUBMIT_ANSWER:
          void this.handleSubmitAnswer(
            ws,
            message as MessageFormat<SubmitAnswerDto>,
            clientId
          );
          break;
        default:
          WebSocketService.sendError(ws, "field 'type' unrecognized");
          break;
      }
    });
  }

  handleConnectionClose(
    ws: WebSocket,
    request: IncomingMessage,
    clientId: string
  ) {
    ws.on("close", () => {
      this.roomService.leaveRoom(clientId);
      this.clients.delete(clientId);
    });
  }

  handleErrors(_ws: WebSocket, _request: IncomingMessage, _clientId: string) {}

  validateRecieveMessage(ws: WebSocket, data: RawData) {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      WebSocketService.sendError(ws, "invalid payload JSON format");
      return null;
    }

    const errors: string[] = [];
    if (!message.type) {
      errors.push("field 'type' is required");
    }
    if (!message.payload) {
      errors.push("field 'payload' is required");
    }
    if (!message.sentAt) {
      errors.push("field 'sentAt' is required");
    }

    if (errors.length > 0) {
      WebSocketService.sendError(ws, errors.join(" - "));

      return null;
    }
    return message;
  }

  static sendError(ws: WebSocket, message: any) {
    ws.send(
      JSON.stringify({
        type: MessageType.ERROR,
        payload: message,
        sentAt: new Date(),
      })
    );
  }

  static sendMessage(ws: WebSocket, message: any, type: MessageType) {
    ws.send(
      JSON.stringify({
        type: type,
        payload: message,
        sentAt: new Date(),
      })
    );
  }

  async startGameLoop(game: Game) {
    const activeRound = this.gameService.gameRoundService.getActiveRound(game);
    if (!activeRound) {
      throw new Error("No active round found");
    }

    await this.startRound(game, activeRound);
  }

  async handleJoinRoom(
    ws: WebSocket,
    message: MessageFormat<JoinGameDto>,
    clientId: string
  ) {
    const gameId = Number(message.payload.gameId);
    const client = this.clients.get(clientId);

    if (!client) {
      WebSocketService.sendError(ws, "WebSocket client not found");
      return;
    }

    try {
      const joined = await this.roomService.joinRoom(message, clientId, client);

      if (!joined) {
        WebSocketService.sendError(ws, "Player is not part of the game");
        return;
      }

      await this.sendCurrentRoundToClient(gameId, clientId);
    } catch (error) {
      WebSocketService.sendError(ws, (error as Error).message);
    }
  }

  async handleSubmitAnswer(
    ws: WebSocket,
    message: MessageFormat<SubmitAnswerDto>,
    clientId: string
  ) {
    const payload = message.payload;

    if (!Number.isInteger(payload.gameRoundId) || payload.gameRoundId <= 0) {
      WebSocketService.sendError(ws, "gameRoundId must be a positive integer");
      return;
    }

    if (typeof payload.answer !== "string" || !payload.answer.trim()) {
      WebSocketService.sendError(ws, "answer must be a non-empty string");
      return;
    }

    const client = this.clients.get(clientId);
    if (!client) {
      WebSocketService.sendError(ws, "WebSocket client not found");
      return;
    }

    try {
      const round = await GameRound.findOne({
        where: { id: payload.gameRoundId },
        relations: {
          game: {
            users: true,
            quiz: {
              questions: true,
            },
          },
          question: true,
        },
      });

      if (!round) {
        throw new Error("Game round not found");
      }

      const result = await this.gameService.submitAnswer(
        payload.gameRoundId,
        payload.answer,
        client.user.id
      );
      WebSocketService.sendMessage(ws, result, MessageType.ANSWER_RESULT);

      if (result.isCorrect) {
        await this.finishRoundAndContinue(round.game, round, client.user.id);
      }
    } catch (error) {
      WebSocketService.sendError(ws, (error as Error).message);
    }
  }

  private async startRound(game: Game, round: GameRound) {
    if (!round.startedAt || !round.endsAt) {
      throw new Error("Game round timer is not initialized");
    }

    if (this.gameService.gameRoundService.isRoundExpired(round)) {
      await this.finishRoundAndContinue(game, round, null);
      return;
    }

    const roundStarted = this.createRoundStartedDto(game, round);
    this.roomService.broadcastMessage(
      game.id,
      roundStarted,
      MessageType.ROUND_STARTED
    );

    const currentStep =
      this.gameService.gameRoundService.getCurrentBlurStep(round);
    await this.broadcastRoundImage(game, round, currentStep);
    this.scheduleRemainingRoundEvents(game.id, round, currentStep);
  }

  private async sendCurrentRoundToClient(gameId: number, clientId: string) {
    const game = await this.gameService.getGameWithInclude(gameId);
    if (game.status !== GameStatus.IN_PROGRESS) return;

    const round = this.gameService.gameRoundService.getActiveRound(game);
    if (!round) return;

    if (this.gameService.gameRoundService.isRoundExpired(round)) {
      await this.finishRoundAndContinue(game, round, null);
      return;
    }

    this.roomService.sendMessageToClient(
      game.id,
      clientId,
      this.createRoundStartedDto(game, round),
      MessageType.ROUND_STARTED
    );

    const currentStep =
      this.gameService.gameRoundService.getCurrentBlurStep(round);
    const { metadata, image } = await this.getRoundImage(
      game,
      round,
      currentStep
    );
    this.roomService.sendImageToClient(game.id, clientId, metadata, image);

    if (!this.roundTimers.has(round.id)) {
      this.scheduleRemainingRoundEvents(game.id, round, currentStep);
    }
  }

  private async broadcastRoundImage(
    game: Game,
    round: GameRound,
    blurStep: number
  ) {
    const { metadata, image } = await this.getRoundImage(game, round, blurStep);
    this.roomService.broadcastImage(game.id, metadata, image);
  }

  private async getRoundImage(game: Game, round: GameRound, blurStep: number) {
    const image = await this.imageCache.getOrCreateImageForRound(
      round.id,
      blurStep,
      () =>
        this.imageService.getImageForBlurStep(round.question.picture, blurStep)
    );

    const metadata: BlurImageMetadataDto = {
      gameId: game.id,
      gameRoundId: round.id,
      roundNumber: round.roundNumber,
      blurStep,
      totalSteps: BLUR_STEPS.length,
      mimeType: "image/jpeg",
      byteLength: image.length,
    };

    return { metadata, image };
  }

  private scheduleRemainingRoundEvents(
    gameId: number,
    round: GameRound,
    currentStep: number
  ) {
    if (!round.startedAt || !round.endsAt) {
      throw new Error("Game round timer is not initialized");
    }

    this.clearRoundTimers(round.id);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const totalDuration = round.endsAt.getTime() - round.startedAt.getTime();
    const stepDuration = totalDuration / BLUR_STEPS.length;

    for (
      let blurStep = currentStep + 1;
      blurStep < BLUR_STEPS.length;
      blurStep++
    ) {
      const targetTime = round.startedAt.getTime() + blurStep * stepDuration;

      timers.push(
        this.createTimer(targetTime, async () => {
          const current = await this.getActiveRound(gameId, round.id);
          if (!current) return;

          await this.broadcastRoundImage(current.game, current.round, blurStep);
        })
      );
    }

    timers.push(
      this.createTimer(round.endsAt.getTime(), async () => {
        const current = await this.getActiveRound(gameId, round.id);
        if (!current) return;

        await this.finishRoundAndContinue(current.game, current.round, null);
      })
    );

    this.roundTimers.set(round.id, timers);
  }

  private async getActiveRound(gameId: number, gameRoundId: number) {
    const game = await this.gameService.getGameWithInclude(gameId);
    const round = game.gameRounds.find(
      (item) => item.id === gameRoundId && item.status === "IN_PROGRESS"
    );

    return round ? { game, round } : null;
  }

  private async finishRoundAndContinue(
    game: Game,
    round: GameRound,
    winnerId: number | null
  ) {
    if (this.transitioningRounds.has(round.id)) return;
    this.transitioningRounds.add(round.id);
    this.clearRoundTimers(round.id);

    try {
      await this.gameService.gameRoundService.finishRound(round, winnerId);

      const roundEnded: RoundEndedDto = {
        roundNumber: round.roundNumber,
        correctAnswer: round.question.response,
        winnerId,
      };
      this.roomService.broadcastMessage(
        game.id,
        roundEnded,
        MessageType.ROUND_ENDED
      );
      this.imageCache.clearCacheForRound(round.id);

      const nextRound = await this.gameService.gameRoundService.startNextRound(
        game,
        round
      );

      if (!nextRound) {
        this.roomService.broadcastMessage(
          game.id,
          { gameId: game.id },
          MessageType.GAME_FINISHED
        );
        return;
      }

      await this.startRound(game, nextRound);
    } finally {
      this.transitioningRounds.delete(round.id);
    }
  }

  private createRoundStartedDto(game: Game, round: GameRound): RoundStartedDto {
    if (!round.startedAt || !round.endsAt) {
      throw new Error("Game round timer is not initialized");
    }

    return {
      gameId: game.id,
      gameRoundId: round.id,
      roundNumber: round.roundNumber,
      question: {
        id: round.question.id,
        statement: round.question.statement,
      },
      startedAt: round.startedAt,
      endsAt: round.endsAt,
    };
  }

  private createTimer(targetTime: number, callback: () => Promise<void>) {
    const delay = Math.max(0, targetTime - Date.now());

    return setTimeout(() => {
      void callback().catch((error) => {
        console.error("Game loop timer error:", error);
      });
    }, delay);
  }

  private clearRoundTimers(gameRoundId: number) {
    const timers = this.roundTimers.get(gameRoundId) ?? [];
    for (const timer of timers) {
      clearTimeout(timer);
    }
    this.roundTimers.delete(gameRoundId);
  }
}
