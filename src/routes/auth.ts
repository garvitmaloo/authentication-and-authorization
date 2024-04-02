/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";

import validateSignupInput from "../middleware/validateSignupInput";
import { handlePostSignup, handleGetOtp } from "../controllers/auth";

const authRouter = express.Router();

authRouter.post("/signup", validateSignupInput, handlePostSignup);

authRouter.get("/otp", handleGetOtp);

export { authRouter };
