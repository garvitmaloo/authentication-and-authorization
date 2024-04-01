import mongoose from "mongoose";

const connectToDB = async (): Promise<void> => {
  try {
    if (process.env.MONGO_URI !== undefined) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  } catch (err) {
    throw new Error("Error connecting to database");
  }
};

export default connectToDB;
