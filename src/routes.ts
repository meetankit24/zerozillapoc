import { Express, Request, Response } from "express";
import { createUserHandler, editUserHandler, getAgencyClientHandler } from "./controller/user.controller";
import { createUserSchema, editUserSchema } from "./schema/user.schema";
import { createValidator } from 'express-joi-validation'
import { deserializeUser } from "./middleware";

const validator = createValidator()

export default function (app: Express) {

  app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

  // Register client/agency
  app.post("/api/user", validator.body(createUserSchema), createUserHandler);


  // Edit Client details
  app.put("/api/client", validator.body(editUserSchema), editUserHandler);

  // Edit Client details
  app.get("/api/agency-client", deserializeUser, getAgencyClientHandler);

  
  // // Login
  // app.post("/api/sessions", validateRequest(createUserSessionSchema), createUserSessionHandler);

  // // Logout
  // app.delete("/api/sessions", requiresUser, invalidateUserSessionHandler);

}