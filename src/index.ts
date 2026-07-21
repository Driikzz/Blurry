import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { AppDataSource } from "./data-source";

const app = express();
app.use(express.json());
app.use(cookieParser());
const userRouter = require("./routes/users.routes");
const gamesRouter = require("./routes/games.routes");
const quizRouter = require("./routes/quiz.routes");
const authRouter = require("./routes/auth.routes");
const questionsRouter = require("./routes/questions.routes");
const mediasRouter = require("./routes/medias.routes");
require("dotenv").config();
import path from "path";
import { createServer, IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { WebSocketService } from "./services/WebSocketService";
import { getUserFromToken } from "./middlewares/auth.middleware";

function parseCookies(header?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  header.split(";").forEach((pair) => {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex === -1) return;

    const name = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();
    cookies[name] = decodeURIComponent(value);
  });

  return cookies;
}

async function main() {
  await AppDataSource.initialize();

  app.get("/", (request: Request, response: Response) => {
    response.status(200).send("Hello World");
  });

  app.get("/health", (request: Request, response: Response) => {
    response.status(200).json({ status: "ok" });
  });

  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use("/users", userRouter);
  app.use("/games", gamesRouter);
  app.use("/quiz", quizRouter);
  app.use("/auth", authRouter);
  app.use("/questions", questionsRouter);
  app.use("/medias", mediasRouter);

  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  const server = createServer(app);
  const ws = new WebSocketServer({ noServer: true });

  const wsService = new WebSocketService(ws);
  wsService.initialize();

  server.on("upgrade", async (request: IncomingMessage, socket, head) => {
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies.token;

    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    try {
      const user = await getUserFromToken(token);
      if (!user) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      (request as any).user = user;

      ws.handleUpgrade(request, socket, head, (websocket) => {
        ws.emit("connection", websocket, request);
      });
    } catch (error) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  });

  server
    .listen(3000, () => {
      console.log("Server running at PORT: ", 3000);
    })
    .on("error", (error) => {
      throw new Error(error.message);
    });
}

main();
