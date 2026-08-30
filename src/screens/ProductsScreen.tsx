import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus, PackageSearch } from 'lucide-react-native';
import { ProductsStackParamList } from '../navigation/types';
import { useAppStore } from '../store/appStore';
import { CATEGORIES, Category } from '../types';
import { ProductCard, SearchBar, EmptyState } from '../components';
import { colors } from '../theme/colors';
import { cardShadow } from '../theme/shadow';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductsList'>;

type FilterCategory = Category | 'All';

export function ProductsScreen({ navigation }: Props) {
  const { products } = useAppStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FilterCategory>('All');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = category === 'All' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const filters: FilterCategory[] = ['All', ...CATEGORIES];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-4">
        <View>
          <Text className="text-[12px] font-bold font-jakarta-bold uppercase tracking-[1.5px] text-primary">
            Inventory
          </Text>
          <Text className="mt-1 text-[30px] font-extrabold font-jakarta-extrabold tracking-tight text-textPrimary">
            Products
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('AddProduct', undefined)}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-primary"
          style={{
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Plus size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View className="px-5 pt-4">
        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      <View className="mt-3 px-5">
        <FlatList
          data={filters}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setCategory(item)}
              className={`rounded-full px-4 py-2 ${category === item ? 'bg-primary' : 'bg-card'}`}
              style={category === item ? undefined : cardShadow}
            >
              <Text className={`text-[13px] font-medium font-jakarta-medium ${category === item ? 'text-white' : 'text-textSecondary'}`}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 10, flexGrow: 1 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        )}
        ListEmptyComponent={
          products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch size={26} color="#4F46E5" />}
              title="No Products Yet"
              description="Start building your inventory by adding your first product."
              actionLabel="Add Product"
              onActionPress={() => navigation.navigate('AddProduct', undefined)}
            />
          ) : (
            <EmptyState
              icon={<PackageSearch size={26} color="#4F46E5" />}
              title="No matches found"
              description="Try a different search term or category."
            />
          )
        }
      />
    </SafeAreaView>
  );
}
