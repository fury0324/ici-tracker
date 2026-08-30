import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as transactionsService from '../services/transactions.service';

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        unit: z.enum(['piece', 'pack']).default('piece'),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'Cart is empty.'),
  paymentMethod: z.enum(['Cash', 'GCash', 'Card']),
  amountReceived: z.number().nullable().optional().default(null),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const transactions = await transactionsService.listTransactions(req.user!.sub);
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
}

export async function checkout(req: Request, res: Response, next: NextFunction) {
  try {
    const input = checkoutSchema.parse(req.body);
    const transaction = await transactionsService.checkout(req.user!.sub, input);
    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
}
