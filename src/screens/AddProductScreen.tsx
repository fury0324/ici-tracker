import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, ImageIcon } from 'lucide-react-native';
import { ProductsStackParamList } from '../navigation/types';
import { useAppStore } from '../store/appStore';
import { useAppModal } from '../store/modalStore';
import { CATEGORIES, Category } from '../types';
import { Button, Input, ProductImage, QuantityStepper } from '../components';
import { cardShadow } from '../theme/shadow';

type Props = NativeStackScreenProps<ProductsStackParamList, 'AddProduct'>;

export function AddProductScreen({ navigation, route }: Props) {
  const { products, addProduct, updateProduct } = useAppStore();
  const { showModal } = useAppModal();
  const productId = route.params?.productId;
  const existingProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  );
  const isEditing = existingProduct !== null;

  const [imageUri, setImageUri] = useState<string | null>(existingProduct?.imageUri ?? null);
  const [name, setName] = useState(existingProduct?.name ?? '');
  const [price, setPrice] = useState(existingProduct ? String(existingProduct.price) : '');
  const [quantity, setQuantity] = useState(existingProduct?.stock ?? 0);
  const [category, setCategory] = useState<Category>(existingProduct?.category ?? 'Drinks');
  const [piecesPerPack, setPiecesPerPack] = useState(
    existingProduct?.piecesPerPack ? String(existingProduct.piecesPerPack) : ''
  );
  const [piecePrice, setPiecePrice] = useState(
    existingProduct?.piecePrice ? String(existingProduct.piecePrice) : ''
  );
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    piecesPerPack?: string;
    piecePrice?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCigarette = category === 'Cigarettes';

  async function pickImage(source: 'camera' | 'gallery') {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showModal({
        variant: 'warning',
        title: 'Permission Needed',
        message: 'Please allow access to continue.',
      });
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleImagePress() {
    showModal({
      variant: 'info',
      title: 'Add Product Photo',
      buttons: [
        { text: 'Camera', onPress: () => pickImage('camera') },
        { text: 'Gallery', onPress: () => pickImage('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function validate(): boolean {
    const nextErrors: { name?: string; price?: string; piecesPerPack?: string; piecePrice?: string } = {};
    const trimmedName = name.trim();
    const parsedPrice = Number(price);

    if (!trimmedName) nextErrors.name = 'Item name is required';
    if (!price || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = 'Enter a valid price';
    }

    if (isCigarette) {
      const parsedPieces = Number(piecesPerPack);
      const parsedPiecePrice = Number(piecePrice);

      if (!piecesPerPack || !Number.isInteger(parsedPieces) || parsedPieces <= 0) {
        nextErrors.piecesPerPack = 'Enter how many sticks per pack';
      }
      if (!piecePrice || Number.isNaN(parsedPiecePrice) || parsedPiecePrice <= 0) {
        nextErrors.piecePrice = 'Enter a valid price per stick';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const input = {
      name: name.trim(),
      price: Number(price),
      stock: quantity,
      category,
      imageUri,
      piecesPerPack: isCigarette ? Number(piecesPerPack) : null,
      piecePrice: isCigarette ? Number(piecePrice) : null,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && existingProduct) {
        await updateProduct(existingProduct.id, input);
      } else {
        await addProduct(input);
      }

      showModal({
        variant: 'success',
        title: isEditing ? 'Product Updated' : 'Product Added',
        message: isEditing
          ? `${input.name} has been updated successfully.`
          : `${input.name} has been added to your inventory.`,
        buttons: [{ text: 'Great', onPress: () => navigation.goBack() }],
      });
    } catch (err) {
      showModal({
        variant: 'danger',
        title: 'Something Went Wrong',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 px-5 pt-4">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-card"
          style={cardShadow}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </Pressable>
        <Text className="text-[20px] font-semibold font-jakarta-semibold text-textPrimary">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 18 }}>
          <Pressable onPress={handleImagePress} className="items-center">
            <View className="relative">
              <ProductImage uri={imageUri} size={120} rounded="lg" />
              <View className="absolute -bottom-2 -right-2 h-9 w-9 items-center justify-center rounded-full bg-primary border-2 border-background">
                <Camera size={16} color="#FFFFFF" />
              </View>
            </View>
            <View className="mt-2 flex-row items-center gap-1">
              <ImageIcon size={13} color="#64748B" />
              <Text className="text-xs text-textSecondary">Camera / Gallery</Text>
            </View>
          </Pressable>

          <Input
            label="Item Name"
            placeholder="Enter item name"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <Input
            label={isCigarette ? 'Price per Pack' : 'Price'}
            placeholder="0.00"
            prefix="₱"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
            error={errors.price}
          />

          <View>
            <Text className="mb-2 text-[13px] font-medium font-jakarta-medium text-textSecondary">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 ${
                    category === item ? 'bg-primary' : 'bg-card border border-border'
                  }`}
                >
                  <Text className={`text-[13px] font-medium font-jakarta-medium ${category === item ? 'text-white' : 'text-textSecondary'}`}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {isCigarette ? (
            <View className="gap-4 rounded-2xl bg-infoLight p-4">
              <Text className="text-[13px] font-semibold font-jakarta-semibold text-info">
                Sold per stick (tingi)
              </Text>
              <Input
                label="Sticks per Pack"
                placeholder="e.g. 20"
                keyboardType="number-pad"
                value={piecesPerPack}
                onChangeText={setPiecesPerPack}
                error={errors.piecesPerPack}
              />
              <Input
                label="Price per Stick"
                placeholder="0.00"
                prefix="₱"
                keyboardType="decimal-pad"
                value={piecePrice}
                onChangeText={setPiecePrice}
                error={errors.piecePrice}
              />
            </View>
          ) : null}

          <View>
            <Text className="mb-2 text-[13px] font-medium font-jakarta-medium text-textSecondary">
              {isCigarette ? 'Stock (in sticks)' : 'Quantity'}
            </Text>
            {isCigarette ? (
              <Text className="mb-2 text-xs text-textSecondary">
                Enter the total number of individual sticks in stock, not packs.
              </Text>
            ) : null}
            <View className="flex-row items-center rounded-2xl border border-border bg-card px-4 py-3">
              <QuantityStepper value={quantity} onChange={setQuantity} min={0} />
            </View>
          </View>

          <Button
            title={isEditing ? 'Save Changes' : 'Add Product'}
            onPress={handleSubmit}
            size="lg"
            loading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
