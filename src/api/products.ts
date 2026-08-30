import { apiRequest } from './client';
import { Category, Product } from '../types';

export interface ProductInput {
  name: string;
  price: number;
  stock: number;
  category: Category;
  imageUri: string | null;
  piecesPerPack: number | null;
  piecePrice: number | null;
}

export function fetchProducts(token: string) {
  return apiRequest<{ products: Product[] }>('/products', { token });
}

export function createProductRequest(token: string, input: ProductInput) {
  return apiRequest<{ product: Product }>('/products', { method: 'POST', body: input, token });
}

export function updateProductRequest(token: string, id: string, input: Partial<ProductInput>) {
  return apiRequest<{ product: Product }>(`/products/${id}`, { method: 'PUT', body: input, token });
}

export function deleteProductRequest(token: string, id: string) {
  return apiRequest<void>(`/products/${id}`, { method: 'DELETE', token });
}
