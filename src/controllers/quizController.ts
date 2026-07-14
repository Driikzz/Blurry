import { Request, Response } from "express";
import { QuizService } from "../services/quizService";
import { Quiz } from "../entities/Quiz";
import { QuizPostDto, QuizPutDto } from "../dtos/Quiz";
import { Question } from "../entities/Question";
import { Media } from "../entities/Media";

export class QuizController {
  quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  getAll = async (req: Request, res: Response) => {
    const quiz = await this.quizService.getAllQuizWithInclude();

    return res.status(200).json(quiz);
  };

  getById = async (req: Request, res: Response) => {
    const quizId = Number(req.params.id);
    if (!quizId) return res.status(400).send();

    const quiz = await this.quizService.getQuizWithInclude(quizId, true);

    if (!quiz)
      return res
        .status(404)
        .send({ message: `Quiz not found with this id: ${quizId}` });

    return res.status(200).json(quiz.toQuizDto());
  };

  create = async (req: Request, res: Response) => {
    const postData = req.body as QuizPostDto;

    console.log("postData", postData);

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const newMedia = new Media();
    newMedia.name = req.file.originalname;
    newMedia.size = req.file.size;
    newMedia.path = req.file.path;

    if (req.body.questions && typeof req.body.questions === "string") {
      postData.questions = JSON.parse(req.body.questions);
    } else {
      return res.status(400).json({ message: "Questions are required" });
    }

    const response = await this.quizService.createQuiz(
      postData,
      req.user!,
      newMedia
    );
    return res.status(201).json(response);
  };

  update = async (req: Request, res: Response) => {
    const putData = req.body as QuizPutDto;
    const quizId = Number(req.params.id);
    if (!quizId) return res.status(400).send();

    const quiz = await this.quizService.getQuizWithInclude(quizId);

    if (!quiz)
      return res
        .status(404)
        .send({ message: `Quiz not found with this id: ${quizId}` });

    if (quiz.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    await Quiz.update({ id: quizId }, { name: putData.name });

    return res.status(204).send();
  };

  delete = async (req: Request, res: Response) => {
    const quizId = Number(req.params.id);
    if (!quizId) return res.status(400).send();

    const quiz = await this.quizService.getQuizWithInclude(quizId);

    if (!quiz)
      return res
        .status(404)
        .send({ message: `Quiz not found with this id: ${quizId}` });

    if (quiz.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    await Quiz.delete({ id: quizId });

    return res.status(204).send();
  };
}
