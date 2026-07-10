import { QuestionPostDto, QuestionPutDto } from "../dtos/Question";
import { Question } from "../entities/Question";
import { Quiz } from "../entities/Quiz";

export class QuestionService {
  async getQuestionWithInclude(questionId: number) {
    const question = await Question.findOne({
      where: {
        id: questionId,
      },
      relations: {
        quiz: {
          createdBy: true,
        },
      },
    });

    if (!question) return null;
    return question;
  }

  async AddQuestionToQuiz(quiz: Quiz, postData: QuestionPostDto) {
    const newQuestion = new Question();
    newQuestion.statement = postData.statement;
    newQuestion.response = postData.response;
    newQuestion.quiz = quiz;

    await newQuestion.save();
  }

  async UpdateQuestion(question: Question, putData: QuestionPutDto) {
    Object.assign(question, putData);
    await question.save();
  }

  async DeleteQuestion(question: Question) {
    await question.remove();
  }
}
