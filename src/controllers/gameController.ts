import { Request, Response } from "express";
import { GameService } from "../services/gameService";
import { GamePostDto, GamePutDto } from "../dtos/Games";
import { GameStatus } from "../entities/Game";
import { ImageService } from "../services/ImageService";
import { MediaService } from "../services/mediaService";

export class GameController {
  gameService: GameService;
  imageService: ImageService;
  mediaService: MediaService;

  constructor() {
    this.gameService = new GameService();
    this.imageService = new ImageService();
    this.mediaService = new MediaService();
  }

  async getAll(req: Request, res: Response) {
    const games = await this.gameService.getAllQuizWithInclude();

    return res.status(200).json(games);
  }

  async getById(req: Request, res: Response) {
    const gameId = Number(req.params.id);
    if (!gameId) return res.status(400).send();

    const game = await this.gameService.getGameWithInclude(gameId);

    if (!game)
      return res
        .status(404)
        .send({ message: `Game not found with this id: ${gameId}` });

    return res.status(200).json(game.toGameDto());
  }

  async create(req: Request, res: Response) {
    const postData = req.body as GamePostDto;

    await this.gameService.createGame(postData, req.user!);
    return res.status(201).send();
  }

  async startGame(req: Request, res: Response) {
    const gameId = Number(req.params.id);
    if (!gameId) return res.status(400).send();

    const game = await this.gameService.getGameWithInclude(gameId);

    if (!game)
      return res
        .status(404)
        .send({ message: `Game not found with this id: ${gameId}` });

    if (game.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    if (game.status != GameStatus.WAITING) {
      return res.status(400).send({ message: "The game already started" });
    }

    const updatedGame = await this.gameService.startGame(game);
    console.log("🚀 ~ GameController ~ startGame ~ updatedGame:", updatedGame);
    return res.status(200).json(updatedGame.toGameDto());
  }

  async update(req: Request, res: Response) {
    const putData = req.body as GamePutDto;
    const gameId = Number(req.params.id);
    if (!gameId) return res.status(400).send();

    const game = await this.gameService.getGameWithInclude(gameId);

    if (!game)
      return res
        .status(404)
        .send({ message: `Game not found with this id: ${gameId}` });

    if (game.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    await this.gameService.updateGame(game, putData);

    return res.status(204).send();
  }

  async delete(req: Request, res: Response) {
    const gameId = Number(req.params.id);
    if (!gameId) return res.status(400).send();

    const game = await this.gameService.getGameWithInclude(gameId);

    if (!game)
      return res
        .status(404)
        .send({ message: `Game not found with this id: ${gameId}` });

    if (game.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    await this.gameService.deleteGame(game);

    return res.status(204).send();
  }

  async testReturnBlurredImage(req: Request, res: Response) {
    const mediaId = Number(req.params.id);
    const blurAmount = 70;

    try {
      const image = await this.mediaService.getMediaById(mediaId);

      if (!image) {
        return res.status(404).send({ message: "Image not found" });
      }

      const blurredImage = await this.imageService.returnBlurredImage(
        image.path,
        blurAmount
      );
      res.set("Content-Type", "image/jpeg");
      return res.status(200).send(blurredImage);
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error occurred while processing the image" });
    }
  }
}
