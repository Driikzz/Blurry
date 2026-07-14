import express, { type Request, type Response } from "express";
import { requireConnected } from "../middlewares/auth.middleware";
import { validatorTest } from "../middlewares/validator.middleware";
import { QuestionController } from "../controllers/questionController";
import {
  QuestionCreateValidator,
  QuestionUpdateValidator,
} from "../dtos/Question";
import multer from "multer";

const router = express.Router();
const controller = new QuestionController();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/jpeg") ||
      file.mimetype.startsWith("image/png") ||
      file.mimetype.startsWith("image/webp")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post(
  "/:id",
  requireConnected,
  upload.single("file"),
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
