import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-primary', text: 'text-white' },
  secondary: { container: 'bg-primaryLight', text: 'text-primary' },
  outline: { container: 'bg-transparent border border-border', text: 'text-textPrimary' },
  danger: { container: 'bg-danger', text: 'text-white' },
};

const SIZE_STYLES: Record<Size, { container: string; text: string }> = {
  md: { container: 'px-4 py-3', text: 'text-[15px]' },
  lg: { container: 'px-5 py-4', text: 'text-base' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  disabled = false,
  loading = false,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-2xl ${sizeStyle.container} ${
        variantStyle.container
      } ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
      style={({ pressed }) => ({ transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }] })}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#4F46E5'} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`font-semibold font-jakarta-semibold ${sizeStyle.text} ${variantStyle.text}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
