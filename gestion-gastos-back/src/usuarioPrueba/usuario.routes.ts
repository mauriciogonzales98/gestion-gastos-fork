import { Router } from 'express'
import { sanitizeCharacterInput, findAll, add } from './usuario.controller.js'

export const usuarioRouter = Router()

usuarioRouter.get('/', findAll)
// characterRouter.get('/:id', findOne)
usuarioRouter.post('/', sanitizeCharacterInput, add)
// characterRouter.put('/:id', sanitizeCharacterInput, update)
// characterRouter.patch('/:id', sanitizeCharacterInput, update)
// characterRouter.delete('/:id', remove)