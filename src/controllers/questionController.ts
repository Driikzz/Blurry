import { QuestionService } from "../services/questionService";
import { Request, Response } from "express";
import { QuizService } from "../services/quizService";
import { QuestionPostDto, QuestionPutDto } from "../dtos/Question";
import { Media } from "../entities/Media";

export class QuestionController {
  questionService: QuestionService;
  quizService: QuizService;

  constructor() {
    this.questionService = new QuestionService();
    this.quizService = new QuizService();
  }

  async AddQuestionToQuiz(req: Request, res: Response) {
    console.log("🚀 ~ QuestionController ~ AddQuestionToQuiz ~ req:", req);
    const postData = req.body as QuestionPostDto;
    const quizId = Number(req.params.id);
    if (!quizId) return res.status(400).send();

    const quiz = await this.quizService.getQuizWithInclude(quizId);

    if (!quiz)
      return res
        .status(404)
        .send({ message: `Quiz not found with this id: ${quizId}` });

    if (quiz.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const newMedia = new Media();
    newMedia.name = req.file.originalname;
    newMedia.size = req.file.size;
    newMedia.path = req.file.path;

    await this.questionService.AddQuestionToQuiz(quiz, postData, newMedia);
    return res.status(204).send();
  }

  async UpdateQuestion(req: Request, res: Response) {
    const putData = req.body as QuestionPutDto;
    const questionId = Number(req.params.id);
    if (!questionId) return res.status(400).send();

    const question =
      await this.questionService.getQuestionWithInclude(questionId);

    if (!question)
      return res
        .status(404)
        .send({ message: `Question not found with this id: ${questionId}` });

    if (question.quiz.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    await this.questionService.UpdateQuestion(question, putData);

    return res.status(204).send();
  }

  async DeleteQuestion(req: Request, res: Response) {
    const questionId = Number(req.params.id);
    if (!questionId) return res.status(400).send();

    const question =
      await this.questionService.getQuestionWithInclude(questionId);

    if (!question)
      return res
        .status(404)
        .send({ message: `Question not found with this id: ${questionId}` });

    if (question.quiz.createdBy.id != req.user!.id)
      return res.status(403).send({ message: "Forbidden" });

    await this.questionService.DeleteQuestion(question);

    return res.status(204).send();
  }
}
