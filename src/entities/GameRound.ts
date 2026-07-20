import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Game } from "./Game";
import { Question } from "./Question";
import { GameRoundAnswer } from "./GameRoundAswer";
import { GameRoundDto } from "../dtos/GameRounds";

@Entity()
export class GameRound extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Game, (game) => game.gameRounds)
  game!: Game;

  @ManyToOne(() => Question, (question) => question.gameRounds)
  question!: Question;

  @OneToMany(
    () => GameRoundAnswer,
    (gameRoundAnswer) => gameRoundAnswer.gameRound,
    {
      cascade: true,
    }
  )
  gameRoundAnswers!: GameRoundAnswer[];

  @Column()
  roundNumber!: number;

  toGameRoundDto(): GameRoundDto {
    return {
      id: this.id,
      question: this.question.toQuestionDto(),
      roundNumber: this.roundNumber,
    };
  }
}
