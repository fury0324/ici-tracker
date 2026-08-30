import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CartItem, PaymentMethod, Product, SaleUnit, Transaction } from '../types';
import { useAuthStore } from './authStore';
import { ProductInput, createProductRequest, deleteProductRequest, fetchProducts, updateProductRequest } from '../api/products';
import { checkoutRequest, fetchTransactions } from '../api/transactions';
import { ApiClientError } from '../api/client';

function getErrorMessage(err: unknown): string {
  return err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.';
}

interface AppStoreContextValue {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  isLoading: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
  addProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: string, input: Partial<ProductInput>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  addToCart: (productId: string, unit?: SaleUnit) => void;
  updateCartQuantity: (productId: string, unit: SaleUnit, quantity: number) => void;
  removeFromCart: (productId: string, unit: SaleUnit) => void;
  clearCart: () => void;
  checkout: (paymentMethod: PaymentMethod, amountReceived: number | null) => Promise<Transaction>;
}

const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Tracks whether the first load has ever completed, so later background
  // refreshes (e.g. after checkout) update data in place instead of
  // re-triggering the full-screen loading gate and unmounting the navigator.
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    if (!hasLoadedRef.current) setIsLoading(true);
    setLoadError(null);
    try {
      const [productsRes, transactionsRes] = await Promise.all([fetchProducts(token), fetchTransactions(token)]);
      setProducts(productsRes.products);
      setTransactions(transactionsRes.transactions);
      hasLoadedRef.current = true;
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProduct = useCallback(
    async (input: ProductInput) => {
      if (!token) throw new Error('Not authenticated.');
      const { product } = await createProductRequest(token, input);
      setProducts((prev) => [product, ...prev]);
      return product;
    },
    [token]
  );

  const updateProduct = useCallback(
    async (id: string, input: Partial<ProductInput>) => {
      if (!token) throw new Error('Not authenticated.');
      const { product } = await updateProductRequest(token, id, input);
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
      return product;
    },
    [token]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      if (!token) throw new Error('Not authenticated.');
      await deleteProductRequest(token, id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((c) => c.productId !== id));
    },
    [token]
  );

  const addToCart = useCallback(
    (productId: string, unit: SaleUnit = 'piece') => {
      setCart((prev) => {
        const product = products.find((p) => p.id === productId);
        if (!product || product.stock <= 0) return prev;

        const maxQuantity =
          unit === 'pack' ? Math.floor(product.stock / (product.piecesPerPack || 1)) : product.stock;
        if (maxQuantity <= 0) return prev;

        const existing = prev.find((c) => c.productId === productId && c.unit === unit);
        if (existing) {
          if (existing.quantity >= maxQuantity) return prev;
          return prev.map((c) =>
            c.productId === productId && c.unit === unit ? { ...c, quantity: c.quantity + 1 } : c
          );
        }

        return [...prev, { productId, unit, quantity: 1 }];
      });
    },
    [products]
  );

  const updateCartQuantity = useCallback(
    (productId: string, unit: SaleUnit, quantity: number) => {
      setCart((prev) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return prev;

        if (quantity <= 0) {
          return prev.filter((c) => !(c.productId === productId && c.unit === unit));
        }

        const maxQuantity =
          unit === 'pack' ? Math.floor(product.stock / (product.piecesPerPack || 1)) : product.stock;
        const clampedQuantity = Math.min(quantity, maxQuantity);
        return prev.map((c) =>
          c.productId === productId && c.unit === unit ? { ...c, quantity: clampedQuantity } : c
        );
      });
    },
    [products]
  );

  const removeFromCart = useCallback((productId: string, unit: SaleUnit) => {
    setCart((prev) => prev.filter((c) => !(c.productId === productId && c.unit === unit)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback(
    async (paymentMethod: PaymentMethod, amountReceived: number | null) => {
      if (!token) throw new Error('Not authenticated.');
      const { transaction } = await checkoutRequest(token, { items: cart, paymentMethod, amountReceived });
      setCart([]);
      await refresh();
      return transaction;
    },
    [token, cart, refresh]
  );

  const value = useMemo<AppStoreContextValue>(
    () => ({
      products,
      cart,
      transactions,
      isLoading,
      loadError,
      refresh,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      checkout,
    }),
    [
      products,
      cart,
      transactions,
      isLoading,
      loadError,
      refresh,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      checkout,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreContextValue {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}
