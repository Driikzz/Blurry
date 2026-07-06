import { Request, Response } from "express";
import { GameService } from "../services/gameService";
import { GameNotFoundException } from "../exceptions/GameNotFoundException";

export class GameController {
  gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  getAll = (req: Request, res: Response) => {
    // ...
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
      const result = await this.gameService.getGameByID(id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof GameNotFoundException) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };

  create = (req: Request, res: Response) => {
    // ...
  };

  update = (req: Request, res: Response) => {
    // ...
  };

  delete = (req: Request, res: Response) => {
    // ...
  };
}
