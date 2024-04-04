import type { Request, Response, NextFunction } from "express";
import validator from "validator";

import { anyOneConditionTrue } from "../utils/common";

const validateNewResourceInput = (
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

export default validateNewResourceInput;
