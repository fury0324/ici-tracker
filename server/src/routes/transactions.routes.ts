import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as transactionsController from '../controllers/transactions.controller';

export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);
transactionsRouter.get('/', transactionsController.list);
transactionsRouter.post('/checkout', transactionsController.checkout);
