import type { NextFunction, Request, Response } from "express";

import type { ISignupInput } from "../types";
import {
  sendOtpService,
  userSignupService,
  verifyOtpService
} from "../service/auth";
import { anyOneConditionTrue } from "../utils/common";

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

export const handlePostOtp = async (
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

export const handlePatchOtpVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, otp }: { email: string; otp: number } = req.body;

  const conditions = [
    email === undefined,
    otp === undefined,
    email?.trim() === ""
  ];

  if (anyOneConditionTrue(conditions)) {
    res.statusCode = 400;
    next(new Error("Please provide email and otp"));
  }

  const response = await verifyOtpService(email, otp);

  if (response.error !== null) {
    res.statusCode = response.error.statusCode;
    next(new Error(response.error.message));
  }

  if (response.result !== null) {
    res
      .status(200)
      .cookie("token", response.result.token, {
        maxAge: 600000 // 10 minutes
      })
      .json({
        error: null,
        result: "Email verified"
      });
  }
};
