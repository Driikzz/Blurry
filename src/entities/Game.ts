import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { GameDto } from "../dtos/Games";

@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToMany(() => User)
  @JoinTable()
  users!: User[];

  toGameDto(): GameDto {
    return {
      id: this.id,
      name: this.name,
      users: [], // TODO change
    };
  }
}
