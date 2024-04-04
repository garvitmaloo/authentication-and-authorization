import { hash } from "bcrypt";
import type { SendEmailRequest } from "aws-sdk/clients/ses";
import axios from "axios";

import User from "../models/user";
import OTP from "../models/otp";
import type { IStandardResponse, ISignupInput, IUser } from "../types";
import { generateUniqueNumber } from "../utils/common";
import { AWS } from "../config/aws-sdk";
import { generateJwtToken } from "../utils/jwt";

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

  // password undefined for users being created by OAuth
  if (password === undefined) {
    const OAuthUser = new User({
      fullName,
      email,
      emailVerified: true
    });

    await OAuthUser.save();

    return {
      result: {
        fullName: OAuthUser.fullName,
        email: OAuthUser.email,
        emailVerified: OAuthUser.emailVerified
      },
      error: null
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
  try {
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

    if (process.env.SOURCE_EMAIL_ADDRESS === undefined) {
      return {
        error: {
          statusCode: 500,
          message: "SOURCE_EMAIL_ADDRESS not found in env"
        },
        result: null
      };
    }

    // send otp via email - will not send email in "sandbox" mode. Use "production" mode for sending email.
    const params: SendEmailRequest = {
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `Your OTP is ${otp}`
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: "OTP for Signup"
        }
      },
      Source: process.env.SOURCE_EMAIL_ADDRESS
    };

    const sendEmailPromise = new AWS.SES().sendEmail(params).promise();
    await sendEmailPromise;

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
  } catch (err) {
    console.error("Something went wrong while sending OTP - ", err);
    return {
      error: {
        statusCode: 500,
        message: "Something went wrong while sending OTP."
      },
      result: null
    };
  }
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
  const token = generateJwtToken({ email });

  return {
    result: { token },
    error: null
  };
};

export const googleRedirectService = async (
  code: string
): Promise<IStandardResponse<IUser & { token: string }>> => {
  try {
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

    // generate jwt token
    const token = generateJwtToken({ email });

    return {
      error: response.error,
      result: {
        email,
        fullName: name,
        emailVerified: true,
        token
      }
    };
  } catch (err) {
    return {
      error: {
        statusCode: 500,
        message: (err as Error).message
      },
      result: null
    };
  }
};

export const gitHubRedirectService = async (
  code: string
): Promise<IStandardResponse<IUser & { token: string }>> => {
  try {
    const { data }: { data: string } = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      }
    );

    const accessToken = data.split("=")[1].split("&")[0];

    const axiosGetUserInfoHeaders = {
      headers: {
        Authorization: "Bearer " + accessToken
      }
    };
    const promises = Promise.all([
      axios.get("https://api.github.com/user", axiosGetUserInfoHeaders),
      axios.get("https://api.github.com/user/emails", axiosGetUserInfoHeaders)
    ]);

    const response = await promises;
    const {
      data: { name }
    } = response[0];
    const { data: userEmails } = response[1];
    const primaryEmail: string = userEmails.find((e: any) => e.primary)?.email;

    const result = await userSignupService({
      fullName: name,
      email: primaryEmail
    });

    // generate jwt token
    const token = generateJwtToken({ email: primaryEmail });

    return {
      error: result.error,
      result: {
        fullName: name,
        email: primaryEmail,
        emailVerified: true,
        token
      }
    };
  } catch (err) {
    return {
      error: {
        statusCode: 500,
        message: (err as Error).message
      },
      result: null
    };
  }
};
