import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-[19px] font-semibold font-jakarta-semibold text-textPrimary">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress}>
          <Text className="text-[13px] font-semibold font-jakarta-semibold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
