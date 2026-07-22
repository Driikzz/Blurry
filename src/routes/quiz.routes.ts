import express, { type Request, type Response } from "express";
import { QuizController } from "../controllers/quizController";
import { requireConnected } from "../middlewares/auth.middleware";
import { validatorTest } from "../middlewares/validator.middleware";
import { QuizCreateValidator } from "../dtos/Quiz";

const router = express.Router();
const controller = new QuizController();

router.get("/:id", requireConnected, (req: Request, res: Response) =>
  controller.getById(req, res)
);

router.get("/", (req: Request, res: Response) => controller.getAll(req, res));

router.post(
  "/",
  requireConnected,
  validatorTest(QuizCreateValidator),
  (req: Request, res: Response) => controller.create(req, res)
);
router.put("/:id", requireConnected, (req: Request, res: Response) =>
  controller.update(req, res)
);
router.delete("/:id", requireConnected, (req: Request, res: Response) =>
  controller.delete(req, res)
);

export default router;
