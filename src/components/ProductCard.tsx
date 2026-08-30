import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Product, getStockStatus, isSoldByPiece } from '../types';
import { formatCurrency } from '../utils/currency';
import { ProductImage } from './ProductImage';
import { StockBadge } from './StockBadge';
import { cardShadow } from '../theme/shadow';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  variant?: 'list' | 'grid';
  quantityInCart?: number;
}

export function ProductCard({ product, onPress, variant = 'list', quantityInCart = 0 }: ProductCardProps) {
  const isOutOfStock = getStockStatus(product.stock) === 'out-of-stock';
  const soldByPiece = isSoldByPiece(product);
  const stockLabel = soldByPiece ? `Stock: ${product.stock} sticks` : `Stock: ${product.stock}`;

  if (variant === 'grid') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isOutOfStock}
        className={`w-[47%] rounded-2xl bg-card p-3 ${isOutOfStock ? 'opacity-50' : ''}`}
        style={({ pressed }) => ({ ...cardShadow, transform: [{ scale: pressed && !isOutOfStock ? 0.97 : 1 }] })}
      >
        <View className="relative self-start">
          <ProductImage uri={product.imageUri} size={72} />
          {quantityInCart > 0 ? (
            <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-primary">
              <Text className="text-[11px] font-bold font-jakarta-bold text-white">{quantityInCart}</Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={2} className="mt-2 text-[14px] font-semibold font-jakarta-semibold text-textPrimary">
          {product.name}
        </Text>
        {soldByPiece ? (
          <Text className="mt-1 text-[13px] font-bold font-jakarta-bold text-primary">
            {formatCurrency(product.piecePrice ?? 0)}/stick
          </Text>
        ) : (
          <Text className="mt-1 text-[15px] font-bold font-jakarta-bold text-primary">
            {formatCurrency(product.price)}
          </Text>
        )}
        {isOutOfStock ? (
          <Text className="mt-1 text-xs font-medium font-jakarta-medium text-danger">Out of stock</Text>
        ) : (
          <Text className="mt-1 text-xs text-textSecondary">{stockLabel}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl bg-card p-3"
      style={({ pressed }) => ({ ...cardShadow, transform: [{ scale: pressed ? 0.99 : 1 }] })}
    >
      <ProductImage uri={product.imageUri} size={56} />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-[15px] font-semibold font-jakarta-semibold text-textPrimary">
          {product.name}
        </Text>
        {soldByPiece ? (
          <Text className="mt-0.5 text-[14px] font-bold font-jakarta-bold text-textPrimary">
            {formatCurrency(product.piecePrice ?? 0)}/stick · {formatCurrency(product.price)}/pack
          </Text>
        ) : (
          <Text className="mt-0.5 text-[15px] font-bold font-jakarta-bold text-textPrimary">
            {formatCurrency(product.price)}
          </Text>
        )}
        <View className="mt-1.5 flex-row items-center gap-2">
          <Text className="text-xs text-textSecondary">{stockLabel}</Text>
          {getStockStatus(product.stock) !== 'in-stock' ? <StockBadge stock={product.stock} /> : null}
        </View>
      </View>
    </Pressable>
  );
}
