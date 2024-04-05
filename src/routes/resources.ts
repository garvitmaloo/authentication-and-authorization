/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import {
  handleGetAllResource,
  handlePostNewResource,
  handleDeleteResource
} from "../controllers/resources";
import { isAuthenticated } from "../middleware/authentication";
import { validateNewResourceInput } from "../middleware/validation";

const resourcesRouter = Router();

resourcesRouter.get("/", isAuthenticated, handleGetAllResource);

resourcesRouter.post(
  "/new",
  isAuthenticated,
  validateNewResourceInput,
  handlePostNewResource
);

resourcesRouter.delete("/:id", isAuthenticated, handleDeleteResource);

export { resourcesRouter };
