import express from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import bodyParser from "body-parser";
import morgan from "morgan";

import connectToDB from "./config/db";
import { authRouter } from "./routes/auth";
import { handleErrors } from "./middleware/handleErrors";

const app = express();
config();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(morgan("tiny"));

const port = process.env.PORT ?? 9000;

// APP ROUTES
app.use("/api/auth", authRouter);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  handleErrors(error, req, res, next);
});

connectToDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Connected to DB and server running on port ${port}`);
    });
  })
  .catch(() => {
    console.error("Error connecting to DB");
  });
