import { Request, Response, NextFunction } from "express";
import { Category } from "./category.entity.js";
import { orm } from "../shared/db/orm.js";
import { User } from "../User/user.entity.js";
import { CategoryService } from "../Services/category.service.js";

const em = orm.em;

function sanitizeCategoryInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    name: req.body.name,
    icon: req.body.icon || "",
    description: req.body.description,
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
    const firebaseUser = (req as any).firebaseUser;

    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const userId = firebaseUser.uid;

    const user = await em.findOne(User, { id: userId });

    const categories = await em.find(Category, { user: { id: userId } });

    return res.status(200).json({
      success: true,
      message: "Categorías encontradas",
      data: categories,
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
    const category = await em.findOneOrFail(
      Category,
      { id: idToFind },
      { populate: ["user"] }
    );
    res.status(200).json({ message: "found category", data: category });
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
        message: 'Usuario no autenticado' 
      });
    }

    const userId = firebaseUser.uid;
    const user = await em.findOneOrFail(User, { id: userId });
    const category = em.create(Category, {
      ...req.body.sanitizedInput,
      user: user
    });

    await em.persistAndFlush(category);
    res.status(201).json({ message: "category created", data: category });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const categoryToUpdate = await em.findOneOrFail(Category, { id: id });
    em.assign(categoryToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: "category updated", data: categoryToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).firebaseUser;
    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no autenticado' 
      });
    }
    const id = Number.parseInt(req.params.id);
    const categoryToRemove = await em.findOneOrFail(Category, { id: id });
    await em.removeAndFlush(categoryToRemove);
    res.status(200).json({ message: "category removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeCategoryInput, findAll, findOne, add, update, remove };
