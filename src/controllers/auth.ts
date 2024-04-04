import type { NextFunction, Request, Response } from "express";

import type { ISignupInput } from "../types";
import {
  gitHubRedirectService,
  googleRedirectService,
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

export const handleGetGoogleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
};

export const handleGetGoogleRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { code } = req.query;

  if (code === undefined) {
    res.statusCode = 500;
    next(new Error("Something went wrong"));
  }

  const response = await googleRedirectService(code as string);

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

export const handleGetGithubLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_REDIRECT_URL = process.env.GITHUB_REDIRECT_URL;

  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&response_type=code&scope=read:user%20user:email&redirect_uri=${GITHUB_REDIRECT_URL}`
  );
};

export const handleGetGithubRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { code } = req.query;

  if (code === undefined) {
    res.statusCode = 500;
    next(new Error("Something went wrong"));
  }

  const result = await gitHubRedirectService(code as string);

  if (result.error !== null) {
    res.statusCode = result.error.statusCode;
    next(new Error(result.error.message));
  }

  res.status(201).json(result);
};
