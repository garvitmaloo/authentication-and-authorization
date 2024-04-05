/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";

import { validateSignupInput } from "../middleware/validation";
import {
  handlePostSignup,
  handlePostOtp,
  handlePatchOtpVerification,
  handleGetGoogleLogin,
  handleGetGoogleRedirect,
  handleGetGithubLogin,
  handleGetGithubRedirect
} from "../controllers/auth";

const authRouter = express.Router();

authRouter.post("/signup", validateSignupInput, handlePostSignup);

authRouter.post("/otp", handlePostOtp);

authRouter.patch("/verify-otp", handlePatchOtpVerification);

authRouter.get("/google", handleGetGoogleLogin);

authRouter.get("/google/redirect", handleGetGoogleRedirect);

authRouter.get("/github", handleGetGithubLogin);

authRouter.get("/github/redirect", handleGetGithubRedirect);

export { authRouter };
