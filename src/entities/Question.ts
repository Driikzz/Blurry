import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quiz } from "./Quiz";
import { QuestionDto } from "../dtos/Question";

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  statement!: string;

  @Column({ nullable: false })
  response!: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  quiz!: Quiz;

  toQuestionDto(): QuestionDto {
    return {
      id: this.id,
      statement: this.statement,
      response: this.response,
    };
  }
}
