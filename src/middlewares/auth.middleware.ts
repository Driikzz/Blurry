import { NextFunction, Request, Response } from "express";
import { User } from "../entities/User";

const jwt = require("jsonwebtoken");

export const requireConnected = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET_KEY,
    async (err: any, decoded: any) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized access" });
      }

      req.user = await User.findOneBy({ id: decoded.userId });

      next();
    }
  );
};
