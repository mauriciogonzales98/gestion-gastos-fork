import { Request, Response, NextFunction } from 'express'
import { Category } from './category.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeCategoryInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    categoryName: req.body.categoryName,
    categoryIcon: req.body.categoryIcon,
    categoryDescription: req.body.categoryDescription
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const categorys = await em.find(
      Category,
      {}
    )
    res.status(200).json({ message: 'found all categorys', data: categorys })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const category = await em.findOneOrFail(
      Category,
      { categoryId: id }
    )
    res.status(200).json({ message: 'found category', data: category })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const category = em.create(Category, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'category created', data: category })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const categoryToUpdate = await em.findOneOrFail(Category,  { categoryId: id } )
    em.assign(categoryToUpdate, req.body.sanitizedInput)
    await em.flush()
    res
      .status(200)
      .json({ message: 'category updated', data: categoryToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    // const category = em.getReference(Category, id)
    // await em.removeAndFlush(category)
    const categoryToRemove = await em.findOneOrFail(Category, { categoryId: id });
    await em.removeAndFlush(categoryToRemove);
    res.status(200).json({ message: 'category removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeCategoryInput, findAll, findOne, add, update, remove }