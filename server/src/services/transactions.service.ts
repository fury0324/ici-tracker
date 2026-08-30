import { db, COLLECTIONS } from '../config/firebase';
import { generateId } from '../utils/ids';
import { PaymentMethod, Product, SaleUnit, Transaction, TransactionItem } from '../types';
import { ApiError } from '../middleware/errorHandler';

export interface CheckoutCartItem {
  productId: string;
  unit: SaleUnit;
  quantity: number;
}

export interface CheckoutInput {
  items: CheckoutCartItem[];
  paymentMethod: PaymentMethod;
  amountReceived: number | null;
}

export async function listTransactions(userId: string): Promise<Transaction[]> {
  const snapshot = await db
    .collection(COLLECTIONS.transactions)
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .get();

  return snapshot.docs.map((doc) => doc.data() as Transaction);
}

function resolveUnitPricing(
  product: Product,
  unit: SaleUnit,
  quantity: number
): { unitPrice: number; piecesConsumed: number } {
  const soldByPiece = product.category === 'Cigarettes' && !!product.piecesPerPack && !!product.piecePrice;

  if (unit === 'pack') {
    if (!soldByPiece || !product.piecesPerPack) {
      throw new ApiError(400, `"${product.name}" is not sold by the pack.`);
    }
    return { unitPrice: product.price, piecesConsumed: quantity * product.piecesPerPack };
  }

  if (soldByPiece && product.piecePrice) {
    return { unitPrice: product.piecePrice, piecesConsumed: quantity };
  }

  return { unitPrice: product.price, piecesConsumed: quantity };
}

export async function checkout(userId: string, input: CheckoutInput): Promise<Transaction> {
  if (input.items.length === 0) {
    throw new ApiError(400, 'Cart is empty.');
  }

  const now = new Date().toISOString();

  // A single product can appear in the cart more than once (e.g. bought as
  // both loose sticks and a whole pack) — read and write each unique
  // product exactly once, so a second cart line for the same product can't
  // clobber the first one's stock update.
  const uniqueProductIds = [...new Set(input.items.map((item) => item.productId))];
  const productRefs = new Map(
    uniqueProductIds.map((id) => [id, db.collection(COLLECTIONS.products).doc(id)])
  );

  return db.runTransaction(async (tx) => {
    const productDocs = await Promise.all(uniqueProductIds.map((id) => tx.get(productRefs.get(id)!)));
    const productsById = new Map<string, Product>();

    uniqueProductIds.forEach((id, index) => {
      const doc = productDocs[index];
      const product = doc.exists ? (doc.data() as Product) : null;
      if (!product || product.userId !== userId) {
        throw new ApiError(404, `Product ${id} not found.`);
      }
      productsById.set(id, product);
    });

    const transactionItems: TransactionItem[] = [];
    const piecesConsumedByProduct = new Map<string, number>();

    for (const cartItem of input.items) {
      if (cartItem.quantity <= 0) {
        throw new ApiError(400, 'Invalid quantity in cart.');
      }

      const product = productsById.get(cartItem.productId)!;
      const { unitPrice, piecesConsumed } = resolveUnitPricing(product, cartItem.unit, cartItem.quantity);

      transactionItems.push({
        productId: product.id,
        name: product.name,
        unit: cartItem.unit,
        price: unitPrice,
        quantity: cartItem.quantity,
      });

      piecesConsumedByProduct.set(
        cartItem.productId,
        (piecesConsumedByProduct.get(cartItem.productId) ?? 0) + piecesConsumed
      );
    }

    const subtotal = transactionItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amountReceived = input.paymentMethod === 'Cash' ? input.amountReceived : null;

    if (input.paymentMethod === 'Cash' && (amountReceived === null || amountReceived < subtotal)) {
      throw new ApiError(400, 'Amount received must cover the total due.');
    }

    const transaction: Transaction = {
      id: generateId(),
      userId,
      date: now,
      items: transactionItems,
      subtotal,
      total: subtotal,
      paymentMethod: input.paymentMethod,
      amountReceived,
      change: amountReceived !== null ? Math.max(amountReceived - subtotal, 0) : null,
    };

    for (const [productId, requestedPieces] of piecesConsumedByProduct) {
      const product = productsById.get(productId)!;
      const soldQty = Math.min(requestedPieces, product.stock);

      tx.update(productRefs.get(productId)!, {
        stock: Math.max(product.stock - soldQty, 0),
        unitsSold: product.unitsSold + soldQty,
        updatedAt: now,
        stockHistory: [{ id: generateId(), date: now, change: -soldQty, reason: 'Sale' }, ...product.stockHistory],
      });
    }

    const transactionRef = db.collection(COLLECTIONS.transactions).doc(transaction.id);
    tx.set(transactionRef, transaction);

    return transaction;
  });
}
