import type { NextFunction, Request, Response } from "express";
import { fetchAllResourcesService } from "../service/resources";

export const handleGetAllResource = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const email = req.params.ownerEmail;
  const response = await fetchAllResourcesService(email);

  if (response.error !== null) {
    res.statusCode = response.error.statusCode;
    next(new Error(response.error.message));
  }

  res.status(200).json(response);
};
