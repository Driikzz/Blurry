import express, { type Request, type Response } from "express";
import { AuthController } from "../controllers/authController";
import {
  userCreateValidator,
  userLoginValidator,
} from "../middlewares/validator.middleware";

const router = express.Router();
const controller = new AuthController();

router.post("/login", userLoginValidator, (req: Request, res: Response) =>
  controller.login(req, res)
);
router.post("/register", userCreateValidator, (req: Request, res: Response) =>
  controller.register(req, res)
);
router.post("/logout", (req: Request, res: Response) =>
  controller.logout(req, res)
);

module.exports = router;
