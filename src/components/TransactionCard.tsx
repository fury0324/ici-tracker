import React from 'react';
import { Text, View } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/currency';
import { cardShadow } from '../theme/shadow';

interface TransactionCardProps {
  transaction: Transaction;
  showDate?: boolean;
}

export function TransactionCard({ transaction, showDate = false }: TransactionCardProps) {
  const itemsLabel = transaction.items
    .map((item) => `${item.quantity} × ${item.name}${item.unit === 'pack' ? ' (Pack)' : ''}`)
    .join(', ');

  const time = new Date(transaction.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const date = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-card p-4" style={cardShadow}>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primaryLight">
        <Receipt size={17} color="#4F46E5" />
      </View>
      <View className="flex-1 pr-2">
        <Text numberOfLines={1} className="text-[14px] font-semibold font-jakarta-semibold text-textPrimary">
          {transaction.items[0]?.name}
          {transaction.items.length > 1 ? ` +${transaction.items.length - 1} more` : ''}
        </Text>
        <Text numberOfLines={1} className="mt-1 text-xs text-textSecondary">
          {itemsLabel}
        </Text>
        <Text className="mt-1 text-xs text-textSecondary">
          {showDate ? `${date} · ` : ''}
          {time} · {transaction.paymentMethod}
        </Text>
      </View>
      <Text className="text-[16px] font-bold font-jakarta-bold text-textPrimary">{formatCurrency(transaction.total)}</Text>
    </View>
  );
}
