import { Request, Response } from "express";
import { userService } from "../services/userService";

export class UserController {
  constructor(private readonly userService: userService) {}

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

  create = async (req: Request, res: Response) => {
    const userData = req.body;
    try {
      if (!userData) {
        return res.status(400).json({ message: "User data is required" });
      }
      const response = await this.userService.create(userData);
      return res.status(201).json(response);
    } catch (error: unknown) {
      res.status(500).json({ message: "Error creating user", error });
    }
  };

  update = async (req: Request, res: Response) => {
    // const id = req.params.id;
    // const userData = req.body;
    // try {
    //   if (!userData) {
    //     return res.status(400).json({ message: "User data is required" });
    //   }
    //   const response = await this.userService.update(id, userData);
    //   return res.status(200).json(response);
    // } catch (error: unknown) {
    //   res.status(500).json({ message: "Error updating user", error });
    // }
  };

  delete = async (req: Request, res: Response) => {
    // const id = req.params.id;
    // try {
    //   const response = await this.userService.delete(id);
    //   return res.status(200).json(response);
    // } catch (error: unknown) {
    //   res.status(500).json({ message: "Error deleting user", error });
    // }
  };
}
