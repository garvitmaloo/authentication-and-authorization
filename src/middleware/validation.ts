import validator from "validator";
import type { Request, Response, NextFunction } from "express";

import { anyOneConditionTrue } from "../utils/common";
import type { ISignupInput } from "../types";

export const validateSignupInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { fullName, email, password }: ISignupInput = req.body;

  const fieldsInvalid = anyOneConditionTrue([
    fullName === undefined,
    email === undefined,
    password === undefined,
    fullName?.trim() === "",
    email?.trim() === "",
    password?.trim() === "",
    !validator.isEmail(email),
    !validator.isLength(password!, { min: 8, max: 32 }),
    !validator.isStrongPassword(password!, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
  ]);

  if (fieldsInvalid) {
    res.statusCode = 400;
    next(new Error("Invalid signup input"));
    return;
  }

  next();
};

export const validateNewResourceInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, type }: { name: string; type: string } = req.body;
  const ownerEmail: string = req.params.ownerEmail; // from isAuthenticated middleware

  const conditions = [
    name === undefined,
    name.trim() === "",
    type === undefined,
    type.trim() === "",
    ownerEmail === undefined,
    ownerEmail.trim() === "",
    !validator.isEmail(ownerEmail)
  ];

  if (anyOneConditionTrue(conditions)) {
    res.statusCode = 400;
    next(new Error("Invalid input"));
    return;
  }

  next();
};
