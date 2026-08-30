import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Receipt, Trophy, CalendarDays, TrendingUp, Wallet } from 'lucide-react-native';
import { useAppStore } from '../store/appStore';
import {
  getTopSellingProducts,
  getTransactionsWithinDays,
  getWeeklySalesChart,
  sumTransactions,
} from '../store/selectors';
import { formatCurrency } from '../utils/currency';
import { EmptyState, SalesChart, SectionHeader, TransactionCard } from '../components';
import { cardShadow } from '../theme/shadow';

export function ReportsScreen() {
  const { products, transactions } = useAppStore();

  const todayIncome = useMemo(() => sumTransactions(getTransactionsWithinDays(transactions, 1)), [transactions]);
  const weekIncome = useMemo(() => sumTransactions(getTransactionsWithinDays(transactions, 7)), [transactions]);
  const monthIncome = useMemo(() => sumTransactions(getTransactionsWithinDays(transactions, 30)), [transactions]);
  const weeklySales = useMemo(() => getWeeklySalesChart(transactions), [transactions]);
  const topProducts = useMemo(() => getTopSellingProducts(products, 5), [products]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text className="text-[12px] font-bold font-jakarta-bold uppercase tracking-[1.5px] text-primary">
          Analytics
        </Text>
        <Text className="mt-1 text-[30px] font-extrabold font-jakarta-extrabold tracking-tight text-textPrimary">
          Reports
        </Text>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-card p-3.5" style={cardShadow}>
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-primaryLight">
              <CalendarDays size={15} color="#4F46E5" />
            </View>
            <Text className="mt-2 text-[11px] font-medium font-jakarta-medium text-textSecondary">Today</Text>
            <Text className="mt-0.5 text-[14px] font-extrabold font-jakarta-extrabold text-textPrimary">
              {formatCurrency(todayIncome)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-card p-3.5" style={cardShadow}>
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-infoLight">
              <TrendingUp size={15} color="#0891B2" />
            </View>
            <Text className="mt-2 text-[11px] font-medium font-jakarta-medium text-textSecondary">This Week</Text>
            <Text className="mt-0.5 text-[14px] font-extrabold font-jakarta-extrabold text-textPrimary">
              {formatCurrency(weekIncome)}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-card p-3.5" style={cardShadow}>
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-successLight">
              <Wallet size={15} color="#16A34A" />
            </View>
            <Text className="mt-2 text-[11px] font-medium font-jakarta-medium text-textSecondary">This Month</Text>
            <Text className="mt-0.5 text-[14px] font-extrabold font-jakarta-extrabold text-textPrimary">
              {formatCurrency(monthIncome)}
            </Text>
          </View>
        </View>

        <View className="mt-6">
          <SectionHeader title="Sales Chart" />
          <SalesChart data={weeklySales} />
        </View>

        <View className="mt-6">
          <SectionHeader title="Top Selling Products" />
          <View className="gap-2.5">
            {topProducts.map((product, index) => (
              <View
                key={product.id}
                className="flex-row items-center justify-between rounded-2xl bg-card p-4"
                style={cardShadow}
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-primaryLight">
                    {index === 0 ? (
                      <Trophy size={15} color="#4F46E5" />
                    ) : (
                      <Text className="text-[13px] font-bold font-jakarta-bold text-primary">{index + 1}</Text>
                    )}
                  </View>
                  <Text className="text-[14px] font-semibold font-jakarta-semibold text-textPrimary">{product.name}</Text>
                </View>
                <Text className="text-[13px] text-textSecondary">{product.unitsSold} sold</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6">
          <SectionHeader title="Transaction History" />
          {transactions.length === 0 ? (
            <EmptyState
              icon={<Receipt size={26} color="#4F46E5" />}
              title="No transactions yet"
              description="Completed sales will appear here."
            />
          ) : (
            <View className="gap-2.5">
              {transactions.slice(0, 20).map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} showDate />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
