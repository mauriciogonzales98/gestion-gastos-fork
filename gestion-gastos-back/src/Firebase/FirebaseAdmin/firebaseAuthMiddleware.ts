import { Request, Response, NextFunction } from "express";
import fbAdmin from "./firebaseAdmin.js";

export default async function firebaseAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await fbAdmin.auth().verifyIdToken(token);
    (req as any).firebaseUser = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
