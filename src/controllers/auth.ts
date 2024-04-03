import type { NextFunction, Request, Response } from "express";
import axios from "axios";

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
    res.json({
      error: {
        statusCode: 500,
        message: "Something went wrong"
      },
      result: null
    });
    return;
  }

  const { data } = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URL,
    grant_type: "authorization_code"
  });

  const { access_token: accessToken } = data;

  const { data: profile } = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  const { email, name } = profile;

  const response = await userSignupService({ fullName: name, email });

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
