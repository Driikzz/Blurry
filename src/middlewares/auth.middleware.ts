import { NextFunction, Request, Response } from "express";
import { User } from "../entities/User";

const jwt = require("jsonwebtoken");

export const getUserFromToken = (token: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      async (err: any, decoded: any) => {
        if (err) return reject(err);

        resolve(await User.findOneBy({ id: decoded.userId }));
      }
    );
  });
};

export const requireConnected = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  try {
    req.user = await getUserFromToken(token);
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
};
