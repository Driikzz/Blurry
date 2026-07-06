import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { UserController } from "../controllers/userController";
import { userService } from "../services/userService";

const router = express.Router();
const service = new userService();
const controller = new UserController(service);

router.get("/:id", (req: Request, res: Response) =>
  controller.getById(req, res)
);

router.get("/", (req: Request, res: Response) => controller.getAll(req, res));

router.post("/", (req: Request, res: Response) => controller.create(req, res));

router.put("/:id", (req: Request, res: Response) =>
  controller.update(req, res)
);

router.delete("/:id", (req: Request, res: Response) =>
  controller.delete(req, res)
);

module.exports = router;
