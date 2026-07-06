import express, { type Request, type Response } from "express";
import { AuthController } from "../controllers/authController";

const router = express.Router();
const controller = new AuthController();

router.post("/login", (req: Request, res: Response) =>
  controller.login(req, res)
);
router.post("/register", (req: Request, res: Response) =>
  controller.register(req, res)
);

module.exports = router;
