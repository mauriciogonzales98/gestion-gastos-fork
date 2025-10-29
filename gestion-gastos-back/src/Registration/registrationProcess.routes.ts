import { Router } from "express";

import {
  SanitizeRegistrationInput,
  register,
  getRegistrationStatus,
  findAllRegistrations,
} from "./registrationProcess.controller.js";

export const registrationRouter = Router();

/**
 * @route POST /api/registration
 * @description Initiate user registration with compensation pattern
 */
registrationRouter.post("/", SanitizeRegistrationInput, register);

registrationRouter.get("/", SanitizeRegistrationInput, findAllRegistrations);

/**
 * @route GET /api/registration/:processId
 * @description Get registration process status
 */
registrationRouter.get(
  "/:processId",
  SanitizeRegistrationInput,
  getRegistrationStatus
);
// a
