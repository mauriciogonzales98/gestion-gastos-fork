import { Request, Response } from "express";

async function getStatus(req: Request, res: Response) {
  try {
    res.sendStatus(200);
  } catch (error) {
    res.status(500);
  }
}
export { getStatus };
