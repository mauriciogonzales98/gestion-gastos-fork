import { Router } from "express";
import {
  sanitizeTagInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "./tag.controller.js";

import firebaseAuthMiddleware from "../Firebase/FirebaseAdmin/firebaseAuthMiddleware.js";

export const tagRouter = Router();

tagRouter.get("/", firebaseAuthMiddleware, findAll as any);
tagRouter.get("/:id", firebaseAuthMiddleware, findOne);
tagRouter.post("/", firebaseAuthMiddleware, sanitizeTagInput, add);
tagRouter.put(
  "/:id",
  firebaseAuthMiddleware,
  sanitizeTagInput,
  update
);
tagRouter.patch("/:id", firebaseAuthMiddleware, sanitizeTagInput, update);
tagRouter.delete("/:id", firebaseAuthMiddleware, remove);