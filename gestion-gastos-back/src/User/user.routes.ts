import { Router } from "express";
import {
  SanitizeUserInput,
  findAll,
  findOne,
  add,
  remove,
  update,
} from "./user.controller.js";
import firebaseAuthMiddleware from "../Firebase/FirebaseAdmin/firebaseAuthMiddleware.js";

export const userRouter = Router();

userRouter.get("/", findAll);

userRouter.get("/:email", findOne);

// characterRouter.get('/:id', findOne)
userRouter.post("/", SanitizeUserInput, add);
// characterRouter.put('/:id', sanitizeCharacterInput, update)
userRouter.patch("/:id", SanitizeUserInput, update);
// characterRouter.delete('/:id', remove)
userRouter.delete("/:id", firebaseAuthMiddleware, remove);
