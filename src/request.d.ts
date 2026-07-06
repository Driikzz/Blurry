import { User } from "./entities/User";
import "express";

declare module "express" {
  interface Request {
    user?: User | undefined | null;
  }
}
