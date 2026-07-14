import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GameRound } from "./GameRound";
import { User } from "./User";

@Entity()
export class GameRoundAnswer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => GameRound, (gameRound) => gameRound.gameRoundAnswers)
  gameRound!: GameRound;

  @ManyToOne(() => User, (user) => user.gameRoundAnswers)
  user!: User;

  @Column()
  answer!: string;

  @Column()
  isCorrect!: boolean;

  @CreateDateColumn()
  answeredAt!: Date;
}
