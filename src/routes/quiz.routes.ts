import express, { type Request, type Response } from "express";
import { QuizController } from "../controllers/quizController";
import { requireConnected } from "../middlewares/auth.middleware";
import { validatorTest } from "../middlewares/validator.middleware";
import { QuizCreateValidator } from "../dtos/Quiz";
import multer from "multer";

const router = express.Router();
const controller = new QuizController();

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
      file.mimetype.startsWith("image/png")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.get("/:id", requireConnected, (req: Request, res: Response) =>
  controller.getById(req, res)
);

router.get("/", (req: Request, res: Response) => controller.getAll(req, res));

router.post(
  "/",
  requireConnected,
  validatorTest(QuizCreateValidator),
  upload.single("file"),
  (req: Request, res: Response) => controller.create(req, res)
);
router.put("/:id", requireConnected, (req: Request, res: Response) =>
  controller.update(req, res)
);
router.delete("/:id", requireConnected, (req: Request, res: Response) =>
  controller.delete(req, res)
);

module.exports = router;
