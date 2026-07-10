import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseValidator } from "./BaseValidator";
import {
  QuestionCreateValidator,
  QuestionDto,
  QuestionPostDto,
} from "./Question";
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
  questions: QuestionPostDto[];
}

export interface QuizPutDto {
  name: string;
}

// Class validator

export class QuizCreateValidator extends BaseValidator {
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionCreateValidator)
  questions!: QuestionPostDto[];
}
