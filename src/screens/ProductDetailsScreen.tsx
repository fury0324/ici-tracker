import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Pencil, Trash2, TrendingUp, Tag } from 'lucide-react-native';
import { ProductsStackParamList } from '../navigation/types';
import { useAppStore } from '../store/appStore';
import { useAppModal } from '../store/modalStore';
import { formatCurrency } from '../utils/currency';
import { isSoldByPiece } from '../types';
import { Button, ProductImage, StockBadge, SectionHeader } from '../components';
import { cardShadow } from '../theme/shadow';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductDetails'>;

export function ProductDetailsScreen({ navigation, route }: Props) {
  const { products, deleteProduct } = useAppStore();
  const { showModal } = useAppModal();
  const product = useMemo(
    () => products.find((p) => p.id === route.params.productId),
    [products, route.params.productId]
  );

  if (!product) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-textSecondary">This product no longer exists.</Text>
      </SafeAreaView>
    );
  }

  function handleDelete() {
    showModal({
      variant: 'danger',
      title: 'Delete Product',
      message: `Remove "${product?.name}" from your inventory?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (product) await deleteProduct(product.id);
              navigation.goBack();
            } catch (err) {
              showModal({
                variant: 'danger',
                title: 'Delete Failed',
                message: err instanceof Error ? err.message : 'Please try again.',
              });
            }
          },
        },
      ],
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-4">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-card"
          style={cardShadow}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => navigation.navigate('AddProduct', { productId: product.id })}
            className="h-10 w-10 items-center justify-center rounded-xl bg-primaryLight"
            style={cardShadow}
          >
            <Pencil size={18} color="#4F46E5" />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            className="h-10 w-10 items-center justify-center rounded-xl bg-dangerLight"
            style={cardShadow}
          >
            <Trash2 size={18} color="#DC2626" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center">
          <ProductImage uri={product.imageUri} size={140} rounded="lg" />
          <Text className="mt-4 text-center text-[24px] font-bold font-jakarta-bold text-textPrimary">{product.name}</Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Tag size={13} color="#64748B" />
            <Text className="text-[13px] text-textSecondary">{product.category}</Text>
          </View>
          {isSoldByPiece(product) ? (
            <View className="mt-3 items-center">
              <Text className="text-[26px] font-bold font-jakarta-bold text-primary">
                {formatCurrency(product.piecePrice ?? 0)}
                <Text className="text-[15px] font-semibold font-jakarta-semibold text-textSecondary">/stick</Text>
              </Text>
              <Text className="mt-0.5 text-[13px] text-textSecondary">
                {formatCurrency(product.price)}/pack · {product.piecesPerPack} sticks per pack
              </Text>
            </View>
          ) : (
            <Text className="mt-3 text-[26px] font-bold font-jakarta-bold text-primary">
              {formatCurrency(product.price)}
            </Text>
          )}
          <View className="mt-3">
            <StockBadge stock={product.stock} />
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-card p-4" style={cardShadow}>
            <Text className="text-[13px] text-textSecondary">Current Stock</Text>
            <Text className="mt-1 text-[20px] font-bold font-jakarta-bold text-textPrimary">{product.stock}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-card p-4" style={cardShadow}>
            <View className="flex-row items-center gap-1">
              <TrendingUp size={13} color="#16A34A" />
              <Text className="text-[13px] text-textSecondary">Units Sold</Text>
            </View>
            <Text className="mt-1 text-[20px] font-bold font-jakarta-bold text-textPrimary">{product.unitsSold}</Text>
          </View>
        </View>

        <View className="mt-6">
          <SectionHeader title="Stock History" />
          {product.stockHistory.length === 0 ? (
            <Text className="text-[13px] text-textSecondary">No stock history yet.</Text>
          ) : (
            <View className="gap-2.5">
              {product.stockHistory.map((entry) => (
                <View
                  key={entry.id}
                  className="flex-row items-center justify-between rounded-2xl bg-card p-4"
                  style={cardShadow}
                >
                  <View>
                    <Text className="text-[13px] font-semibold font-jakarta-semibold text-textPrimary">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text className="mt-0.5 text-xs text-textSecondary">{entry.reason}</Text>
                  </View>
                  <Text
                    className={`text-[15px] font-bold font-jakarta-bold ${entry.change >= 0 ? 'text-success' : 'text-danger'}`}
                  >
                    {entry.change >= 0 ? '+' : ''}
                    {entry.change} units
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mt-8">
          <Button title="Edit Product" variant="secondary" onPress={() => navigation.navigate('AddProduct', { productId: product.id })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
