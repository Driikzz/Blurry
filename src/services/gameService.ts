import { GameDto } from "../dtos/Games";
import { PaginatedResult } from "../dtos/PaginatedResults";
import { Game } from "../entities/Game";
import { GameNotFoundException } from "../exceptions/GameNotFoundException";

export class GameService {
  async getGameByID(id: number): Promise<GameDto> {
    const game: Game | null = await Game.findOneBy({ id: id });

    if (game == null)
      throw new GameNotFoundException(`game with id ${id} not found`);

    return game.toGameDto();
  }

  async getAllGames(): Promise<PaginatedResult<GameDto>> {
    const [games, total]: [Game[], number] = await Game.findAndCount();

    return {
      totalResult: total,
      page: 0,
      results: games.map((game) => game.toGameDto()),
    };
  }
}
