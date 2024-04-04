import type { NextFunction, Request, Response } from "express";
import {
  fetchAllResourcesService,
  createNewResource
} from "../service/resources";
import type { IResource } from "../types";

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

export const handlePostNewResource = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, type }: { name: string; type: string } = req.body;
  const ownerEmail = req.params.ownerEmail; // from middleware
  const resourceDetails: IResource = {
    name,
    type,
    ownerEmail
  };
  const response = await createNewResource(resourceDetails);

  if (response.error !== null) {
    res.statusCode = response.error.statusCode;
    next(new Error(response.error.message));
  }

  res.status(201).json(response);
};
