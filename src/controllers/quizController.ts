import { Request, Response } from "express";
import { QuizService } from "../services/quizService";

export class QuizController {
  quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  getAll = async (req: Request, res: Response) => {
    //
  };

  getById = async (req: Request, res: Response) => {
    //
  };

  create = (req: Request, res: Response) => {
    // ...
  };

  update = (req: Request, res: Response) => {
    // ...
  };

  delete = (req: Request, res: Response) => {
    // ...
  };
}
