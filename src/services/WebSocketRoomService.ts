import { JoinGameDto, LeaveGameDto } from "../dtos/Games";
import { BlurImageMetadataDto } from "../dtos/GameRounds";
import { MessageFormat } from "../dtos/MessageFormat";
import { GameService } from "./gameService";
import {
  ClientInformations,
  MessageType,
  WebSocketService,
} from "./WebSocketService";

export class WebSocketRoomService {
  rooms: Map<number, Map<string, ClientInformations>>;
  gameService: GameService;

  constructor() {
    this.rooms = new Map<number, Map<string, ClientInformations>>();
    this.gameService = new GameService();
  }

  async joinRoom(
    message: MessageFormat<JoinGameDto>,
    clientId: string,
    clientInformations: ClientInformations
  ): Promise<boolean> {
    const gameId = message.payload.gameId;
    const game = await this.gameService.getGameWithInclude(gameId);

    if (
      game.users.find((u) => u.id == clientInformations.user.id) == null &&
      game.createdBy.id != clientInformations.user.id
    )
      return false;

    if (!this.rooms.has(gameId)) {
      this.rooms.set(gameId, new Map());
    }

    this.rooms.get(gameId)!.set(clientId, clientInformations);
    this.broadcastMessage(
      gameId,
      `a new member joined your room, the room is now with ${this.getRoomSize(gameId)}`,
      MessageType.JOIN_ROOM,
      null
    );

    return true;
  }

  async leaveRoom(
    clientId: string,
    message: MessageFormat<LeaveGameDto> | undefined = undefined
  ) {
    let gameId: number | null | undefined;
    if (message) {
      gameId = message.payload.gameId;
    } else {
      gameId = this.getRoomByClientId(clientId);
    }

    const room = gameId ? this.rooms.get(gameId) : null;
    if (!room || !gameId) return;
    room.delete(clientId);

    if (room.size === 0) {
      this.rooms.delete(gameId);
    } else {
      this.broadcastMessage(
        gameId,
        `a member left your room, the room is now with ${this.getRoomSize(gameId)}`,
        MessageType.LEAVE_ROOM,
        null
      );
    }
  }

  broadcastMessage(
    roomId: number,
    message: any,
    messageType: MessageType,
    excludeClientId: string | null = null
  ) {
    const room = this.rooms.get(roomId);

    if (!room) return 0;
    let sent = 0;

    for (const [clientId, clientInfos] of room) {
      const ws = clientInfos.ws;
      if (clientId != excludeClientId && ws.readyState === 1) {
        WebSocketService.sendMessage(ws, message, messageType);
        sent++;
      }
    }

    return sent;
  }

  broadcastImage(
    roomId: number,
    metadata: BlurImageMetadataDto,
    image: Buffer
  ) {
    const room = this.rooms.get(roomId);
    if (!room) return 0;

    let sent = 0;
    for (const client of room.values()) {
      if (client.ws.readyState !== 1) continue;

      WebSocketService.sendMessage(
        client.ws,
        metadata,
        MessageType.BLUR_IMAGE_METADATA
      );
      client.ws.send(image, { binary: true });
      sent++;
    }

    return sent;
  }

  sendMessageToClient(
    roomId: number,
    clientId: string,
    message: any,
    messageType: MessageType
  ) {
    const client = this.rooms.get(roomId)?.get(clientId);
    if (!client || client.ws.readyState !== 1) return false;

    WebSocketService.sendMessage(client.ws, message, messageType);
    return true;
  }

  sendImageToClient(
    roomId: number,
    clientId: string,
    metadata: BlurImageMetadataDto,
    image: Buffer
  ) {
    const client = this.rooms.get(roomId)?.get(clientId);
    if (!client || client.ws.readyState !== 1) return false;

    WebSocketService.sendMessage(
      client.ws,
      metadata,
      MessageType.BLUR_IMAGE_METADATA
    );
    client.ws.send(image, { binary: true });
    return true;
  }

  getRoomSize(roomId: number) {
    const room = this.rooms.get(roomId);
    return room ? room.size : 0;
  }

  getRoomByClientId(clientId: string): null | number {
    for (const [gameId, clientMap] of this.rooms) {
      if (clientMap.has(clientId)) {
        return gameId;
      }
    }

    return null;
  }
}
