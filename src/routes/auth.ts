/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";

import validateSignupInput from "../middleware/validateSignupInput";
import { handlePostSignup } from "../controllers/auth";

const authRouter = express.Router();

authRouter.post("/signup", validateSignupInput, handlePostSignup);

export { authRouter };
