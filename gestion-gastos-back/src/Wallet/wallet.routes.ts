import { Router } from 'express'
import { sanitizeWalletInput, findAll, findOne, add, update, remove } from './wallet.controller.js'

import firebaseAuthMiddleware from '../Firebase/FirebaseAdmin/firebaseAuthMiddleware.js';

export const walletRouter = Router()

walletRouter.get('/', firebaseAuthMiddleware, findAll);
walletRouter.get('/:id', firebaseAuthMiddleware, findOne);
walletRouter.post('/', firebaseAuthMiddleware, sanitizeWalletInput, add);
walletRouter.put('/:id', firebaseAuthMiddleware, sanitizeWalletInput, update);
walletRouter.patch('/:id', firebaseAuthMiddleware, sanitizeWalletInput, update);
walletRouter.delete('/:id', firebaseAuthMiddleware, remove);