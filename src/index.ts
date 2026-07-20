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

  app
    .listen(3000, () => {
      console.log("Server running at PORT: ", 3000);
    })
    .on("error", (error) => {
      throw new Error(error.message);
    });
}

main();
