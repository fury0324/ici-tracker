export type Category = 'Drinks' | 'Food' | 'Snacks' | 'Cigarettes' | 'Others';

export const CATEGORIES: Category[] = ['Drinks', 'Food', 'Snacks', 'Cigarettes', 'Others'];

export type SaleUnit = 'piece' | 'pack';

export interface StockHistoryEntry {
  id: string;
  date: string; // ISO date string
  change: number; // positive = added, negative = sold/removed
  reason: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: Category;
  imageUri: string | null;
  unitsSold: number;
  createdAt: string;
  stockHistory: StockHistoryEntry[];
  // Cigarettes-only "tingi" (per-stick) selling. Stock is always tracked in
  // pieces (sticks); `price` above is the price per whole pack.
  piecesPerPack: number | null;
  piecePrice: number | null;
}

export function isSoldByPiece(product: Pick<Product, 'category' | 'piecesPerPack' | 'piecePrice'>): boolean {
  return product.category === 'Cigarettes' && !!product.piecesPerPack && !!product.piecePrice;
}

export interface CartItem {
  productId: string;
  unit: SaleUnit;
  quantity: number;
}

export type PaymentMethod = 'Cash' | 'GCash' | 'Card';

export interface TransactionItem {
  productId: string;
  name: string;
  unit: SaleUnit;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  items: TransactionItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived: number | null;
  change: number | null;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export const LOW_STOCK_THRESHOLD = 5;

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'in-stock';
}
