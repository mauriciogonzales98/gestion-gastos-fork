import { Request, Response, NextFunction } from "express";
import { Wallet } from "./wallet.entity.js";
import { Operation, OperationType } from "../Operation/operation.entity.js";
import { orm } from "../shared/db/orm.js";
import { User } from "../User/user.entity.js";

const em = orm.em;

async function calculateWalletBalances(walletId: number) {
  const operations = await em.find(Operation, { 
    wallet: { id: walletId } 
  });

  let totalIncome = 0;
  let totalSpend = 0;

  operations.forEach(operation => {
    if (operation.type === OperationType.INGRESO) {
      totalIncome += Number(operation.amount);
    } else if (operation.type === OperationType.GASTO) {
      totalSpend += Number(operation.amount);
    }
  });

  return {
    income: totalIncome,
    spend: totalSpend,
    balance: totalIncome - totalSpend
  };
}

function sanitizeWalletInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    coin: req.body.coin,
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
    const wallets = await em.find(Wallet, { user: { id: userId } });

    const walletsWithCalculatedBalances = await Promise.all(
      wallets.map(async (wallet) => {
        const balances = await calculateWalletBalances(wallet.id);
        return {
          ...wallet,
          income: balances.income,
          spend: balances.spend,
          balance: balances.balance
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Wallets encontradas",
      data: walletsWithCalculatedBalances,
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
    
    const balances = await calculateWalletBalances(wallet.id);
    const walletWithBalances = {
      ...wallet,
      income: balances.income,
      spend: balances.spend,
      balance: balances.balance
    };

    res.status(200).json({ 
      message: "wallet found", 
      data: walletWithBalances 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    req.body.sanitizedInput.spend = 0;
    req.body.sanitizedInput.income = 0;

    const wallet = em.create(Wallet, req.body.sanitizedInput);
    const user = await em.findOneOrFail(User, { id: req.body.userId });

    wallet.user = user;
    await em.persistAndFlush(wallet);
    
    const walletWithBalances = {
      ...wallet,
      income: 0,
      spend: 0,
      balance: 0
    };

    res.status(201).json({ 
      message: "wallet created", 
      data: walletWithBalances 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const walletToUpdate = await em.findOneOrFail(Wallet, { id: id });
    
    // No permitir actualizar spend e income manualmente
    if (req.body.sanitizedInput.spend) delete req.body.sanitizedInput.spend;
    if (req.body.sanitizedInput.income) delete req.body.sanitizedInput.income;
    
    em.assign(walletToUpdate, req.body.sanitizedInput);
    await em.flush();
    
    // Calcular balances actualizados
    const balances = await calculateWalletBalances(walletToUpdate.id);
    const walletWithBalances = {
      ...walletToUpdate,
      income: balances.income,
      spend: balances.spend,
      balance: balances.balance
    };

    res.status(200).json({ 
      message: "wallet updated", 
      data: walletWithBalances 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const walletToRemove = await em.findOneOrFail(Wallet, { id: id });
    await em.removeAndFlush(walletToRemove);
    res.status(200).json({ message: "wallet removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { 
  sanitizeWalletInput, 
  findAll, 
  findOne, 
  add, 
  update, 
  remove,
  calculateWalletBalances
};