import { hash } from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user";
import OTP from "../models/otp";
import type { IStandardResponse, ISignupInput, IUser } from "../types";
import { generateUniqueNumber } from "../utils/common";

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

export const sendOtpService = async (
  email: string
): Promise<IStandardResponse<string>> => {
  const userRecord = await User.findOne({ email });

  if (userRecord === null) {
    return {
      error: {
        message: "No user found with this email",
        statusCode: 400
      },
      result: null
    };
  }

  if (userRecord.emailVerified) {
    return {
      error: {
        message: "Email has already been verified",
        statusCode: 403
      },
      result: null
    };
  }

  // generate otp
  const otp = Number(generateUniqueNumber(6));
  const generatedAt = new Date();

  // send otp via email

  // make/update entry in database
  const otpRecord = await OTP.findOne({ email });

  if (otpRecord === null) {
    const newOtpRecord = new OTP({ otp, email, generatedAt });
    await newOtpRecord.save();
  }

  await OTP.updateOne({ email }, { otp });

  return {
    error: null,
    result: "OTP sent"
  };
};

export const verifyOtpService = async (
  email: string,
  otp: number
): Promise<IStandardResponse<{ token: string }>> => {
  const otpRecord = await OTP.findOne({ email });

  if (otpRecord === null) {
    return {
      error: {
        message: "No user found with this email",
        statusCode: 400
      },
      result: null
    };
  }

  if (otpRecord.otp !== otp) {
    return {
      error: {
        statusCode: 400,
        message: "OTP is incorrect"
      },
      result: null
    };
  }

  // check if OTP has expired
  const currentTimeStamp = new Date().getTime();
  const tokenUpdatedAtTimeStamp = new Date(otpRecord.updatedAt).getTime();
  const TEN_MINUTES_MILLISECONDS = 10 * 60 * 1000;

  if (currentTimeStamp > tokenUpdatedAtTimeStamp + TEN_MINUTES_MILLISECONDS) {
    return {
      error: {
        statusCode: 400,
        message: "OTP has expired"
      },
      result: null
    };
  }

  // update user record and set emailVerified to true
  await User.updateOne({ email }, { emailVerified: true });

  // generate JWT
  if (process.env.JWT_SECRET === undefined) {
    return {
      error: {
        statusCode: 500,
        message: "JWT_SECRET is missing in env variables"
      },
      result: null
    };
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET);

  return {
    result: { token },
    error: null
  };
};
