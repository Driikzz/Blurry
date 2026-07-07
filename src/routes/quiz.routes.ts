import express, { type Request, type Response } from "express";
import { QuizController } from "../controllers/quizController";
import { requireConnected } from "../middlewares/auth.middleware";

const router = express.Router();
const controller = new QuizController();

router.get("/:id", requireConnected, (req: Request, res: Response) =>
  controller.getById(req, res)
);
router.get("/", (req: Request, res: Response) => controller.getAll(req, res));
router.post("/", requireConnected, (req: Request, res: Response) =>
  controller.create(req, res)
);
router.put("/:id", requireConnected, (req: Request, res: Response) =>
  controller.update(req, res)
);
router.delete("/:id", requireConnected, (req: Request, res: Response) =>
  controller.update(req, res)
);

module.exports = router;
