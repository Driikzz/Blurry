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
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { GameDto } from "../dtos/Games";
import { Quiz } from "./Quiz";
import { GameRound } from "./GameRound";

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

  @Column()
  currentRound!: number;

  @Column()
  status!: GameStatus;

  @ManyToOne(() => User, (user) => user.quiz)
  currentPlayer?: User;

  @OneToMany(() => GameRound, (gameRound) => gameRound.game, { cascade: true })
  gameRounds!: GameRound[];

  toGameDto(): GameDto {
    return {
      id: this.id,
      name: this.name,
      users: this.users.map((u) => u.toUserDto()),
      quiz: this.quiz.toQuizDto(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      currentRound: this.currentRound,
      status: this.status,
      currentPlayer: this.currentPlayer,
      gameRounds: this.gameRounds?.map((gr) => gr.toGameRoundDto()),
    };
  }
}

export enum GameStatus {
  WAITING = 0,
  IN_PROGRESS,
  FINISHED,
}
