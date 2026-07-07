import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { UserController } from "../controllers/userController";
import { UserService } from "../services/userService";
import { requireConnected } from "../middlewares/auth.middleware";
import { userUpdateValidator } from "../middlewares/validator.middleware";

const router = express.Router();
const service = new UserService();
const controller = new UserController(service);

router.get("/me", requireConnected, (req: Request, res: Response) =>
  controller.getConnectedUserInfos(req, res)
);

router.get("/:id", (req: Request, res: Response) =>
  controller.getById(req, res)
);

router.get("/", (req: Request, res: Response) => controller.getAll(req, res));

router.put("/:id", userUpdateValidator, (req: Request, res: Response) =>
  controller.update(req, res)
);

router.delete("/:id", (req: Request, res: Response) =>
  controller.delete(req, res)
);

module.exports = router;
