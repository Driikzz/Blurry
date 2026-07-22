import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
  constructor(private readonly userService: UserService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const response = await this.userService.getAll();
      return res.status(200).json(response);
    } catch (error: unknown) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  };

  getById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const response = await this.userService.getById(id);
      return res.status(200).json(response);
    } catch (error: unknown) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  };

  getConnectedUserInfos = async (req: Request, res: Response) => {
    const data = req.user?.toUserDto();
    return res.status(200).json(data);
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userData = req.body;

    if (id !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      if (!userData) {
        return res.status(400).json({ message: "User data is required" });
      }
      const response = await this.userService.update(id, userData);
      return res.status(200).json(response);
    } catch (error: unknown) {
      res.status(500).json({ message: "Error updating user", error });
    }
  };

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (id !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const response = await this.userService.delete(id);
      return res.status(200).json(response);
    } catch (error: unknown) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  };
}
