import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import bodyParser from "body-parser";
import type { Request, Response } from "express";
import morgan from "morgan";

import connectToDB from "./config/db";

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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
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
