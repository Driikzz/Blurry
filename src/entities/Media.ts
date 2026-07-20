import { rmSync } from "node:fs";
import {
  AfterRemove,
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Media extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  size!: number;

  @Column()
  path!: string;

  @AfterRemove()
  deleteFile() {
    try {
      rmSync(this.path);
    } catch (error) {
      console.error(`Failed to delete file at ${this.path}:`, error);
    }
  }
}
