import { Router } from "express";
import { getStatus } from "./status.controller.js";

export const statusRouter = Router();
statusRouter.get("/", getStatus);
