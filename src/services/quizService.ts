import { PaginatedResult } from "../dtos/PaginatedResults";
import { QuizDto, QuizPostDto } from "../dtos/Quiz";
import { Media } from "../entities/Media";
import { Question } from "../entities/Question";
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

  async createQuiz(postData: QuizPostDto, user: User, media: Media) {
    console.log("postData", postData);
    console.log("media", media);
    const newQuiz = new Quiz();
    newQuiz.name = postData.name;
    newQuiz.createdBy = user;
    newQuiz.questions = postData.questions.map((q) => {
      const question = new Question();
      question.statement = q.statement;
      question.response = q.response;
      question.picture = media.path;
      return question;
    });

    await newQuiz.save();
    return newQuiz.toQuizDto();
  }
}
