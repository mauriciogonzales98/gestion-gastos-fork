import { Request, Response, NextFunction } from "express";
import { Wallet } from "./wallet.entity.js";
import { orm } from "../shared/db/orm.js";
import { User } from "../User/user.entity.js";

const em = orm.em;

function sanitizeWalletInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    coin: req.body.coin,
    spend: req.body.spend,
    income: req.body.income,
    userid: req.body.userid,
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
        data: [],
      });
    }

    const userId = firebaseUser.uid;

    const user = await em.findOne(User, { id: userId });

    const wallets = await em.find(Wallet, { user: { id: userId } });

    return res.status(200).json({
      success: true,
      message: "Wallets encontradas",
      data: wallets,
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
    const wallet = await em.findOneOrFail(Wallet, { id: idToFind });
    res.status(200).json({ message: "found category", data: wallet });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const wallet = em.create(Wallet, req.body.sanitizedInput);
    const user = await em.findOneOrFail(User, { id: req.body.userid });

    wallet.user = user;
    await em.persistAndFlush(wallet);
    res.status(201).json({ message: "wallet created", data: wallet });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const categoryToUpdate = await em.findOneOrFail(Wallet, { id: id });
    em.assign(categoryToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: "wallet updated", data: categoryToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    // const category = em.getReference(Category, id)
    // await em.removeAndFlush(category)
    const walletToRemove = await em.findOneOrFail(Wallet, { id: id });
    await em.removeAndFlush(walletToRemove);
    res.status(200).json({ message: "wallet removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeWalletInput, findAll, findOne, add, update, remove };
