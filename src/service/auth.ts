import { hash } from "bcrypt";

import User from "../models/user";
import type { IStandardResponse, ISignupInput, IUser } from "../types";

export const userSignupService = async (
  signupDetails: ISignupInput
): Promise<IStandardResponse<IUser>> => {
  const { fullName, email, password } = signupDetails;

  const userRecord = await User.findOne({ email });

  if (userRecord !== null) {
    return {
      result: null,
      error: {
        statusCode: 400,
        message: "User already exists"
      }
    };
  }

  const hashedPassword = await hash(password, 10);

  const user = new User({
    fullName,
    email,
    password: hashedPassword
  });

  await user.save();

  return {
    result: {
      fullName: user.fullName,
      email: user.email,
      emailVerified: user.emailVerified
    },
    error: null
  };
};
