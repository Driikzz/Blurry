import express, { type Request, type Response } from "express";
import { AuthController } from "../controllers/authController";
import { validatorTest } from "../middlewares/validator.middleware";
import { UserCreateValidator, UserLoginValidator } from "../dtos/Users";

const router = express.Router();
const controller = new AuthController();

router.post(
  "/login",
  validatorTest(UserLoginValidator),
  (req: Request, res: Response) => controller.login(req, res)
);
router.post(
  "/register",
  validatorTest(UserCreateValidator),
  (req: Request, res: Response) => controller.register(req, res)
);
router.post("/logout", (req: Request, res: Response) =>
  controller.logout(req, res)
);

export default router;
