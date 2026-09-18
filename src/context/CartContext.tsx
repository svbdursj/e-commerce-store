import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, OrderDetails } from '../types';

interface CartContextType {
  cart: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  isCheckoutOpen: boolean;
  completedOrder: OrderDetails | null;
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  setCompletedOrder: (order: OrderDetails | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'elite_store_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    const chosenSize = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && (item.selectedSize || '') === (chosenSize || '')
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(
          updated[existingIndex].quantity + quantity,
          product.stockInventoryCount
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          selectedSize: chosenSize,
        };
        return updated;
      } else {
        const initialQty = Math.min(quantity, product.stockInventoryCount);
        return [...prevCart, { product, quantity: initialQty, selectedSize: chosenSize }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        const match =
          item.product.id === productId &&
          (selectedSize === undefined || (item.selectedSize || '') === (selectedSize || ''));
        if (match) {
          const maxStock = item.product.stockInventoryCount;
          return {
            ...item,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        if (selectedSize === undefined) {
          return item.product.id !== productId;
        }
        return !(item.product.id === productId && (item.selectedSize || '') === (selectedSize || ''));
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItemsCount,
        subtotal,
        isDrawerOpen,
        isCheckoutOpen,
        completedOrder,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        openCheckout: () => {
          setIsDrawerOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),
        setCompletedOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
