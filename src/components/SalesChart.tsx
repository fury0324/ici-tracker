import React from 'react';
import { Text, View } from 'react-native';
import { DayTotal } from '../store/selectors';
import { cardShadow } from '../theme/shadow';

interface SalesChartProps {
  data: DayTotal[];
  height?: number;
}

export function SalesChart({ data, height = 120 }: SalesChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <View
      className="flex-row items-end justify-between rounded-2xl bg-card p-4"
      style={{ height: height + 56, ...cardShadow }}
    >
      {data.map((day) => {
        const barHeight = Math.max((day.total / maxTotal) * height, 4);
        return (
          <View key={day.label} className="flex-1 items-center justify-end">
            <View
              style={{ height: barHeight, width: 18 }}
              className={`rounded-full ${day.isToday ? 'bg-primary' : 'bg-chartBar'}`}
            />
            <Text
              className={`mt-2 text-[11px] ${
                day.isToday ? 'font-semibold font-jakarta-semibold text-primary' : 'text-textSecondary'
              }`}
            >
              {day.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
