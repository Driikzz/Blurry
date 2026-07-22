import { IsNotEmpty, MinLength } from "class-validator";
import { BaseValidator } from "./BaseValidator";
import { QuestionDto } from "./Question";
import { UserDto } from "./Users";

export interface QuizDto {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserDto;
  questions?: QuestionDto[];
}

export interface QuizPostDto {
  name: string;
}

export interface QuizPutDto {
  name: string;
}

// Class validator

export class QuizCreateValidator extends BaseValidator {
  @IsNotEmpty()
  @MinLength(3)
  name!: string;
}
