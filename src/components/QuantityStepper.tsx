import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ value, onChange, min = 0, max, size = 'md' }: QuantityStepperProps) {
  const canDecrease = value > min;
  const canIncrease = max === undefined || value < max;
  const buttonSize = size === 'sm' ? 28 : 36;

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        style={{ width: buttonSize, height: buttonSize }}
        className={`items-center justify-center rounded-full border border-border ${
          canDecrease ? 'bg-card' : 'bg-background opacity-40'
        }`}
      >
        <Minus size={size === 'sm' ? 14 : 16} color="#0F172A" />
      </Pressable>
      <Text className="min-w-[24px] text-center text-[15px] font-semibold font-jakarta-semibold text-textPrimary">{value}</Text>
      <Pressable
        onPress={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        style={{ width: buttonSize, height: buttonSize }}
        className={`items-center justify-center rounded-full ${
          canIncrease ? 'bg-primary' : 'bg-background opacity-40'
        }`}
      >
        <Plus size={size === 'sm' ? 14 : 16} color={canIncrease ? '#FFFFFF' : '#0F172A'} />
      </Pressable>
    </View>
  );
}
