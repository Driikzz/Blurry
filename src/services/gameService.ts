import { In } from "typeorm";
import { GameDto, GamePostDto, GamePutDto } from "../dtos/Games";
import { PaginatedResult } from "../dtos/PaginatedResults";
import { Game, GameStatus } from "../entities/Game";
import { Quiz } from "../entities/Quiz";
import { User } from "../entities/User";
import { GameNotFoundException } from "../exceptions/GameNotFoundException";

export class GameService {
  async getGameWithInclude(id: number): Promise<Game> {
    const game: Game | null = await Game.findOne({
      where: { id: id },
      relations: {
        createdBy: true,
        users: true,
        quiz: {
          createdBy: true,
        },
      },
    });

    if (game == null)
      throw new GameNotFoundException(`game with id ${id} not found`);

    return game;
  }

  async getAllQuizWithInclude(): Promise<PaginatedResult<GameDto>> {
    const [games, total]: [Game[], number] = await Game.findAndCount({
      relations: {
        createdBy: true,
        users: true,
        quiz: {
          createdBy: true,
        },
      },
    });

    return {
      totalResult: total,
      page: 0,
      results: games.map((game) => game.toGameDto()),
    };
  }

  async createGame(postData: GamePostDto, user: User) {
    const quiz = await Quiz.findOneBy({ id: postData.quizId });
    if (!quiz) throw new Error("Quiz not found");

    const users = await User.find({
      where: {
        id: In(postData.userIds),
      },
    });

    const newGame = new Game();
    newGame.name = postData.name;
    newGame.createdBy = user;
    newGame.users = users;
    newGame.quiz = quiz;
    newGame.currentRound = 1;
    newGame.status = GameStatus.WAITING;
    // here we do not set current player util the game begins

    await newGame.save();
  }

  async updateGame(game: Game, putData: GamePutDto) {
    const quiz = await Quiz.findOneBy({ id: putData.quizId });
    if (!quiz) throw new Error("Quiz not found");

    const users = await User.find({
      where: {
        id: In(putData.userIds),
      },
    });

    Object.assign(game, putData);
    game.users = users;
    game.quiz = quiz;

    await game.save();
  }

  async deleteGame(game: Game) {
    await game.remove();
  }
}
