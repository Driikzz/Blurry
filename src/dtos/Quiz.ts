import { QuestionDto, QuestionPostDto } from "./Question";
import { UserDto } from "./Users";

export interface QuizDto {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserDto;
  questions: QuestionDto[];
}

export interface QuizPostDto {
  name: string;
  questions: QuestionPostDto[];
}

export interface QuizPutDto {
  name: string;
}
