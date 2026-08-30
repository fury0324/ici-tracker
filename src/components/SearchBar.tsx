import React from 'react';
import { TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search products' }: SearchBarProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
      <Search size={18} color="#64748B" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="flex-1 text-[15px] text-textPrimary"
        returnKeyType="search"
        style={{ outlineStyle: 'none' } as any}
      />
    </View>
  );
}
