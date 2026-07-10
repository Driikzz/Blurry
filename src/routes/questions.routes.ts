import express, { type Request, type Response } from "express";
import { requireConnected } from "../middlewares/auth.middleware";
import { validatorTest } from "../middlewares/validator.middleware";
import { QuestionController } from "../controllers/questionController";
import {
  QuestionCreateValidator,
  QuestionUpdateValidator,
} from "../dtos/Question";

const router = express.Router();
const controller = new QuestionController();

router.post(
  "/:id",
  requireConnected,
  validatorTest(QuestionCreateValidator),
  (req: Request, res: Response) => controller.AddQuestionToQuiz(req, res)
);
router.put(
  "/:id",
  requireConnected,
  validatorTest(QuestionUpdateValidator),
  (req: Request, res: Response) => controller.UpdateQuestion(req, res)
);
router.delete("/:id", requireConnected, (req: Request, res: Response) =>
  controller.DeleteQuestion(req, res)
);

module.exports = router;
