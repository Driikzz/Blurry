import { IncomingMessage } from "http";
import crypto from "crypto";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { MessageFormat } from "../dtos/MessageFormat";
import { GameService } from "./gameService";
import { JoinGameDto, LeaveGameDto } from "../dtos/Games";
import { User } from "../entities/User";
import { WebSocketRoomService } from "./WebSocketRoomService";

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
}

export class WebSocketService {
  ws: WebSocketServer;
  clients: Map<string, ClientInformations>;
  gameService: GameService;
  roomService: WebSocketRoomService;

  constructor(webSocket: WebSocketServer) {
    this.ws = webSocket;
    this.clients = new Map<string, ClientInformations>();
    this.gameService = new GameService();
    this.roomService = new WebSocketRoomService();
  }

  initialize() {
    this.ws.on("connection", (websocket, request) =>
      this.initConnection(websocket, request)
    );
  }

  initConnection(ws: WebSocket, request: IncomingMessage) {
    const clientId = crypto
      .createHash("sha256")
      .update(new Date().toString())
      .digest("hex");

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
          this.roomService.joinRoom(
            message as MessageFormat<JoinGameDto>,
            clientId,
            this.clients.get(clientId)!
          );
          break;
        case MessageType.LEAVE_ROOM:
          this.roomService.leaveRoom(
            clientId,
            message as MessageFormat<LeaveGameDto>
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
}
