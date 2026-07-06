import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quiz } from "./Quiz";

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
}
