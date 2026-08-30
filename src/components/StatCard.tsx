import React from 'react';
import { Text, View } from 'react-native';
import { cardShadow } from '../theme/shadow';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  tint?: 'primary' | 'warning' | 'success' | 'info' | 'default';
}

const TINTS: Record<NonNullable<StatCardProps['tint']>, string> = {
  primary: 'bg-primaryLight',
  warning: 'bg-warningLight',
  success: 'bg-successLight',
  info: 'bg-infoLight',
  default: 'bg-background',
};

export function StatCard({ label, value, icon, tint = 'default' }: StatCardProps) {
  return (
    <View className="w-[47%] rounded-2xl bg-card p-4" style={cardShadow}>
      <View className={`h-11 w-11 items-center justify-center rounded-xl ${TINTS[tint]}`}>{icon}</View>
      <Text className="mt-3 text-[23px] font-extrabold font-jakarta-extrabold text-textPrimary">{value}</Text>
      <Text className="mt-0.5 text-[13px] font-medium font-jakarta-medium text-textSecondary">{label}</Text>
    </View>
  );
}
