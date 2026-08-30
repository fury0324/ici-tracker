/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        primaryDark: '#4338CA',
        primaryLight: '#EEF2FF',
        chartBar: '#C7D2FE',
        background: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        success: '#16A34A',
        successLight: '#DCFCE7',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        danger: '#DC2626',
        dangerLight: '#FEE2E2',
        info: '#0891B2',
        infoLight: '#CFFAFE',
      },
      fontFamily: {
        jakarta: ['PlusJakartaSans_400Regular'],
        'jakarta-medium': ['PlusJakartaSans_500Medium'],
        'jakarta-semibold': ['PlusJakartaSans_600SemiBold'],
        'jakarta-bold': ['PlusJakartaSans_700Bold'],
        'jakarta-extrabold': ['PlusJakartaSans_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
