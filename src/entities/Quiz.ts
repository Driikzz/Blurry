import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Question } from "./Question";
import { QuizDto } from "../dtos/Quiz";
import { Game } from "./Game";

@Entity()
export class Quiz extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions!: Question[];

  @ManyToOne(() => User, (user) => user.quiz)
  createdBy!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Game, (game) => game.quiz, { cascade: false })
  games!: Game[];

  toQuizDto(): QuizDto {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy.toUserDto(),
      questions: this.questions?.map((q) => q.toQuestionDto()),
    };
  }
}
