/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import {
  handleGetAllResource,
  handlePostNewResource
} from "../controllers/resources";
import { isAuthenticated } from "../middleware/authentication";
import validateNewResourceInput from "../middleware/validateNewResourceInput";

const resourcesRouter = Router();

resourcesRouter.get("/", isAuthenticated, handleGetAllResource);

resourcesRouter.post(
  "/new",
  isAuthenticated,
  validateNewResourceInput,
  handlePostNewResource
);

export { resourcesRouter };
