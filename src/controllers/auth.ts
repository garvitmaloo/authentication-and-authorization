import type { NextFunction, Request, Response } from "express";

import type { ISignupInput } from "../types";
import { userSignupService } from "../service/auth";

export const handlePostSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { fullName, email, password }: ISignupInput = req.body;

  const response = await userSignupService({ fullName, email, password });

  if (response.error !== null) {
    res.statusCode = response.error.statusCode;
    next(new Error(response.error.message));
    return;
  }

  res.status(201).json({
    result: response.result,
    error: null
  });
};
