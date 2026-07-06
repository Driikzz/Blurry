import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";

const app = express();
const userRouter = require("./routes/users.routes");
const gamesRouter = require("./routes/games.routes");

async function main() {
  await AppDataSource.initialize();

  app.get("/", (request: Request, response: Response) => {
    response.status(200).send("Hello World");
  });

  app.use("/users", userRouter);
  app.use("/games", gamesRouter);

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
