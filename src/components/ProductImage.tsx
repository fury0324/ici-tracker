import React from 'react';
import { Image, View } from 'react-native';
import { Package } from 'lucide-react-native';

interface ProductImageProps {
  uri: string | null;
  size?: number;
  rounded?: 'md' | 'lg' | 'full';
}

const ROUNDING: Record<NonNullable<ProductImageProps['rounded']>, string> = {
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

export function ProductImage({ uri, size = 56, rounded = 'lg' }: ProductImageProps) {
  const roundedClass = ROUNDING[rounded];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        className={`bg-primaryLight ${roundedClass}`}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size }}
      className={`items-center justify-center bg-primaryLight ${roundedClass}`}
    >
      <Package size={size * 0.45} color="#4F46E5" strokeWidth={1.75} />
    </View>
  );
}
