import { Request, Response, NextFunction } from "express";
import { Tag } from "./tag.entity.js";
import { orm } from "../shared/db/orm.js";
import { User } from "../User/user.entity.js";

const em = orm.em;

function sanitizeTagInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    name: req.body.name,
    color: req.body.color,
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
    const tags = await em.find(Tag, { user: { id: userId } });

    return res.status(200).json({
      success: true,
      message: "Tags encontradas",
      data: tags,
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
    const tag = await em.findOneOrFail(
      Tag,
      { id: idToFind },
      { populate: ["user"] }
    );
    res.status(200).json({ message: "found tag", data: tag });
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

    // ✅ VALIDACIÓN: Verificar si ya existe un tag con el mismo nombre para este usuario
    const existingTag = await em.findOne(Tag, { 
      name: req.body.sanitizedInput.name,
      user: { id: userId }
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un tag con ese nombre'
      });
    }

    const tag = em.create(Tag, {
      ...req.body.sanitizedInput,
      user: user
    });

    await em.persistAndFlush(tag);
    res.status(201).json({ message: "tag created", data: tag });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const firebaseUser = (req as any).firebaseUser;
    
    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no autenticado' 
      });
    }

    const userId = firebaseUser.uid;

    // ✅ VALIDACIÓN: Verificar si otro tag tiene el mismo nombre (excluyendo el actual)
    const existingTag = await em.findOne(Tag, { 
      name: req.body.sanitizedInput.name,
      user: { id: userId },
      id: { $ne: id } // Excluir el tag actual
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe otro tag con ese nombre'
      });
    }

    const tagToUpdate = await em.findOneOrFail(Tag, { id: id });
    em.assign(tagToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: "tag updated", data: tagToUpdate });
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
    const tagToRemove = await em.findOneOrFail(Tag, { id: id });
    await em.removeAndFlush(tagToRemove);
    res.status(200).json({ message: "tag removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeTagInput, findAll, findOne, add, update, remove };