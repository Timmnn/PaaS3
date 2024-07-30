import type { Express } from "express";
import bodyparser from "body-parser";

import getProject from "./routes/getProject";
import getProjects from "./routes/getProjects";
import createProject from "./routes/createProject";
import getProjectHealth from "./routes/getProjectHealth";
import startProject from "./routes/startProject";
import deleteProject from "./routes/deleteProject";
import { router, createContext } from "./router";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import logger from "../lib/Logging";

const appRouter = router({
   getProject,
   getProjects,
   createProject,
   getProjectHealth,
   startProject,
   deleteProject,
});

export type AppRouter = typeof appRouter;

const app = require("express")() as Express;
app.use(bodyparser.json());
require("dotenv").config();
const PORT = 3001;

app.use(
   "/trpc",
   createExpressMiddleware({
      router: appRouter,
      createContext,
   })
);

app.listen(PORT, () => {
   logger.info(`Server is running on port ${PORT}`);
});
