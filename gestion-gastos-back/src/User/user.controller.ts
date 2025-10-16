import { Request, Response, NextFunction } from "express";
import { User } from "./user.entity.js";
import { Wallet } from "../Wallet/wallet.entity.js";
import { CategoryService } from "../Services/category.service.js";
import { orm } from "../shared/db/orm.js";
import fbAdmin from "../Firebase/FirebaseAdmin/firebaseAdmin.js";
import { userRouter } from "./user.routes.js";
const em = orm.em;

function sanitizeCharacterInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    id: req.body.id,
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: req.body.password,
  };
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const users = await em.find(User, {});
    res.status(200).json({ message: "found all characters", data: users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const email = req.params.email;
    const user = await em.findOne(User, { email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "found user", data: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const user = em.create(User, req.body.sanitizedInput);
    await em.flush();
    
    const newWallet = new Wallet();
    newWallet.name = "ARS";
    newWallet.coin = "Pesos";
    newWallet.spend = 0;
    newWallet.income = 0
    newWallet.user = user;
    
    em.persist(newWallet);
    await em.flush();
    
    const cat = await CategoryService.createDefaultCategories(em, user);
    await em.flush();

    res.status(201).json({ message: "usuario creado", data: user });
  } 
  catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    const email = firebaseUser.email;
    if (!email) {
      return res.status(400).json({ message: "No email found in token" });
    }
    const user = em.nativeDelete(User, { email });
    await em.flush();
    res.status(200).json({ message: "usuario eliminado", data: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
export { sanitizeCharacterInput, findAll, findOne, add, remove };
