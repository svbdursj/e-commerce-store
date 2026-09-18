export type NavTab = 'home' | 'catalog' | 'account' | 'order-confirmation' | 'admin';

export type ProductCategory = 'All' | 'Outerwear' | 'Knitwear' | 'Tops' | 'Bottoms' | 'Footwear';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'Outerwear' | 'Knitwear' | 'Tops' | 'Bottoms' | 'Footwear' | string;
  imageUrl: string;
  stockInventoryCount: number;
  dimensions?: string;
  materials?: string;
  sizes?: string[];
  color?: string;
}

export interface NavItem {
  id: string;
  label: string;
  tab: NavTab;
  href: string;
}

export interface ProductStandard {
  id: string;
  metric: string;
  title: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export type DiscountType = 'percentage' | 'flat';

export interface PromoCode {
  id: string;
  code: string; // Code String (e.g. 'WELCOME10')
  discountType: DiscountType; // Discount Type: Percentage or Flat
  value: number; // Value (e.g. 10 for 10% or 50 for $50 flat)
  isActive: boolean; // Active Status
  description?: string;
  minimumSpend?: number;
  usageCount?: number;
  createdAt?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  deliveryMethod: 'standard' | 'express';
}

export interface User {
  id: string; // Unique user identifier variable
  email: string;
  fullName: string;
  tier: 'Member' | 'Private Collector' | 'Atelier Patron';
  memberSince: string;
  phone?: string;
  defaultAddress?: Partial<ShippingAddress>;
  role?: 'admin' | 'customer';
  isAdmin?: boolean;
}

export interface PaymentDetails {
  brand: string;
  last4: string;
  chargeId: string;
  status: 'succeeded' | 'processing';
  networkAuthCode: string;
  testMode: boolean;
}

export interface OrderDetails {
  orderId: string;
  userId: string; // Direct link to unique user identifier variable
  trackingNumber: string;
  date: string;
  estimatedDelivery: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'In Vault Packaging' | 'In Transit';
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentDetails: PaymentDetails;
  subtotal: number;
  discountAmount?: number;
  promoCodeApplied?: string;
  shippingCost: number;
  tax: number;
  total: number;
}
