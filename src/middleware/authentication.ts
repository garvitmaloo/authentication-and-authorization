import type { Request, Response, NextFunction } from "express";

import { verifyJwtToken } from "../utils/jwt";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token: string = req.cookies.token;

  if (token === undefined) {
    res.statusCode = 403;
    next(new Error("You are not authenticated"));
    return;
  }

  try {
    const decoded = verifyJwtToken(token);
    req.params.ownerEmail = decoded.email;
    next();
  } catch (error) {
    res.statusCode = 400;
    next(new Error("Invalid Token"));
  }
};
