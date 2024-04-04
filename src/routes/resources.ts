/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import { handleGetAllResource } from "../controllers/resources";
import { isAuthenticated } from "../middleware/authentication";

const resourcesRouter = Router();

resourcesRouter.get("/", isAuthenticated, handleGetAllResource);

export { resourcesRouter };
