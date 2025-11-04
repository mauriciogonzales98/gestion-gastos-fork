import { Router } from "express";
import {
  testConnection,
  importMovements,
  getImportHistory
} from "./mercadoPago.controller.js";

import firebaseAuthMiddleware from "../Firebase/FirebaseAdmin/firebaseAuthMiddleware.js";

export const mercadoPagoRouter = Router();

// Test connection (útil para debug)
mercadoPagoRouter.get("/test", firebaseAuthMiddleware, testConnection as any);

// Import movements from date range
mercadoPagoRouter.post("/import", firebaseAuthMiddleware, importMovements as any);

// Get import history
mercadoPagoRouter.get("/history", firebaseAuthMiddleware, getImportHistory as any);