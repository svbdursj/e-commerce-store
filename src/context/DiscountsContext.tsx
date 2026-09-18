import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { PromoCode, DiscountType } from '../types';

interface DiscountsContextType {
  promoCodes: PromoCode[];
  appliedPromo: PromoCode | null;
  applyPromoCode: (codeString: string, currentSubtotal?: number) => { success: boolean; message: string; discountAmount?: number };
  removeAppliedPromo: () => void;
  calculateDiscount: (subtotal: number) => number;
  createPromoCode: (data: {
    code: string;
    discountType: DiscountType;
    value: number;
    isActive: boolean;
    description?: string;
    minimumSpend?: number;
  }) => { success: boolean; message: string };
  togglePromoStatus: (id: string) => void;
  deletePromoCode: (id: string) => void;
  resetPromoCodes: () => void;
}

const STORAGE_KEY = 'elite_store_discounts_v1';
const APPLIED_STORAGE_KEY = 'elite_store_applied_promo_v1';

/**
 * Initial internal database collection for active discounts
 * Fields: Code String, Discount Type (Percentage or Flat), Value, Active Status
 */
export const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-welcome-10',
    code: 'WELCOME10',
    discountType: 'percentage',
    value: 10,
    isActive: true,
    description: '10% welcome incentive for inaugural wardrobe acquisition',
    usageCount: 42,
    createdAt: '2026-01-10',
  },
  {
    id: 'promo-atelier-50',
    code: 'ATELIER50',
    discountType: 'flat',
    value: 50,
    isActive: true,
    description: '$50 archival credit for seasonal outerwear and knitwear',
    usageCount: 19,
    createdAt: '2026-02-14',
  },
  {
    id: 'promo-vip-20',
    code: 'VIP20',
    discountType: 'percentage',
    value: 20,
    isActive: true,
    description: '20% private collector tier benefit',
    usageCount: 8,
    createdAt: '2026-03-01',
  },
  {
    id: 'promo-archive-15',
    code: 'ARCHIVE15',
    discountType: 'percentage',
    value: 15,
    isActive: true,
    description: '15% off permanent archival collection',
    usageCount: 14,
    createdAt: '2026-03-12',
  },
  {
    id: 'promo-foundation-100',
    code: 'FOUNDATION100',
    discountType: 'flat',
    value: 100,
    isActive: false, // Inactive promo for testing active/inactive toggle
    description: '$100 private patron voucher (currently suspended)',
    usageCount: 3,
    createdAt: '2026-03-15',
  },
];

const DiscountsContext = createContext<DiscountsContextType | undefined>(undefined);

