import { NextFunction, Request, Response } from "express";
import {
  UserCreateValidator,
  UserLoginValidator,
  UserUpdateValidator,
} from "../dtos/Users";
import { validate } from "class-validator";

export const userCreateValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body === undefined || req.body === null) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const userCreateValidator = new UserCreateValidator();

    userCreateValidator.name = req.body.name;
    userCreateValidator.email = req.body.email;
    userCreateValidator.password = req.body.password;

    const errors = await validate(userCreateValidator);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const userUpdateValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body === undefined || req.body === null) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const userUpdateValidator = new UserUpdateValidator();

    userUpdateValidator.name = req.body.name;
    userUpdateValidator.email = req.body.email;
    userUpdateValidator.password = req.body.password;

    const errors = await validate(userUpdateValidator);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const userLoginValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body === undefined || req.body === null) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const userLoginValidator = new UserLoginValidator();

    userLoginValidator.email = req.body.email;
    userLoginValidator.password = req.body.password;

    const errors = await validate(userLoginValidator);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  } catch (error) {
    next(error);
  }
};
