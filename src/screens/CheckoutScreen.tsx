import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Banknote, CreditCard, Smartphone } from 'lucide-react-native';
import { POSStackParamList } from '../navigation/types';
import { useAppStore } from '../store/appStore';
import { useAppModal } from '../store/modalStore';
import { PaymentMethod } from '../types';
import { formatCurrency } from '../utils/currency';
import { getUnitPrice } from '../utils/pricing';
import { Button, Input, PaymentMethodButton } from '../components';
import { cardShadow } from '../theme/shadow';

type Props = NativeStackScreenProps<POSStackParamList, 'Checkout'>;

const PAYMENT_ICONS: Record<PaymentMethod, (selected: boolean) => React.ReactNode> = {
  Cash: (selected) => <Banknote size={20} color={selected ? '#4F46E5' : '#0F172A'} />,
  GCash: (selected) => <Smartphone size={20} color={selected ? '#4F46E5' : '#0F172A'} />,
  Card: (selected) => <CreditCard size={20} color={selected ? '#4F46E5' : '#0F172A'} />,
};

export function CheckoutScreen({ navigation }: Props) {
  const { cart, products, checkout } = useAppStore();
  const { showModal } = useAppModal();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? getUnitPrice(product, item.unit) * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  const receivedAmount = Number(amountReceived) || 0;
  const change = paymentMethod === 'Cash' ? Math.max(receivedAmount - subtotal, 0) : 0;

  async function handleCompleteSale() {
    if (cart.length === 0) return;

    if (paymentMethod === 'Cash' && receivedAmount < subtotal) {
      showModal({
        variant: 'warning',
        title: 'Insufficient Amount',
        message: 'Amount received must cover the total due.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await checkout(paymentMethod, paymentMethod === 'Cash' ? receivedAmount : null);

      showModal({
        variant: 'success',
        title: 'Sale Complete',
        message: 'The transaction was recorded successfully.',
        buttons: [{ text: 'Done', onPress: () => navigation.popToTop() }],
      });
    } catch (err) {
      showModal({
        variant: 'danger',
        title: 'Checkout Failed',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsProcessing(false);
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
        <Text className="text-[20px] font-semibold font-jakarta-semibold text-textPrimary">Checkout</Text>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}>
          <LinearGradient
            colors={['#4F46E5', '#4338CA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              alignItems: 'center',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#4338CA',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text className="text-[13px] font-medium font-jakarta-medium text-white/80">Total Due</Text>
            <Text className="mt-1 text-[34px] font-bold font-jakarta-bold text-white">{formatCurrency(subtotal)}</Text>
          </LinearGradient>

          <View>
            <Text className="mb-2 text-[13px] font-medium font-jakarta-medium text-textSecondary">Payment Method</Text>
            <View className="flex-row gap-3">
              {(['Cash', 'GCash', 'Card'] as PaymentMethod[]).map((method) => (
                <PaymentMethodButton
                  key={method}
                  method={method}
                  selected={paymentMethod === method}
                  onPress={() => setPaymentMethod(method)}
                  icon={PAYMENT_ICONS[method](paymentMethod === method)}
                />
              ))}
            </View>
          </View>

          {paymentMethod === 'Cash' ? (
            <>
              <Input
                label="Amount Received"
                placeholder="0.00"
                prefix="₱"
                keyboardType="decimal-pad"
                value={amountReceived}
                onChangeText={setAmountReceived}
              />
              <View className="flex-row items-center justify-between rounded-2xl bg-card p-4" style={cardShadow}>
                <Text className="text-[15px] font-medium font-jakarta-medium text-textSecondary">Change</Text>
                <Text className="text-[20px] font-bold font-jakarta-bold text-success">{formatCurrency(change)}</Text>
              </View>
            </>
          ) : null}

          <Button
            title="Complete Sale"
            onPress={handleCompleteSale}
            disabled={cart.length === 0}
            loading={isProcessing}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
