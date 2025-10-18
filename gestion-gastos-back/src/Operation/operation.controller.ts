import { Request, Response, NextFunction } from "express";
import { Operation } from "./operation.entity.js";
import { orm } from "../shared/db/orm.js";
import { User } from "../User/user.entity.js";
import { Category } from "../Category/category.entity.js";
import { Wallet } from "../Wallet/wallet.entity.js";

const em = orm.em;

function sanitizeOperationInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    amount: req.body.amount,
    description: req.body.description,
    date: new Date(req.body.date),
    type: req.body.type,
    walletid: req.body.walletid,
    categoryid: req.body.categoryid,
    tagid: req.body.tagid,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;

    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const userId = firebaseUser.uid;

    const user = await em.findOne(User, { id: userId });

    const operations = await em.find(Operation, { user: { id: userId } });

    return res.status(200).json({
      success: true,
      message: "Movimientos encontrados",
      data: operations,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function findAllFromWallet(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;

    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const userId = firebaseUser.uid;

    const user = await em.findOne(User, { id: userId });

    const operations = await em.find(Operation, {
      user: { id: userId },
      wallet: { id: Number(req.params.walletId) },
    });

    return res.status(200).json({
      success: true,
      message: "Movimientos encontrados",
      data: operations,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const idToFind = Number(req.params.id);
    console.log("idToFind", req.params.id);
    const operation = await em.findOneOrFail(
      Operation,
      { id: idToFind },
      { populate: ["user"] }
    );
    res.status(200).json({ message: "found operation", data: operation });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;

    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const userId = firebaseUser.uid;
    const user = await em.findOneOrFail(User, { id: userId });

    let category = null;
    category = await em.findOne(Category, {
      id: req.body.sanitizedInput.categoryid,
    });

    const wallet = await em.findOneOrFail(Wallet, {
      id: req.body.sanitizedInput.walletid,
    });
    const tag = null; //Cambiar cuando se implemente tags

    const operation = em.create(Operation, {
      ...req.body.sanitizedInput,
      category: category,
      tag: tag,
      user: user,
      wallet: wallet,
    });

    await em.persistAndFlush(operation);
    res.status(201).json({ message: "operation created", data: operation });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const operationToUpdate = await em.findOneOrFail(Operation, { id: id });
    em.assign(operationToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: "operation updated", data: operationToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    // const category = em.getReference(Category, id)
    // await em.removeAndFlush(category)
    const operationToRemove = await em.findOneOrFail(Operation, { id: id });
    await em.removeAndFlush(operationToRemove);
    res.status(200).json({ message: "operation removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeOperationInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  findAllFromWallet,
};
