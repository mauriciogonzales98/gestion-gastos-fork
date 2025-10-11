// Firebase/firebaseAuthMiddleware.ts - SOLUCIÓN DEFINITIVA
import { Request, Response, NextFunction } from "express";
import fbAdmin from "./firebaseAdmin.js";

const firebaseAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  fbAdmin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      (req as any).firebaseUser = decodedToken;
      next();
    })
    .catch((err) => {
      console.error("Firebase auth error:", err);
      res.status(401).json({ message: "Invalid or expired token" });
    });
};

export default firebaseAuthMiddleware;
