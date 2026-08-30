import { db, COLLECTIONS } from '../config/firebase';
import { generateId } from '../utils/ids';
import { Category, Product, StockHistoryEntry } from '../types';
import { ApiError } from '../middleware/errorHandler';

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
  category: Category;
  imageUri: string | null;
  piecesPerPack: number | null;
  piecePrice: number | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export async function listProducts(userId: string): Promise<Product[]> {
  const snapshot = await db.collection(COLLECTIONS.products).where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => doc.data() as Product);
}

export async function getProductOrThrow(userId: string, productId: string): Promise<Product> {
  const doc = await db.collection(COLLECTIONS.products).doc(productId).get();
  const product = doc.exists ? (doc.data() as Product) : null;

  if (!product || product.userId !== userId) {
    throw new ApiError(404, 'Product not found.');
  }

  return product;
}

export async function createProduct(userId: string, input: CreateProductInput): Promise<Product> {
  const now = new Date().toISOString();
  const initialHistory: StockHistoryEntry[] =
    input.stock > 0
      ? [{ id: generateId(), date: now, change: input.stock, reason: 'Stock added' }]
      : [];

  const product: Product = {
    id: generateId(),
    userId,
    name: input.name,
    price: input.price,
    stock: input.stock,
    category: input.category,
    imageUri: input.imageUri,
    unitsSold: 0,
    createdAt: now,
    updatedAt: now,
    stockHistory: initialHistory,
    piecesPerPack: input.category === 'Cigarettes' ? input.piecesPerPack : null,
    piecePrice: input.category === 'Cigarettes' ? input.piecePrice : null,
  };

  await db.collection(COLLECTIONS.products).doc(product.id).set(product);
  return product;
}

export async function updateProduct(
  userId: string,
  productId: string,
  input: UpdateProductInput
): Promise<Product> {
  const existing = await getProductOrThrow(userId, productId);

  const stockHistory = [...existing.stockHistory];
  if (input.stock !== undefined && input.stock !== existing.stock) {
    stockHistory.unshift({
      id: generateId(),
      date: new Date().toISOString(),
      change: input.stock - existing.stock,
      reason: 'Stock adjusted',
    });
  }

  const nextCategory = input.category ?? existing.category;

  const updated: Product = {
    ...existing,
    ...input,
    stockHistory,
    updatedAt: new Date().toISOString(),
    piecesPerPack: nextCategory === 'Cigarettes' ? (input.piecesPerPack ?? existing.piecesPerPack) : null,
    piecePrice: nextCategory === 'Cigarettes' ? (input.piecePrice ?? existing.piecePrice) : null,
  };

  await db.collection(COLLECTIONS.products).doc(productId).set(updated);
  return updated;
}

export async function deleteProduct(userId: string, productId: string): Promise<void> {
  await getProductOrThrow(userId, productId);
  await db.collection(COLLECTIONS.products).doc(productId).delete();
}
