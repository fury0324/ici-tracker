import { apiRequest } from './client';
import { CartItem, PaymentMethod, Transaction } from '../types';

export function fetchTransactions(token: string) {
  return apiRequest<{ transactions: Transaction[] }>('/transactions', { token });
}

export interface CheckoutInput {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  amountReceived: number | null;
}

export function checkoutRequest(token: string, input: CheckoutInput) {
  return apiRequest<{ transaction: Transaction }>('/transactions/checkout', {
    method: 'POST',
    body: input,
    token,
  });
}
