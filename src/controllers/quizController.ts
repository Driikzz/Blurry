import { Request, Response } from "express";
import { QuizService } from "../services/quizService";
import { Quiz } from "../entities/Quiz";
import { QuizPostDto } from "../dtos/Quiz";
import { Question } from "../entities/Question";

export class QuizController {
  quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  getAll = async (req: Request, res: Response) => {
    //
  };

  getById = async (req: Request, res: Response) => {
    const quizId = Number(req.params.id);
    if (!quizId) return res.status(400);

    const quiz = await this.quizService.getQuizWithInclude(quizId);

    if (!quiz)
      return res
        .status(404)
        .send({ message: `Quiz not found with this id: ${quizId}` });

    return res.status(200).json(quiz);
  };

  create = async (req: Request, res: Response) => {
    const postData = req.body as QuizPostDto;

    const response = await this.quizService.createQuiz(postData, req.user!);
    return res.status(201).json(response);
  };

  update = async (req: Request, res: Response) => {
    //
  };

  delete = async (req: Request, res: Response) => {
    const quizId = Number(req.params.id);
    if (!quizId) return res.status(400);

    const quiz = await this.quizService.getQuizMinimal(quizId);

    if (!quiz)
      return res
        .status(404)
        .send({ message: `Quiz not found with this id: ${quizId}` });

    if (quiz.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    await Quiz.delete({ id: quizId });

    return res.status(204);
  };
}
