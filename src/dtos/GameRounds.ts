export type GameRoundStatus = "WAITING" | "IN_PROGRESS" | "FINISHED";

export interface GameQuestionDto {
  id: number;
  statement: string;
}

export interface GameRoundDto {
  id: number;
  question: GameQuestionDto;
  roundNumber: number;
  startedAt: Date | null;
  endsAt: Date | null;
  endedAt: Date | null;
  status: GameRoundStatus;
  winnerId: number | null;
}

export interface RoundStartedDto {
  gameId: number;
  gameRoundId: number;
  roundNumber: number;
  question: GameQuestionDto;
  startedAt: Date;
  endsAt: Date;
}

export interface RoundEndedDto {
  roundNumber: number;
  correctAnswer: string;
  winnerId: number | null;
}

export interface SubmitAnswerDto {
  gameRoundId: number;
  answer: string;
}

export interface SubmitAnswerResponseDto {
  isCorrect: boolean;
  roundNumber: number;
  responseTimeMs: number;
}

export interface BlurImageMetadataDto {
  gameId: number;
  gameRoundId: number;
  roundNumber: number;
  blurStep: number;
  totalSteps: number;
  mimeType: string;
  byteLength: number;
}
