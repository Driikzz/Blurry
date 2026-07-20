import { MessageType } from "../services/WebSocketService";

export interface MessageFormat<T> {
  type: MessageType;
  payload: T;
  sentAt: Date;
}
