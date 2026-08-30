import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  rightElement?: React.ReactNode;
}

export function Input({ label, error, prefix, rightElement, style, ...props }: InputProps) {
  return (
    <View className="w-full">
      {label ? <Text className="mb-2 text-[13px] font-medium font-jakarta-medium text-textSecondary">{label}</Text> : null}
      <View
        className={`flex-row items-center rounded-2xl border bg-card px-4 ${
          error ? 'border-danger' : 'border-border'
        }`}
      >
        {prefix ? <Text className="mr-1 text-[15px] font-semibold font-jakarta-semibold text-textPrimary">{prefix}</Text> : null}
        <TextInput
          className="flex-1 py-3 text-[15px] text-textPrimary"
          placeholderTextColor="#94A3B8"
          style={[{ outlineStyle: 'none' } as any, style]}
          {...props}
        />
        {rightElement}
      </View>
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}
