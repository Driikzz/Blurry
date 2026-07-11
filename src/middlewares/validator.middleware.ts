import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BaseValidator } from "../dtos/BaseValidator";

export function validatorTest<T extends BaseValidator>(
  ValidatorClass: new () => T
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body === undefined || req.body === null) {
        return res.status(400).json({ error: "Request body is missing" });
      }

      // plain to instance permet de desierialiser les object en profondeurs exemple relation:
      // QuizCreateValidator
      const instance = plainToInstance(ValidatorClass, req.body);

      const errors = await validate(instance);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
