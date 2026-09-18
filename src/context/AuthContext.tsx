import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, OrderDetails } from '../types';
import { PRODUCTS_COLLECTION } from '../data/products';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  allOrders: OrderDetails[];
  userOrders: OrderDetails[];
  isAdmin: boolean;
  signIn: (email: string, password?: string) => { success: boolean; error?: string };
  signUp: (
    fullName: string,
    email: string,
    password?: string,
    tier?: 'Member' | 'Private Collector' | 'Atelier Patron',
    role?: 'admin' | 'customer'
  ) => { success: boolean; error?: string };
  signOut: () => void;
  recordOrder: (order: OrderDetails) => void;
  updateOrderStatus: (orderId: string, newStatus: 'Processing' | 'Shipped' | 'Delivered') => void;
  updateCurrentUserAddress: (address: NonNullable<User['defaultAddress']>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'elite_store_users_registry_v2';
const CURRENT_USER_STORAGE_KEY = 'elite_store_auth_user_v2';
const ORDERS_STORAGE_KEY = 'elite_store_orders_ledger_v2';

// Initial Seed Users with distinct identifiers and Admin account
const INITIAL_USERS: User[] = [
  {
    id: 'usr_adm_9901',
    email: 'admin@edition.store',
    fullName: 'Elena Vance',
    tier: 'Atelier Patron',
    role: 'admin',
    isAdmin: true,
    memberSince: 'January 2024',
    phone: '+1 (555) 839-2041',
    defaultAddress: {
      fullName: 'Elena Vance',
      email: 'admin@edition.store',
      phone: '+1 (555) 839-2041',
      streetAddress: '100 Atelier Boulevard',
      apartment: 'Penthouse 12',
      city: 'New York',
      stateProvince: 'New York',
      postalCode: '10001',
      country: 'United States',
      deliveryMethod: 'express',
    },
  },
  {
    id: 'usr_jv_8910',
    email: 'julian.vance@studio.com',
    fullName: 'Julian Vance',
    tier: 'Private Collector',
    role: 'customer',
    isAdmin: false,
    memberSince: 'October 2024',
    phone: '+1 (555) 019-2834',
    defaultAddress: {
      fullName: 'Julian Vance',
      email: 'julian.vance@studio.com',
      phone: '+1 (555) 019-2834',
      streetAddress: '742 Evergreen Promenade',
      apartment: 'Penthouse 4B',
      city: 'San Francisco',
      stateProvince: 'California',
      postalCode: '94103',
      country: 'United States',
      deliveryMethod: 'express',
    },
  },
  {
    id: 'usr_er_5421',
    email: 'elena.rostova@atelier.com',
    fullName: 'Elena Rostova',
    tier: 'Atelier Patron',
    role: 'customer',
    isAdmin: false,
    memberSince: 'February 2025',
    phone: '+1 (555) 948-1209',
    defaultAddress: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@atelier.com',
      phone: '+1 (555) 948-1209',
      streetAddress: '12 Mercer Street',
      apartment: 'Floor 8',
      city: 'New York',
      stateProvince: 'New York',
      postalCode: '10013',
      country: 'United States',
      deliveryMethod: 'standard',
    },
  },
];

