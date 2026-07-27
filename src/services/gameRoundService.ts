import {
  BLUR_STEPS,
  DEFAULT_ROUND_DURATION_MS,
} from "../constants/GameConfig";
import { SubmitAnswerResponseDto } from "../dtos/GameRounds";
import { Game, GameStatus } from "../entities/Game";
import { GameRound } from "../entities/GameRound";
import { GameRoundAnswer } from "../entities/GameRoundAswer";
import { Question } from "../entities/Question";

export class GameRoundService {
  async createNewRound(
    game: Game,
    question: Question,
    durationMs = DEFAULT_ROUND_DURATION_MS
  ) {
    const startedAt = new Date();

    const newRound = new GameRound();
    newRound.game = game;
    newRound.gameRoundAnswers = [];
    newRound.question = question;
    newRound.roundNumber = game.currentRound;
    newRound.startedAt = startedAt;
    newRound.endsAt = new Date(startedAt.getTime() + durationMs);
    newRound.endedAt = null;
    newRound.status = "IN_PROGRESS";
    newRound.winnerId = null;

    await newRound.save();
    return newRound;
  }

  getActiveRound(game: Game) {
    return game.gameRounds.find((round) => round.status === "IN_PROGRESS");
  }

  isRoundExpired(round: GameRound, now = new Date()) {
    if (!round.endsAt) return false;

    return now.getTime() >= round.endsAt.getTime();
  }

  finishRound(round: GameRound, winnerId: number | null) {
    if (round.status === "FINISHED") {
      return round;
    }

    round.status = "FINISHED";
    round.endedAt = new Date();
    round.winnerId = winnerId;
    return round.save();
  }

  async submitAnswer(
    gameRoundId: number,
    answer: string,
    userId: number
  ): Promise<SubmitAnswerResponseDto> {
    const gameRound = await GameRound.findOne({
      where: { id: gameRoundId },
      relations: {
        game: {
          users: true,
          quiz: {
            questions: true,
          },
        },
        question: true,
      },
    });

    if (!gameRound) {
      throw new Error("Game round not found");
    }

    if (gameRound.game.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game is not in progress");
    }

    if (gameRound.status !== "IN_PROGRESS") {
      throw new Error("Game round is not in progress");
    }

    const player = gameRound.game.users.find((user) => user.id === userId);

    if (!player) {
      throw new Error("Player is not part of the game");
    }

    if (!gameRound.startedAt || !gameRound.endsAt) {
      throw new Error("Game round timer is not initialized");
    }

    if (!answer.trim()) {
      throw new Error("Answer cannot be empty");
    }

    if (this.isRoundExpired(gameRound)) {
      throw new Error("Game round has expired");
    }

    const submittedAnswer = this.normalizeAnswer(answer);
    const correctAnswer = this.normalizeAnswer(gameRound.question.response);
    const isCorrect = submittedAnswer === correctAnswer;

    const gameRoundAnswer = new GameRoundAnswer();
    gameRoundAnswer.gameRound = gameRound;
    gameRoundAnswer.user = player;
    gameRoundAnswer.answer = answer.trim();
    gameRoundAnswer.isCorrect = isCorrect;

    await gameRoundAnswer.save();

    const responseTimeMs = new Date().getTime() - gameRound.startedAt.getTime();

    if (isCorrect) {
      await this.finishRound(gameRound, userId);
    }

    return {
      isCorrect,
      roundNumber: gameRound.roundNumber,
      responseTimeMs,
    };
  }

  async startNextRound(
    game: Game,
    finishedRound: GameRound
  ): Promise<GameRound | null> {
    const questions = [...game.quiz.questions].sort(
      (firstQuestion, secondQuestion) => firstQuestion.id - secondQuestion.id
    );

    const isLastRound = finishedRound.roundNumber >= questions.length;

    if (isLastRound) {
      game.status = GameStatus.FINISHED;
      await game.save();

      return null;
    }

    game.currentRound = finishedRound.roundNumber + 1;
    await game.save();

    const nextQuestion = questions[game.currentRound - 1];

    if (!nextQuestion) {
      throw new Error("Next question not found");
    }

    return this.createNewRound(game, nextQuestion);
  }

  getCurrentBlurStep(gameRound: GameRound, now = new Date()) {
    if (!gameRound.startedAt || !gameRound.endsAt) {
      throw new Error("Game round timer is not initialized");
    }

    const totalDurationMs =
      gameRound.endsAt.getTime() - gameRound.startedAt.getTime();

    if (totalDurationMs <= 0) {
      throw new Error("Game round duration must be greater than zero");
    }

    const elapsedTimeMs = Math.max(
      0,
      now.getTime() - gameRound.startedAt.getTime()
    );
    const stepCount = BLUR_STEPS.length;
    const stepDurationMs = totalDurationMs / stepCount;

    const currentStep = Math.floor(elapsedTimeMs / stepDurationMs);
    return Math.max(0, Math.min(currentStep, stepCount - 1));
  }

  private normalizeAnswer(answer: string) {
    return answer
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
}
