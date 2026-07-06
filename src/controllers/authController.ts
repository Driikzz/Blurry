import { UserLoginDto, UserPostDto } from "../dtos/Users";
import { AuthService } from "../services/authService";
import { Request, Response } from "express";

export class AuthController {
  authservice: AuthService;
  crypto: any;

  constructor() {
    this.authservice = new AuthService();
    this.crypto = require("crypto");
  }

  async register(req: Request, res: Response) {
    try {
      const datas: UserPostDto = req.body;

      const existingUser = await this.authservice.getUserByEmail(datas.email);
      if (existingUser)
        return res
          .status(409)
          .json({ message: "User already exist with this email" });

      const createdUSer = await this.authservice.createUser(datas);
      return res.status(201).json(createdUSer);
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const datas: UserLoginDto = req.body;

      const existingUser = await this.authservice.getUserByEmail(datas.email);
      if (!existingUser)
        return res
          .status(404)
          .json({ message: "User not found with this email" });

      if (
        this.authservice.verifyPassword(datas.password, existingUser.password)
      ) {
        return res.status(200).json(existingUser.toUserDto());
      } else {
        return res.status(401).json({ message: "Wrong credentials" });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
