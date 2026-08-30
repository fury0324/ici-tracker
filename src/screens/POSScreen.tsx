import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShoppingCart, X } from 'lucide-react-native';
import { POSStackParamList } from '../navigation/types';
import { useAppStore } from '../store/appStore';
import { useAppModal } from '../store/modalStore';
import { Product, isSoldByPiece } from '../types';
import { formatCurrency } from '../utils/currency';
import { getMaxQuantity, getUnitPrice } from '../utils/pricing';
import { Button, EmptyState, ProductCard, QuantityStepper, SearchBar } from '../components';

type Props = NativeStackScreenProps<POSStackParamList, 'POSMain'>;

export function POSScreen({ navigation }: Props) {
  const { products, cart, addToCart, updateCartQuantity, removeFromCart } = useAppStore();
  const { showModal } = useAppModal();
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase())),
    [products, search]
  );

  const cartLines = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return null;
          return { product, unit: item.unit, quantity: item.quantity };
        })
        .filter(
          (line): line is { product: Product; unit: 'piece' | 'pack'; quantity: number } => line !== null
        ),
    [cart, products]
  );

  const subtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + getUnitPrice(line.product, line.unit) * line.quantity, 0),
    [cartLines]
  );

  const cartQuantityByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.productId] = (map[item.productId] ?? 0) + item.quantity;
    });
    return map;
  }, [cart]);

  function handleProductPress(product: Product) {
    if (!isSoldByPiece(product)) {
      addToCart(product.id, 'piece');
      return;
    }

    showModal({
      variant: 'info',
      title: product.name,
      message: 'Sell as a whole pack, or a single stick?',
      buttons: [
        { text: `Stick · ${formatCurrency(product.piecePrice ?? 0)}`, onPress: () => addToCart(product.id, 'piece') },
        { text: `Pack · ${formatCurrency(product.price)}`, onPress: () => addToCart(product.id, 'pack') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pt-4">
        <Text className="text-[12px] font-bold font-jakarta-bold uppercase tracking-[1.5px] text-primary">
          Point of Sale
        </Text>
        <Text className="mt-1 text-[30px] font-extrabold font-jakarta-extrabold tracking-tight text-textPrimary">
          New Sale
        </Text>
        <View className="mt-4">
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search products" />
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            variant="grid"
            quantityInCart={cartQuantityByProduct[item.id] ?? 0}
            onPress={() => handleProductPress(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<ShoppingCart size={26} color="#4F46E5" />}
            title="No products found"
            description="Try a different search term."
          />
        }
      />

      <View className="border-t border-border bg-card px-5 pt-4" style={{ paddingBottom: 20 }}>
        {cartLines.length === 0 ? (
          <View className="items-center py-4">
            <Text className="text-[14px] font-semibold font-jakarta-semibold text-textPrimary">Your cart is empty</Text>
            <Text className="mt-1 text-[13px] text-textSecondary">Add products to start a sale.</Text>
          </View>
        ) : (
          <>
            <ScrollView style={{ maxHeight: 160 }} contentContainerStyle={{ gap: 10 }}>
              {cartLines.map(({ product, unit, quantity }) => {
                const unitPrice = getUnitPrice(product, unit);
                return (
                  <View key={`${product.id}_${unit}`} className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text numberOfLines={1} className="text-[14px] font-semibold font-jakarta-semibold text-textPrimary">
                        {product.name}
                        {unit === 'pack' ? ' (Pack)' : ''}
                      </Text>
                      <Text className="text-xs text-textSecondary">
                        {formatCurrency(unitPrice)} × {quantity}
                      </Text>
                    </View>
                    <QuantityStepper
                      size="sm"
                      value={quantity}
                      max={getMaxQuantity(product, unit)}
                      onChange={(next) => updateCartQuantity(product.id, unit, next)}
                    />
                    <Pressable
                      onPress={() => removeFromCart(product.id, unit)}
                      className="ml-3 h-7 w-7 items-center justify-center"
                    >
                      <X size={16} color="#DC2626" />
                    </Pressable>
                    <Text className="ml-1 w-[70px] text-right text-[14px] font-bold font-jakarta-bold text-textPrimary">
                      {formatCurrency(unitPrice * quantity)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
              <Text className="text-[16px] font-semibold font-jakarta-semibold text-textPrimary">Total</Text>
              <Text className="text-[20px] font-bold font-jakarta-bold text-primary">{formatCurrency(subtotal)}</Text>
            </View>

            <View className="mt-3">
              <Button title="Checkout" onPress={() => navigation.navigate('Checkout')} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
