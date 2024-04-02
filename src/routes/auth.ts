/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";

import validateSignupInput from "../middleware/validateSignupInput";
import {
  handlePostSignup,
  handlePostOtp,
  handlePatchOtpVerification
} from "../controllers/auth";

const authRouter = express.Router();

authRouter.post("/signup", validateSignupInput, handlePostSignup);

authRouter.post("/otp", handlePostOtp);

authRouter.patch("/verify-otp", handlePatchOtpVerification);

export { authRouter };
