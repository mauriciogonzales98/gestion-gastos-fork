import { Router } from 'express'
import { sanitizeCharacterInput, findAll, add } from './user.controller.js'

export const userRouter = Router()

userRouter.get('/', findAll)
// characterRouter.get('/:id', findOne)
userRouter.post('/', sanitizeCharacterInput, add)
// characterRouter.put('/:id', sanitizeCharacterInput, update)
// characterRouter.patch('/:id', sanitizeCharacterInput, update)
// characterRouter.delete('/:id', remove)