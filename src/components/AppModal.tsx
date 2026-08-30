import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { raisedShadow } from '../theme/shadow';

export type AppModalVariant = 'success' | 'danger' | 'warning' | 'info';

export interface AppModalButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AppModalProps {
  visible: boolean;
  variant: AppModalVariant;
  title: string;
  message?: string;
  buttons: AppModalButton[];
  onDismiss: () => void;
}

const VARIANT_CONFIG: Record<AppModalVariant, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: colors.success, bg: colors.successLight },
  danger: { icon: XCircle, color: colors.danger, bg: colors.dangerLight },
  warning: { icon: AlertTriangle, color: colors.warning, bg: colors.warningLight },
  info: { icon: Info, color: colors.primary, bg: colors.primaryLight },
};

const BUTTON_STYLES: Record<NonNullable<AppModalButton['style']>, { container: string; text: string }> = {
  default: { container: 'bg-primary', text: 'text-white' },
  destructive: { container: 'bg-danger', text: 'text-white' },
  cancel: { container: 'bg-background', text: 'text-textPrimary' },
};

export function AppModal({ visible, variant, title, message, buttons, onDismiss }: AppModalProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { icon: Icon, color, bg } = VARIANT_CONFIG[variant];
  const stackedButtons = buttons.length > 2;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.9);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  function handlePress(button: AppModalButton) {
    onDismiss();
    button.onPress?.();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
      >
        <Animated.View style={{ opacity, transform: [{ scale }], width: '100%', maxWidth: 340 }}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="items-center rounded-3xl bg-card p-6" style={raisedShadow}>
              <View
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: bg }}
              >
                <Icon size={28} color={color} strokeWidth={2} />
              </View>

              <Text className="mt-4 text-center text-[18px] font-bold font-jakarta-bold text-textPrimary">
                {title}
              </Text>

              {message ? (
                <Text className="mt-2 text-center text-[14px] font-jakarta text-textSecondary">
                  {message}
                </Text>
              ) : null}

              <View className={`mt-6 w-full gap-2.5 ${stackedButtons ? '' : 'flex-row'}`}>
                {buttons.map((button, index) => {
                  const buttonStyle = BUTTON_STYLES[button.style ?? 'default'];
                  return (
                    <Pressable
                      key={`${button.text}-${index}`}
                      onPress={() => handlePress(button)}
                      className={`items-center rounded-2xl px-4 py-3.5 ${buttonStyle.container} ${
                        stackedButtons ? 'w-full' : 'flex-1'
                      }`}
                    >
                      <Text className={`text-[15px] font-semibold font-jakarta-semibold ${buttonStyle.text}`}>
                        {button.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
