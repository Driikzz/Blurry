import { GameDto } from "../dtos/Games";
import { PaginatedResult } from "../dtos/PaginatedResults";
import { Game } from "../entities/Game";
import { GameNotFoundException } from "../exceptions/GameNotFoundException";

export class GameService {
  async getGameByID(id: number): Promise<Game> {
    const game: Game | null = await Game.findOneBy({ id: id });

    if (game == null)
      throw new GameNotFoundException(`game with id ${id} not found`);

    return game;
  }

  async getAllGames(): Promise<PaginatedResult<GameDto>> {
    const games: [Game[], number] = await Game.findAndCount();

    const results: PaginatedResult<GameDto> = {
      totalResult: games[1],
      page: 0,
      results: games,
    };
    return results;
  }
}
