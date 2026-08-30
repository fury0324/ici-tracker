import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeStackParamList,
  POSStackParamList,
  ProductsStackParamList,
  ReportsStackParamList,
  RootTabParamList,
} from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { AddProductScreen } from '../screens/AddProductScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { POSScreen } from '../screens/POSScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const POSStack = createNativeStackNavigator<POSStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function ProductsStackNavigator() {
  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStack.Screen name="ProductsList" component={ProductsScreen} />
      <ProductsStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <ProductsStack.Screen name="AddProduct" component={AddProductScreen} />
    </ProductsStack.Navigator>
  );
}

function POSStackNavigator() {
  return (
    <POSStack.Navigator screenOptions={{ headerShown: false }}>
      <POSStack.Screen name="POSMain" component={POSScreen} />
      <POSStack.Screen name="Checkout" component={CheckoutScreen} />
    </POSStack.Navigator>
  );
}

function ReportsStackNavigator() {
  return (
    <ReportsStack.Navigator screenOptions={{ headerShown: false }}>
      <ReportsStack.Screen name="ReportsMain" component={ReportsScreen} />
    </ReportsStack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Products" component={ProductsStackNavigator} />
        <Tab.Screen name="POS" component={POSStackNavigator} />
        <Tab.Screen name="Reports" component={ReportsStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
