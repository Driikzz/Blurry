import { QuestionDto } from "./Question";

export interface GameRoundDto {
  id: number;
  question: QuestionDto;
  roundNumber: number;
}
