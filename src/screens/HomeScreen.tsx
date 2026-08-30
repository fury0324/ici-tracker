import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, AlertTriangle, Receipt, Wallet, TrendingUp, TrendingDown, LogOut } from 'lucide-react-native';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useAppModal } from '../store/modalStore';
import {
  getIncomeChangePercent,
  getLowStockProducts,
  getTodaysTransactions,
  getWeeklySalesChart,
  sumTransactions,
} from '../store/selectors';
import { formatCurrency } from '../utils/currency';
import { StatCard, TransactionCard, SectionHeader, EmptyState, SalesChart } from '../components';
import { cardShadow } from '../theme/shadow';

export function HomeScreen() {
  const { products, transactions } = useAppStore();
  const { logout } = useAuthStore();
  const { showModal } = useAppModal();

  function handleLogout() {
    showModal({
      variant: 'danger',
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ],
    });
  }

  const todaysTransactions = useMemo(() => getTodaysTransactions(transactions), [transactions]);
  const todaysIncome = useMemo(() => sumTransactions(todaysTransactions), [todaysTransactions]);
  const changePercent = useMemo(() => getIncomeChangePercent(transactions), [transactions]);
  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products]);
  const weeklySales = useMemo(() => getWeeklySalesChart(transactions), [transactions]);
  const recentTransactions = useMemo(() => transactions.slice(0, 4), [transactions]);

  const isPositiveChange = changePercent >= 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-[12px] font-bold font-jakarta-bold uppercase tracking-[1.5px] text-primary">
              Overview
            </Text>
            <Text className="mt-1 text-[30px] font-extrabold font-jakarta-extrabold tracking-tight text-textPrimary">
              Sari-Sari Store
            </Text>
          </View>
          <Pressable
            onPress={handleLogout}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-card"
            style={cardShadow}
          >
            <LogOut size={18} color="#DC2626" />
          </Pressable>
        </View>

        <LinearGradient
          colors={['#4F46E5', '#4338CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginTop: 24,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#4338CA',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Text className="text-[13px] font-semibold font-jakarta-semibold uppercase tracking-wider text-white/75">
            Today's Sales
          </Text>
          <Text className="mt-1.5 text-[34px] font-extrabold font-jakarta-extrabold tracking-tight text-white">
            {formatCurrency(todaysIncome)}
          </Text>
          <View className="mt-2 flex-row items-center gap-1">
            {isPositiveChange ? (
              <TrendingUp size={14} color="#FFFFFF" />
            ) : (
              <TrendingDown size={14} color="#FFFFFF" />
            )}
            <Text className="text-xs font-medium font-jakarta-medium text-white/90">
              {isPositiveChange ? '+' : ''}
              {changePercent.toFixed(1)}% from yesterday
            </Text>
          </View>
        </LinearGradient>

        <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
          <StatCard
            label="Total Products"
            value={String(products.length)}
            icon={<Package size={20} color="#4F46E5" />}
            tint="primary"
          />
          <StatCard
            label="Low Stock"
            value={String(lowStockProducts.length)}
            icon={<AlertTriangle size={20} color="#F59E0B" />}
            tint="warning"
          />
          <StatCard
            label="Today's Transactions"
            value={String(todaysTransactions.length)}
            icon={<Receipt size={20} color="#0891B2" />}
            tint="info"
          />
          <StatCard
            label="Today's Income"
            value={formatCurrency(todaysIncome)}
            icon={<Wallet size={20} color="#16A34A" />}
            tint="success"
          />
        </View>

        <View className="mt-6">
          <SectionHeader title="Sales Overview" />
          <SalesChart data={weeklySales} />
        </View>

        <View className="mt-6">
          <SectionHeader title="Recent Transactions" />
          {recentTransactions.length === 0 ? (
            <EmptyState
              icon={<Receipt size={26} color="#4F46E5" />}
              title="No sales yet"
              description="Completed sales will show up here."
            />
          ) : (
            <View className="gap-2.5">
              {recentTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
