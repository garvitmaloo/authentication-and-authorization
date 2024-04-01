import type { NextFunction, Request, Response } from "express";

export const handleErrors = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    result: null,
    error: {
      statusCode,
      message: error.message
    }
  });
  next();
};
