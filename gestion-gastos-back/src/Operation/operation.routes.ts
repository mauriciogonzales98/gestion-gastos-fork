import { Router } from 'express'
import { sanitizeOperationInput, findAll, findOne, add, update, remove, findAllFromWallet } from './operation.controller.js'

import firebaseAuthMiddleware from '../Firebase/FirebaseAdmin/firebaseAuthMiddleware.js';

export const operationRouter = Router()

operationRouter.get('/', firebaseAuthMiddleware, findAll as any);
operationRouter.get('/wallet/:walletId', firebaseAuthMiddleware, findAllFromWallet as any);
operationRouter.get('/:id', firebaseAuthMiddleware, findOne);
operationRouter.post('/', firebaseAuthMiddleware, sanitizeOperationInput, add);
operationRouter.put('/:id', firebaseAuthMiddleware, sanitizeOperationInput, update);
operationRouter.patch('/:id', firebaseAuthMiddleware, sanitizeOperationInput, update);
operationRouter.delete('/:id', firebaseAuthMiddleware, remove);