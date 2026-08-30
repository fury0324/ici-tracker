import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Package, ShoppingCart, BarChart3 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { raisedShadow } from '../theme/shadow';

const ICONS: Record<string, typeof Home> = {
  Home: Home,
  Products: Package,
  POS: ShoppingCart,
  Reports: BarChart3,
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background px-4"
      style={{ paddingBottom: insets.bottom + 12, paddingTop: 8 }}
    >
      <View
        className="flex-row items-center justify-between rounded-[28px] bg-card px-2 py-2"
        style={raisedShadow}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const Icon = ICONS[route.name] ?? Home;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : (options.title ?? route.name);

          function onPress() {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              className="flex-1 items-center"
            >
              <View
                className={`flex-row items-center gap-1.5 rounded-full ${
                  isFocused ? 'bg-primaryLight px-4 py-2.5' : 'px-3 py-2.5'
                }`}
              >
                <Icon size={20} color={isFocused ? colors.primary : colors.textSecondary} strokeWidth={2.2} />
                {isFocused ? (
                  <Text
                    className="text-[13px] font-semibold font-jakarta-semibold"
                    style={{ color: colors.primary }}
                  >
                    {label}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
