export type Category = 'Drinks' | 'Food' | 'Snacks' | 'Cigarettes' | 'Others';

export const CATEGORIES: Category[] = ['Drinks', 'Food', 'Snacks', 'Cigarettes', 'Others'];

export type SaleUnit = 'piece' | 'pack';

export interface StockHistoryEntry {
  id: string;
  date: string;
  change: number;
  reason: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  price: number;
  stock: number;
  category: Category;
  imageUri: string | null;
  unitsSold: number;
  createdAt: string;
  updatedAt: string;
  stockHistory: StockHistoryEntry[];
  // Cigarettes-only "tingi" (per-stick) selling. Stock is always tracked in
  // pieces (sticks); `price` above is the price per whole pack.
  piecesPerPack: number | null;
  piecePrice: number | null;
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
  userId: string;
  date: string;
  items: TransactionItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived: number | null;
  change: number | null;
}

export interface User {
  id: string;
  email: string;
  storeName: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
}
