import { Product, Transaction, getStockStatus } from '../types';
import { daysBetween, isSameDay } from '../utils/currency';

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter((p) => getStockStatus(p.stock) === 'low-stock');
}

export function getOutOfStockProducts(products: Product[]): Product[] {
  return products.filter((p) => getStockStatus(p.stock) === 'out-of-stock');
}

export function getTransactionsWithinDays(transactions: Transaction[], days: number): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => {
    const diff = daysBetween(new Date(t.date), now);
    return diff >= 0 && diff < days;
  });
}

export function getTodaysTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => isSameDay(new Date(t.date), now));
}

export function sumTransactions(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.total, 0);
}

export function getIncomeChangePercent(transactions: Transaction[]): number {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const todayTotal = sumTransactions(transactions.filter((t) => isSameDay(new Date(t.date), now)));
  const yesterdayTotal = sumTransactions(
    transactions.filter((t) => isSameDay(new Date(t.date), yesterday))
  );

  if (yesterdayTotal === 0) return todayTotal > 0 ? 100 : 0;
  return ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
}

export interface DayTotal {
  label: string;
  total: number;
  isToday: boolean;
}

export function getWeeklySalesChart(transactions: Transaction[]): DayTotal[] {
  const days: DayTotal[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const total = sumTransactions(transactions.filter((t) => isSameDay(new Date(t.date), date)));
    days.push({
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      total,
      isToday: i === 0,
    });
  }

  return days;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  unitsSold: number;
}

export function getTopSellingProducts(products: Product[], limit = 5): TopSellingProduct[] {
  return [...products]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit)
    .map((p) => ({ id: p.id, name: p.name, unitsSold: p.unitsSold }));
}
