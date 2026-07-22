import { Game } from "../entities/Game";
import { GameRound } from "../entities/GameRound";
import { Question } from "../entities/Question";

export class GameRoundService {
  async createNewRound(game: Game, question: Question) {
    const newRound = new GameRound();
    newRound.game = game;
    newRound.gameRoundAnswers = [];
    newRound.question = question;
    newRound.roundNumber = game.currentRound;
    await newRound.save();
    return newRound;
  }
}
