import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as productsController from '../controllers/products.controller';

export const productsRouter = Router();

productsRouter.use(requireAuth);
productsRouter.get('/', productsController.list);
productsRouter.get('/:id', productsController.getOne);
productsRouter.post('/', productsController.create);
productsRouter.put('/:id', productsController.update);
productsRouter.delete('/:id', productsController.remove);
