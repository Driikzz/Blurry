import { PaginatedResult } from "../dtos/PaginatedResults";
import { QuizDto, QuizPostDto } from "../dtos/Quiz";
import { Quiz } from "../entities/Quiz";
import { User } from "../entities/User";

export class QuizService {
  async getQuizMinimal(id: number) {
    return await Quiz.findOneBy({ id: id });
  }

  async getQuizWithInclude(id: number, isQuestionsInclude: boolean = false) {
    const quiz = await Quiz.findOne({
      where: {
        id: id,
      },
      relations: {
        createdBy: true,
        questions: isQuestionsInclude,
      },
    });

    if (!quiz) return null;
    return quiz;
  }

  async getAllQuizWithInclude(
    isQuestionsInclude: boolean = false
  ): Promise<PaginatedResult<QuizDto>> {
    const [quizz, total]: [Quiz[], number] = await Quiz.findAndCount({
      relations: {
        questions: isQuestionsInclude,
        createdBy: true,
      },
    });

    return {
      totalResult: total,
      page: 0,
      results: quizz.map((quiz) => quiz.toQuizDto()),
    };
  }

  async createQuiz(postData: QuizPostDto, user: User) {
    const newQuiz = new Quiz();
    newQuiz.name = postData.name;
    newQuiz.createdBy = user;

    await newQuiz.save();
    return newQuiz.toQuizDto();
  }
}
