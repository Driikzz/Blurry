import { In } from "typeorm";
import { GameDto, GamePostDto, GamePutDto, JoinGameDto } from "../dtos/Games";
import { PaginatedResult } from "../dtos/PaginatedResults";
import { Game, GameStatus } from "../entities/Game";
import { Quiz } from "../entities/Quiz";
import { User } from "../entities/User";
import { GameNotFoundException } from "../exceptions/GameNotFoundException";
import { GameRoundService } from "./gameRoundService";
import { MessageFormat } from "../dtos/MessageFormat";
import { WebSocket } from "ws";
import { MessageType, WebSocketService } from "./WebSocketService";

export class GameService {
  gameRoundService: GameRoundService;

  constructor() {
    this.gameRoundService = new GameRoundService();
  }

  async getGameWithInclude(id: number): Promise<Game> {
    const game: Game | null = await Game.findOne({
      where: { id: id },
      relations: {
        createdBy: true,
        users: true,
        quiz: {
          createdBy: true,
          questions: true,
        },
        gameRounds: {
          question: true,
          gameRoundAnswers: true,
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

  async startGame(game: Game) {
    game.status = GameStatus.IN_PROGRESS;
    game.currentPlayer = game.users[0];
    await game.save();
    const createdNewRound = await this.gameRoundService.createNewRound(
      game,
      game.quiz.questions[0]
    );

    game.gameRounds.push(createdNewRound);
    return game;
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
