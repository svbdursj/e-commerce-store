import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';
import { PRODUCTS_COLLECTION } from '../data/products';

interface ProductsContextType {
  products: Product[];
  lowStockCount: number;
  outOfStockCount: number;
  updateProductStock: (id: string, newStock: number) => void;
  updateProductPrice: (id: string, newPrice: number) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  resetCatalog: () => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'elite_store_clothing_products_v2';

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure valid array with items
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return PRODUCTS_COLLECTION;
    } catch {
      return PRODUCTS_COLLECTION;
    }
  });

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  const updateProductStock = (id: string, newStock: number) => {
    const validStock = Math.max(0, Math.floor(newStock));
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stockInventoryCount: validStock } : item))
    );
  };

  const updateProductPrice = (id: string, newPrice: number) => {
    const validPrice = Math.max(1, Math.round(newPrice));
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: validPrice } : item))
    );
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const resetCatalog = () => {
    setProducts(PRODUCTS_COLLECTION);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(PRODUCTS_COLLECTION));
    } catch (e) {
      console.error(e);
    }
  };

  // Low stock threshold <= 5 (including 0)
  const lowStockCount = products.filter((p) => p.stockInventoryCount <= 5).length;
  const outOfStockCount = products.filter((p) => p.stockInventoryCount === 0).length;

  return (
    <ProductsContext.Provider
      value={{
        products,
        lowStockCount,
        outOfStockCount,
        updateProductStock,
        updateProductPrice,
        updateProduct,
        addProduct,
        resetCatalog,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export function useProducts(): ProductsContextType {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
