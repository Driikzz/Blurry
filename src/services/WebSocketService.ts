import { IncomingMessage } from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { MessageFormat } from "../dtos/MessageFormat";
import { GameService } from "./gameService";
import { JoinGameDto } from "../dtos/Games";

export interface ClientInformations {
  ws: WebSocket;
  connectedAt: Date;
  ipAddress: string | undefined;
}

export enum MessageType {
  ERROR = "error",
  JOIN_ROOM = "join_room",
}

export class WebSocketService {
  ws: WebSocketServer;
  clients: Map<string, ClientInformations>;
  crypto: any;
  gameService: GameService;

  constructor(webSocket: WebSocketServer) {
    this.ws = webSocket;
    this.clients = new Map<string, ClientInformations>();
    this.crypto = require("crypto");
    this.gameService = new GameService();
  }

  initialize() {
    this.ws.on("connection", (websocket, request) =>
      this.initConnection(websocket, request)
    );
  }

  initConnection(ws: WebSocket, request: IncomingMessage) {
    const clientId = this.crypto
      .createHash("sha256")
      .update(new Date().toString())
      .digest("hex");

    // Store client with metadata
    this.clients.set(clientId, {
      ws,
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
          this.gameService.joinRoom(ws, message as MessageFormat<JoinGameDto>);
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
  ) {}

  handleErrors(ws: WebSocket, request: IncomingMessage, clientId: string) {}

  validateRecieveMessage(ws: WebSocket, data: RawData) {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (error) {
      WebSocketService.sendError(ws, "invalid payload JSON format");
    }

    let errors: string[] = [];
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
