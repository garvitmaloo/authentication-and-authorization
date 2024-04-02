import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    otp: {
      type: Number,
      required: true
    },
    generatedAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
