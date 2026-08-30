import React from 'react';
import { Text, View } from 'react-native';
import { AlertTriangle, XCircle } from 'lucide-react-native';
import { getStockStatus } from '../types';

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  const status = getStockStatus(stock);

  if (status === 'out-of-stock') {
    return (
      <View className="flex-row items-center gap-1 self-start rounded-full bg-dangerLight px-2.5 py-1">
        <XCircle size={12} color="#DC2626" />
        <Text className="text-xs font-medium font-jakarta-medium text-danger">Out of stock</Text>
      </View>
    );
  }

  if (status === 'low-stock') {
    return (
      <View className="flex-row items-center gap-1 self-start rounded-full bg-warningLight px-2.5 py-1">
        <AlertTriangle size={12} color="#F59E0B" />
        <Text className="text-xs font-medium font-jakarta-medium text-warning">Low Stock</Text>
      </View>
    );
  }

  return (
    <View className="self-start rounded-full bg-successLight px-2.5 py-1">
      <Text className="text-xs font-medium font-jakarta-medium text-success">In Stock</Text>
    </View>
  );
}
