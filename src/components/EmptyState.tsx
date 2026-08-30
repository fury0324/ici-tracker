import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onActionPress }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-primaryLight">{icon}</View>
      <Text className="mt-4 text-[17px] font-semibold font-jakarta-semibold text-textPrimary">{title}</Text>
      <Text className="mt-1.5 text-center text-[14px] text-textSecondary">{description}</Text>
      {actionLabel && onActionPress ? (
        <View className="mt-5 w-full max-w-[240px]">
          <Button title={actionLabel} onPress={onActionPress} size="md" />
        </View>
      ) : null}
    </View>
  );
}
