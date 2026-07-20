import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  MinLength,
} from "class-validator";
import { BaseValidator } from "./BaseValidator";
import { UserDto } from "./Users";
import { QuizDto } from "./Quiz";
import { GameStatus } from "../entities/Game";
import { GameRoundDto } from "./GameRounds";

export interface GameDto {
  id: number;
  name: string;
  users: UserDto[];
  quiz: QuizDto;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserDto;
  currentRound: number;
  status: GameStatus;
  currentPlayer: UserDto | undefined;
  gameRounds: GameRoundDto[];
}

export interface GamePostDto {
  name: string;
  userIds: number[];
  quizId: number;
}

export interface GamePutDto {
  name: string;
  userIds: number[];
  quizId: number;
}

export interface JoinGameDto {
  gameId: number;
  userId: number;
}

// class validatior
export class GameCreateValidator extends BaseValidator {
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  userIds!: number[];

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quizId!: number;
}

export class GameUpdateValidator extends BaseValidator {
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  userIds!: number[];

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quizId!: number;
}
