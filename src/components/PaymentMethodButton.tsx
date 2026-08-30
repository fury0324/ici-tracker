import React from 'react';
import { Pressable, Text } from 'react-native';
import { PaymentMethod } from '../types';
import { cardShadow } from '../theme/shadow';

interface PaymentMethodButtonProps {
  method: PaymentMethod;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}

export function PaymentMethodButton({ method, icon, selected, onPress }: PaymentMethodButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center gap-2 rounded-2xl p-4 ${
        selected ? 'border-2 border-primary bg-primaryLight' : 'bg-card'
      }`}
      style={selected ? undefined : cardShadow}
    >
      {icon}
      <Text className={`text-[13px] font-semibold font-jakarta-semibold ${selected ? 'text-primary' : 'text-textPrimary'}`}>
        {method}
      </Text>
    </Pressable>
  );
}
