import { Product, SaleUnit, isSoldByPiece } from '../types';

export function getUnitPrice(product: Product, unit: SaleUnit): number {
  if (unit === 'pack') return product.price;
  return isSoldByPiece(product) && product.piecePrice !== null ? product.piecePrice : product.price;
}

export function getMaxQuantity(product: Product, unit: SaleUnit): number {
  if (unit === 'pack') return Math.floor(product.stock / (product.piecesPerPack || 1));
  return product.stock;
}
