import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quiz } from "./Quiz";
import { QuestionDto } from "../dtos/Question";
import { GameRound } from "./GameRound";

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  picture!: string;

  @Column({ nullable: false })
  statement!: string;

  @Column({ nullable: false })
  response!: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: "CASCADE" })
  quiz!: Quiz;

  @OneToMany(() => GameRound, (gameRound) => gameRound.question, {
    cascade: true,
  })
  gameRounds!: GameRound[];

  toQuestionDto(): QuestionDto {
    return {
      id: this.id,
      statement: this.statement,
      picture: this.picture,
      response: this.response,
    };
  }
}
