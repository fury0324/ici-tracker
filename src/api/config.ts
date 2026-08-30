// "localhost" refers to the device the app runs on, not your dev machine, so
// this default only works for web preview and the iOS simulator. When
// testing on a physical device via Expo Go (or an Android emulator), set
// EXPO_PUBLIC_API_URL in the app's .env to your machine's LAN IP, e.g.
// EXPO_PUBLIC_API_URL=http://192.168.1.23:4000/api
const DEFAULT_API_URL = 'http://localhost:4000/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
