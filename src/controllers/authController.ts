import { validate } from "class-validator";
import {
  UserCreateValidator,
  UserLoginDto,
  UserLoginValidator,
  UserPostDto,
} from "../dtos/Users";
import { AuthService } from "../services/authService";
import { Request, Response } from "express";

export class AuthController {
  authservice: AuthService;
  crypto: any;
  jwt: any;

  constructor() {
    this.authservice = new AuthService();
    this.crypto = require("crypto");
    this.jwt = require("jsonwebtoken");
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
        const token = this.authservice.createToken(existingUser.id);

        res
          .cookie("token", token, {
            httpOnly: true,
            secure: false,
          })
          .send({ success: true });
      } else {
        return res.status(401).json({ message: "Wrong credentials" });
      }
    } catch (error) {
      return res.status(500).json({
        message: error,
      });
    }
  }

  async logout(req: Request, res: Response) {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure: false,
      })
      .send({ success: true });
  }
}
