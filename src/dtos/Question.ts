import { IsArray, IsNotEmpty, MinLength } from "class-validator";
import { BaseValidator } from "./BaseValidator";

export interface QuestionDto {
  id: number;
  statement: string;
  picture: string;
  response: string;
}

export interface QuestionPostDto {
  statement: string;
  picture: string;
  response: string;
}

export interface QuestionPutDto {
  statement: string;
  response: string;
}

// Class validator

export class QuestionCreateValidator extends BaseValidator {
  @IsNotEmpty()
  @MinLength(3)
  statement!: string;

  @IsNotEmpty()
  @MinLength(1)
  response!: string;
}

export class QuestionUpdateValidator extends BaseValidator {
  @IsNotEmpty()
  @MinLength(3)
  statement!: string;

  @IsNotEmpty()
  @MinLength(1)
  response!: string;
}
