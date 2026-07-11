import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { GameDto } from "../dtos/Games";
import { Quiz } from "./Quiz";

@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToMany(() => User)
  @JoinTable()
  users!: User[];

  @ManyToOne(() => Quiz, (quiz) => quiz.games)
  quiz!: Quiz;

  @ManyToOne(() => User, (user) => user.quiz)
  createdBy!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toGameDto(): GameDto {
    return {
      id: this.id,
      name: this.name,
      users: this.users.map((u) => u.toUserDto()),
      quiz: this.quiz.toQuizDto(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
    };
  }
}