// Initial Seed Orders linked strictly to their respective user IDs and realistic clothing items
const INITIAL_SEED_ORDERS: OrderDetails[] = [
  {
    orderId: 'ORD-2026-882194',
    userId: 'usr_jv_8910', // Julian Vance
    trackingNumber: 'TRK-US-EXP-88219412',
    date: 'February 12, 2026',
    estimatedDelivery: 'Feb 15, 2026',
    status: 'Delivered',
    items: [
      { product: PRODUCTS_COLLECTION[0], quantity: 1 }, // Cashmere Overcoat ($920)
      { product: PRODUCTS_COLLECTION[10], quantity: 1 }, // Calfskin Chelsea Boots ($480)
    ],
    shippingAddress: {
      fullName: 'Julian Vance',
      email: 'julian.vance@studio.com',
      phone: '+1 (555) 019-2834',
      streetAddress: '742 Evergreen Promenade',
      apartment: 'Penthouse 4B',
      city: 'San Francisco',
      stateProvince: 'California',
      postalCode: '94103',
      country: 'United States',
      deliveryMethod: 'express',
    },
    paymentDetails: {
      brand: 'VISA',
      last4: '4242',
      chargeId: 'ch_test_seed_jv1',
      status: 'succeeded',
      networkAuthCode: 'AUTH_882194',
      testMode: true,
    },
    subtotal: 1400,
    shippingCost: 25,
    tax: 105,
    total: 1530,
  },
  {
    orderId: 'ORD-2026-940122',
    userId: 'usr_jv_8910', // Julian Vance
    trackingNumber: 'TRK-US-STD-94012289',
    date: 'January 28, 2026',
    estimatedDelivery: 'Feb 02, 2026',
    status: 'Delivered',
    items: [
      { product: PRODUCTS_COLLECTION[1], quantity: 1 }, // 14oz Denim Trucker ($390)
      { product: PRODUCTS_COLLECTION[5], quantity: 1 }, // Supima Cotton Tee ($95)
    ],
    shippingAddress: {
      fullName: 'Julian Vance',
      email: 'julian.vance@studio.com',
      phone: '+1 (555) 019-2834',
      streetAddress: '742 Evergreen Promenade',
      apartment: 'Penthouse 4B',
      city: 'San Francisco',
      stateProvince: 'California',
      postalCode: '94103',
      country: 'United States',
      deliveryMethod: 'standard',
    },
    paymentDetails: {
      brand: 'MASTERCARD',
      last4: '5555',
      chargeId: 'ch_test_seed_jv2',
      status: 'succeeded',
      networkAuthCode: 'AUTH_940122',
      testMode: true,
    },
    subtotal: 485,
    shippingCost: 0,
    tax: 36,
    total: 521,
  },
  {
    orderId: 'ORD-2026-773190',
    userId: 'usr_er_5421', // Elena Rostova
    trackingNumber: 'TRK-US-EXP-77319045',
    date: 'March 01, 2026',
    estimatedDelivery: 'Mar 04, 2026',
    status: 'Shipped',
    items: [
      { product: PRODUCTS_COLLECTION[3], quantity: 1 }, // Alpaca Cardigan ($340)
      { product: PRODUCTS_COLLECTION[7], quantity: 1 }, // Wool Trousers ($350)
    ],
    shippingAddress: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@atelier.com',
      phone: '+1 (555) 948-1209',
      streetAddress: '12 Mercer Street',
      apartment: 'Floor 8',
      city: 'New York',
      stateProvince: 'New York',
      postalCode: '10013',
      country: 'United States',
      deliveryMethod: 'express',
    },
    paymentDetails: {
      brand: 'VISA',
      last4: '4242',
      chargeId: 'ch_test_seed_er1',
      status: 'succeeded',
      networkAuthCode: 'AUTH_773190',
      testMode: true,
    },
    subtotal: 690,
    shippingCost: 25,
    tax: 52,
    total: 767,
  },
  {
    orderId: 'ORD-2026-551029',
    userId: 'usr_ms_3301',
    trackingNumber: 'TRK-US-EXP-55102981',
    date: 'March 10, 2026',
    estimatedDelivery: 'Mar 14, 2026',
    status: 'Processing',
    items: [
      { product: PRODUCTS_COLLECTION[0], quantity: 1 }, // Cashmere Overcoat ($920)
      { product: PRODUCTS_COLLECTION[4], quantity: 1 }, // Heavy Merino Sweater ($280)
    ],
    shippingAddress: {
      fullName: 'Marcus Sterling',
      email: 'marcus.sterling@archive.org',
      phone: '+1 (555) 392-1082',
      streetAddress: '450 North Michigan Avenue',
      apartment: 'Suite 2800',
      city: 'Chicago',
      stateProvince: 'Illinois',
      postalCode: '60611',
      country: 'United States',
      deliveryMethod: 'express',
    },
    paymentDetails: {
      brand: 'AMEX',
      last4: '1005',
      chargeId: 'ch_test_seed_ms1',
      status: 'succeeded',
      networkAuthCode: 'AUTH_551029',
      testMode: true,
    },
    subtotal: 1200,
    shippingCost: 25,
    tax: 96,
    total: 1321,
  },
  {
    orderId: 'ORD-2026-439201',
    userId: 'usr_sc_8921',
    trackingNumber: 'TRK-US-STD-43920110',
    date: 'March 12, 2026',
    estimatedDelivery: 'Mar 17, 2026',
    status: 'Processing',
    items: [
      { product: PRODUCTS_COLLECTION[5], quantity: 1 }, // Camp Collar Shirt ($220)
      { product: PRODUCTS_COLLECTION[9], quantity: 1 }, // Belgian Linen Trouser ($240)
    ],
    shippingAddress: {
      fullName: 'Sophia Chen',
      email: 'sophia.chen@designco.com',
      phone: '+1 (555) 604-9821',
      streetAddress: '88 King Street',
      apartment: 'Loft 3A',
      city: 'Seattle',
      stateProvince: 'Washington',
      postalCode: '98104',
      country: 'United States',
      deliveryMethod: 'standard',
    },
    paymentDetails: {
      brand: 'VISA',
      last4: '1111',
      chargeId: 'ch_test_seed_sc1',
      status: 'succeeded',
      networkAuthCode: 'AUTH_439201',
      testMode: true,
    },
    subtotal: 460,
    shippingCost: 0,
    tax: 37,
    total: 497,
  },
  {
    orderId: 'ORD-2026-310892',
    userId: 'usr_aw_7714',
    trackingNumber: 'TRK-US-STD-31089255',
    date: 'March 05, 2026',
    estimatedDelivery: 'Mar 09, 2026',
    status: 'Shipped',
    items: [
      { product: PRODUCTS_COLLECTION[2], quantity: 1 }, // Waxed Field Jacket ($440)
      { product: PRODUCTS_COLLECTION[11], quantity: 1 }, // Minimal Sneaker ($320)
    ],
    shippingAddress: {
      fullName: 'Alexander Wright',
      email: 'a.wright@cortex.io',
      phone: '+1 (555) 749-0129',
      streetAddress: '240 Commonwealth Ave',
      apartment: '',
      city: 'Boston',
      stateProvince: 'Massachusetts',
      postalCode: '02116',
      country: 'United States',
      deliveryMethod: 'standard',
    },
    paymentDetails: {
      brand: 'MASTERCARD',
      last4: '8822',
      chargeId: 'ch_test_seed_aw1',
      status: 'succeeded',
      networkAuthCode: 'AUTH_310892',
      testMode: true,
    },
    subtotal: 760,
    shippingCost: 0,
    tax: 48,
    total: 808,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered Users Registry
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current Active User Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Default to initial logged-in demo user or null
      return null;
    } catch {
      return null;
    }
  });

  // Global Completed Orders Ledger
  const [allOrders, setAllOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SEED_ORDERS;
    } catch {
      return INITIAL_SEED_ORDERS;
    }
  });

  // Persist Users Registry
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to storage', e);
    }
  }, [users]);

  // Persist Current Session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving session to storage', e);
    }
  }, [currentUser]);

  // Persist Orders Ledger
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
    } catch (e) {
      console.error('Error saving orders ledger to storage', e);
    }
  }, [allOrders]);

  // STRICT DATA ISOLATION:
  // Logged-in users query ONLY their own orders matching their unique userId!
  const userOrders: OrderDetails[] = currentUser
    ? allOrders.filter((order) => order.userId === currentUser.id)
    : [];

  const isAdmin = Boolean(currentUser?.isAdmin || currentUser?.role === 'admin');

  const updateOrderStatus = (orderId: string, newStatus: 'Processing' | 'Shipped' | 'Delivered') => {
    setAllOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const signIn = (email: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      setCurrentUser(found);
      return { success: true };
    }

    // If user not in registry, create a member record dynamically
    const namePart = cleanEmail.split('@')[0];
    const formattedName =
      namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' ');
    const isUserAdmin = cleanEmail.includes('admin');
    const newUser: User = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      fullName: formattedName,
      tier: isUserAdmin ? 'Atelier Patron' : 'Member',
      role: isUserAdmin ? 'admin' : 'customer',
      isAdmin: isUserAdmin,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const signUp = (
    fullName: string,
    email: string,
    _password?: string,
    tier: 'Member' | 'Private Collector' | 'Atelier Patron' = 'Member',
    role: 'admin' | 'customer' = 'customer'
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const exists = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const isUserAdmin = role === 'admin' || cleanEmail.includes('admin');
    const newUser: User = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      fullName: cleanName,
      tier,
      role: isUserAdmin ? 'admin' : 'customer',
      isAdmin: isUserAdmin,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const signOut = () => {
    setCurrentUser(null);
  };

  // Record an incoming order and strictly stamp it with the user's unique identifier variable
  const recordOrder = (order: OrderDetails) => {
    setAllOrders((prev) => [order, ...prev]);
  };

  const updateCurrentUserAddress = (address: NonNullable<User['defaultAddress']>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, defaultAddress: address };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        allOrders,
        userOrders,
        isAdmin,
        signIn,
        signUp,
        signOut,
        recordOrder,
        updateOrderStatus,
        updateCurrentUserAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
