import type { NextFunction, Request, Response } from "express";

import type { ISignupInput } from "../types";
import { sendOtpService, userSignupService } from "../service/auth";

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

export const handleGetOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email }: { email: string } = req.body;

  if (email === undefined || email.trim() === "") {
    res.statusCode = 400;
    next(new Error("Email is required"));
    return;
  }

  const response = await sendOtpService(email);

  if (response.error !== null) {
    res.statusCode = response.error.statusCode;
    next(new Error(response.error.message));
    return;
  }

  res.status(200).json(response);
};