export const DiscountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_PROMO_CODES;
    } catch {
      return DEFAULT_PROMO_CODES;
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(() => {
    try {
      const savedApplied = localStorage.getItem(APPLIED_STORAGE_KEY);
      return savedApplied ? JSON.parse(savedApplied) : null;
    } catch {
      return null;
    }
  });

  // Sync promoCodes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(promoCodes));
    } catch (e) {
      console.error('Failed to persist promo codes', e);
    }
  }, [promoCodes]);

  // Sync appliedPromo to localStorage
  useEffect(() => {
    try {
      if (appliedPromo) {
        localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem(APPLIED_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist applied promo', e);
    }
  }, [appliedPromo]);

  // Keep applied promo active status up to date if owner disables it in admin
  useEffect(() => {
    if (appliedPromo) {
      const currentCodeInDb = promoCodes.find((p) => p.code === appliedPromo.code);
      if (!currentCodeInDb || !currentCodeInDb.isActive) {
        setAppliedPromo(null);
      } else if (
        currentCodeInDb.value !== appliedPromo.value ||
        currentCodeInDb.discountType !== appliedPromo.discountType
      ) {
        setAppliedPromo(currentCodeInDb);
      }
    }
  }, [promoCodes, appliedPromo]);

  /**
   * Calculate exact savings amount for a given subtotal
   */
  const calculateDiscount = (subtotal: number): number => {
    if (!appliedPromo || !appliedPromo.isActive || subtotal <= 0) return 0;

    if (appliedPromo.discountType === 'percentage') {
      const savings = Math.round((subtotal * appliedPromo.value) / 100);
      return Math.min(savings, subtotal);
    } else {
      // Flat dollar amount discount
      return Math.min(appliedPromo.value, subtotal);
    }
  };

  /**
   * Apply a promo code entered by the customer
   */
  const applyPromoCode = (
    codeString: string,
    currentSubtotal = 0
  ): { success: boolean; message: string; discountAmount?: number } => {
    const cleanCode = codeString.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a promo code.' };
    }

    const matchedPromo = promoCodes.find(
      (p) => p.code.toUpperCase() === cleanCode
    );

    if (!matchedPromo) {
      return {
        success: false,
        message: `Promo code "${cleanCode}" is not recognized or has expired.`,
      };
    }

    if (!matchedPromo.isActive) {
      return {
        success: false,
        message: `Promo code "${cleanCode}" is currently inactive.`,
      };
    }

    if (matchedPromo.minimumSpend && currentSubtotal < matchedPromo.minimumSpend) {
      return {
        success: false,
        message: `Promo code "${cleanCode}" requires a minimum order of $${matchedPromo.minimumSpend}. Current total: $${currentSubtotal}.`,
      };
    }

    setAppliedPromo(matchedPromo);

    // Increment usage count locally
    setPromoCodes((prev) =>
      prev.map((p) =>
        p.id === matchedPromo.id
          ? { ...p, usageCount: (p.usageCount || 0) + 1 }
          : p
      )
    );

    let calculatedSavings = 0;
    if (matchedPromo.discountType === 'percentage') {
      calculatedSavings = currentSubtotal > 0 ? Math.round((currentSubtotal * matchedPromo.value) / 100) : 0;
      return {
        success: true,
        message: `Promo code "${cleanCode}" applied! ${matchedPromo.value}% savings activated.`,
        discountAmount: calculatedSavings,
      };
    } else {
      calculatedSavings = currentSubtotal > 0 ? Math.min(matchedPromo.value, currentSubtotal) : matchedPromo.value;
      return {
        success: true,
        message: `Promo code "${cleanCode}" applied! $${matchedPromo.value} voucher credit deducted.`,
        discountAmount: calculatedSavings,
      };
    }
  };

  const removeAppliedPromo = () => {
    setAppliedPromo(null);
  };

  /**
   * Admin: Create a new Promo Code
   */
  const createPromoCode = (data: {
    code: string;
    discountType: DiscountType;
    value: number;
    isActive: boolean;
    description?: string;
    minimumSpend?: number;
  }): { success: boolean; message: string } => {
    const cleanCode = data.code.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      return { success: false, message: 'Code string cannot be empty.' };
    }

    const exists = promoCodes.some((p) => p.code.toUpperCase() === cleanCode);
    if (exists) {
      return { success: false, message: `Promo code "${cleanCode}" already exists.` };
    }

    if (data.value <= 0) {
      return { success: false, message: 'Discount value must be greater than zero.' };
    }

    if (data.discountType === 'percentage' && data.value > 100) {
      return { success: false, message: 'Percentage discount cannot exceed 100%.' };
    }

    const newPromo: PromoCode = {
      id: `promo-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      code: cleanCode,
      discountType: data.discountType,
      value: Math.round(data.value),
      isActive: data.isActive,
      description: data.description || `${data.value}${data.discountType === 'percentage' ? '%' : '$'} promotional discount`,
      minimumSpend: data.minimumSpend && data.minimumSpend > 0 ? data.minimumSpend : undefined,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setPromoCodes((prev) => [newPromo, ...prev]);
    return { success: true, message: `Promo code "${cleanCode}" successfully created.` };
  };

  /**
   * Admin: Toggle Active Status
   */
  const togglePromoStatus = (id: string) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  /**
   * Admin: Delete Promo Code
   */
  const deletePromoCode = (id: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
  };

  /**
   * Admin: Reset to default collection
   */
  const resetPromoCodes = () => {
    setPromoCodes(DEFAULT_PROMO_CODES);
    setAppliedPromo(null);
  };

  return (
    <DiscountsContext.Provider
      value={{
        promoCodes,
        appliedPromo,
        applyPromoCode,
        removeAppliedPromo,
        calculateDiscount,
        createPromoCode,
        togglePromoStatus,
        deletePromoCode,
        resetPromoCodes,
      }}
    >
      {children}
    </DiscountsContext.Provider>
  );
};

export const useDiscounts = (): DiscountsContextType => {
  const context = useContext(DiscountsContext);
  if (!context) {
    throw new Error('useDiscounts must be used within a DiscountsProvider');
  }
  return context;
};
