import { Router } from "express";
import {
  sanitizeCategoryInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "./category.controller.js";

import firebaseAuthMiddleware from "../Firebase/FirebaseAdmin/firebaseAuthMiddleware.js";

export const categoryRouter = Router();

categoryRouter.get("/", firebaseAuthMiddleware, findAll as any);
categoryRouter.get("/:id", firebaseAuthMiddleware, findOne);
categoryRouter.post("/", firebaseAuthMiddleware, sanitizeCategoryInput, add);
categoryRouter.put(
  "/:id",
  firebaseAuthMiddleware,
  sanitizeCategoryInput,
  update
);
categoryRouter.patch(
  "/:id",
  firebaseAuthMiddleware,
  sanitizeCategoryInput,
  update
);
categoryRouter.delete("/:id", firebaseAuthMiddleware, remove);
