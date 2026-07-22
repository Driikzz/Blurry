import express, { type Request, type Response } from "express";
import { MediaController } from "../controllers/mediaController";
import { requireConnected } from "../middlewares/auth.middleware";

const router = express.Router();
const controller = new MediaController();

router.delete("/:id", requireConnected, (req: Request, res: Response) =>
  controller.deleteMedia(req, res)
);

export default router;
