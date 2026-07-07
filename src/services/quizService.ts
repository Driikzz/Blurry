import { QuizPostDto } from "../dtos/Quiz";
import { Question } from "../entities/Question";
import { Quiz } from "../entities/Quiz";
import { User } from "../entities/User";

export class QuizService {
  async getQuizMinimal(id: number) {
    return await Quiz.findOneBy({ id: id });
  }

  async getQuizWithInclude(id: number) {
    const quiz = await Quiz.findOne({
      where: {
        id: id,
      },
      relations: {
        createdBy: true,
        questions: true,
      },
    });

    if (!quiz) return null;
    return quiz.toQuizDto();
  }

  async createQuiz(postData: QuizPostDto, user: User) {
    const newQuiz = new Quiz();
    newQuiz.name = postData.name;
    newQuiz.createdBy = user;
    newQuiz.questions = postData.questions.map((q) => {
      const question = new Question();
      question.statement = q.statement;
      question.response = q.response;
      return question;
    });

    await newQuiz.save();
    return newQuiz.toQuizDto();
  }
}
