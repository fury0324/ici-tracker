import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { Category, CATEGORIES } from '../types';
import * as productsService from '../services/products.service';

const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  price: z.number().positive('Price must be greater than 0.'),
  stock: z.number().int().min(0, 'Stock cannot be negative.'),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  imageUri: z.string().nullable().optional().default(null),
  piecesPerPack: z.number().int().positive().nullable().optional().default(null),
  piecePrice: z.number().positive().nullable().optional().default(null),
});

const updateProductSchema = createProductSchema.partial();

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await productsService.listProducts(req.user!.sub);
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.getProductOrThrow(req.user!.sub, req.params.id);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createProductSchema.parse(req.body);
    const product = await productsService.createProduct(req.user!.sub, input);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateProductSchema.parse(req.body);
    const product = await productsService.updateProduct(req.user!.sub, req.params.id, input);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await productsService.deleteProduct(req.user!.sub, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
