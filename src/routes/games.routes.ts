import express, { type Request, type Response } from "express";
import { GameController } from "../controllers/gameController";
import { validatorTest } from "../middlewares/validator.middleware";
import { GameCreateValidator, GameUpdateValidator } from "../dtos/Games";
import { requireConnected } from "../middlewares/auth.middleware";

const router = express.Router();
const controller = new GameController();

router.get("/:id", (req: Request, res: Response) =>
  controller.getById(req, res)
);
router.get("/", (req: Request, res: Response) => controller.getAll(req, res));
router.post(
  "/",
  requireConnected,
  validatorTest(GameCreateValidator),
  (req: Request, res: Response) => controller.create(req, res)
);
router.post("/start/:id", requireConnected, (req: Request, res: Response) =>
  controller.startGame(req, res)
);
router.put(
  "/:id",
  requireConnected,
  validatorTest(GameUpdateValidator),
  (req: Request, res: Response) => controller.update(req, res)
);
router.delete("/:id", requireConnected, (req: Request, res: Response) =>
  controller.delete(req, res)
);

router.get("/test/blurred-image/:id", (req: Request, res: Response) =>
  controller.testReturnBlurredImage(req, res)
);

export default router;
