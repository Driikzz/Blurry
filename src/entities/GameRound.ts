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
import { GameRoundDto, GameRoundStatus } from "../dtos/GameRounds";

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

  @Column({ type: "timestamp", nullable: true })
  startedAt!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endsAt!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endedAt!: Date | null;

  @Column({ default: "WAITING" })
  status!: GameRoundStatus;

  @Column({ type: "int", nullable: true })
  winnerId!: number | null;

  toGameRoundDto(): GameRoundDto {
    return {
      id: this.id,
      question: {
        id: this.question.id,
        statement: this.question.statement,
      },
      roundNumber: this.roundNumber,
      startedAt: this.startedAt,
      endsAt: this.endsAt,
      endedAt: this.endedAt,
      status: this.status,
      winnerId: this.winnerId,
    };
  }
}
