import express, { type Request, type Response } from "express";
import { GameController } from "../controllers/gameController";

const router = express.Router();
const controller = new GameController();

router.get("/:id", (req: Request, res: Response) => controller.getById(req, res));
router.get("/", (req: Request, res: Response) => controller.getAll(req, res));
router.post("/", (req: Request, res: Response) => controller.create(req, res));
router.put("/", (req: Request, res: Response) => controller.update(req, res));
router.delete("/", (req: Request, res: Response) => controller.update(req, res));

module.exports = router;
