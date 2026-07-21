import { JoinGameDto, LeaveGameDto } from "../dtos/Games";
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
  ) {
    const gameId = message.payload.gameId;
    const game = await this.gameService.getGameWithInclude(gameId);

    if (
      game.users.find((u) => u.id == clientInformations.user.id) == null &&
      game.createdBy.id != clientInformations.user.id
    )
      return;

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
  }

  async leaveRoom(
    clientId: string,
    message: MessageFormat<LeaveGameDto> | undefined = undefined
  ) {
    let room: Map<string, ClientInformations> | null | undefined = null;
    let gameId: number | null | undefined = null;
    if (message) {
      gameId = message.payload.gameId;
    } else {
      gameId = this.getRoomByClientId(clientId);
    }

    room = gameId ? this.rooms.get(gameId) : null;
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
