import type { PaymentDetails } from '../types';

export interface StripeCardInput {
  number: string;
  expiry: string;
  cvc: string;
  postalCode: string;
  nameOnCard: string;
}

export interface CardValidationResult {
  isValid: boolean;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';
  formattedNumber: string;
  error?: string;
}

export interface ExpiryValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CvcValidationResult {
  isValid: boolean;
  error?: string;
}

export interface StripeTestPreset {
  title: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  description: string;
  badge: string;
  outcome: 'success' | 'decline' | 'insufficient_funds';
}

export const STRIPE_TEST_CARDS: StripeTestPreset[] = [
  {
    title: 'Standard Success (Visa)',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/28',
    cvc: '242',
    description: 'Instant authorization with zero friction',
    badge: 'Success',
    outcome: 'success',
  },
  {
    title: 'High-Volume Success (Mastercard)',
    cardNumber: '5555 5555 5555 4444',
    expiry: '08/29',
    cvc: '555',
    description: 'Direct Mastercard test clearance',
    badge: 'Success',
    outcome: 'success',
  },
  {
    title: 'Card Declined Test',
    cardNumber: '4000 0560 0000 0002',
    expiry: '11/27',
    cvc: '123',
    description: 'Simulates generic test card decline',
    badge: 'Decline Simulation',
    outcome: 'decline',
  },
  {
    title: 'Insufficient Funds Test',
    cardNumber: '4000 0000 0000 0127',
    expiry: '09/27',
    cvc: '789',
    description: 'Simulates insufficient account balance',
    badge: 'Funds Simulation',
    outcome: 'insufficient_funds',
  },
];

// Luhn Algorithm implementation for card numbers
export function luhnCheck(numString: string): boolean {
  const cleanDigits = numString.replace(/\D/g, '');
  if (cleanDigits.length < 13 || cleanDigits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanDigits.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanDigits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Detect Card Brand
export function detectCardBrand(
  cardNumber: string
): 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown' {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^(6011|65|64[4-9]|622)/.test(clean)) return 'discover';
  return 'unknown';
}

// Format card number with spaces as user types
export function formatCardNumber(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 19);
  const brand = detectCardBrand(clean);

  if (brand === 'amex') {
    // 4-6-5 format
    const p1 = clean.slice(0, 4);
    const p2 = clean.slice(4, 10);
    const p3 = clean.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }

  // 4-4-4-4 format
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join(' ');
}

// Format Expiry date as MM / YY
export function formatExpiry(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 2) {
    return `${clean.slice(0, 2)} / ${clean.slice(2)}`;
  }
  return clean;
}

// Validate Card Number
export function validateCardNumber(rawNumber: string): CardValidationResult {
  const clean = rawNumber.replace(/\D/g, '');
  const brand = detectCardBrand(clean);
  const formattedNumber = formatCardNumber(clean);

  if (!clean) {
    return { isValid: false, brand, formattedNumber, error: 'Card number is required' };
  }

  const expectedLength = brand === 'amex' ? 15 : 16;
  if (clean.length < expectedLength) {
    return {
      isValid: false,
      brand,
      formattedNumber,
      error: `Your card number is incomplete (${clean.length}/${expectedLength} digits)`,
    };
  }

  if (!luhnCheck(clean)) {
    return {
      isValid: false,
      brand,
      formattedNumber,
      error: 'Your card number is invalid (Luhn checksum failed)',
    };
  }

  return { isValid: true, brand, formattedNumber };
}

// Validate Expiration
export function validateExpiry(rawExpiry: string): ExpiryValidationResult {
  const clean = rawExpiry.replace(/\D/g, '');
  if (clean.length < 4) {
    return { isValid: false, error: "Please enter an expiration date (MM/YY)" };
  }

  const month = parseInt(clean.slice(0, 2), 10);
  const yearShort = parseInt(clean.slice(2, 4), 10);
  const fullYear = 2000 + yearShort;

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Expiration month must be between 01 and 12" };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
    return { isValid: false, error: "Your card's expiration date is in the past" };
  }

  if (fullYear > currentYear + 25) {
    return { isValid: false, error: "Your card's expiration year is invalid" };
  }

  return { isValid: true };
}

// Validate CVC
export function validateCvc(
  rawCvc: string,
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'
): CvcValidationResult {
  const clean = rawCvc.replace(/\D/g, '');
  const requiredLength = brand === 'amex' ? 4 : 3;

  if (!clean) {
    return { isValid: false, error: 'Security code is required' };
  }

  if (clean.length !== requiredLength) {
    return {
      isValid: false,
      error: `Security code must be ${requiredLength} digits for this card brand`,
    };
  }

  return { isValid: true };
}

// Generate Tracking Number
export function generateTrackingNumber(deliveryMethod: 'standard' | 'express'): string {
  const prefix = deliveryMethod === 'express' ? 'TRK-US-EXP' : 'TRK-US-STD';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}${random}`;
}

// Simulate Stripe Payment Intent Processing
export async function processStripePayment(
  cardInput: StripeCardInput,
  amount: number
): Promise<{
  success: boolean;
  error?: string;
  paymentDetails?: PaymentDetails;
}> {
  // Simulate realistic network latency with Stripe test API (900ms - 1300ms)
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const cleanNumber = cardInput.number.replace(/\D/g, '');
  const brand = detectCardBrand(cleanNumber);
  const last4 = cleanNumber.slice(-4) || '4242';

  // Specific Stripe test decline triggers
  if (cleanNumber === '4000056000000002') {
    return {
      success: false,
      error: 'Your card was declined. Your request was in test mode, but used a card that will decline.',
    };
  }

  if (cleanNumber === '4000000000000127') {
    return {
      success: false,
      error: 'Your card has insufficient funds. Please use an alternative test card.',
    };
  }

  // Generate simulated Stripe payment intent result
  const chargeId = `ch_test_${Math.random().toString(36).substring(2, 11)}${Date.now().toString(36)}`;
  const networkAuthCode = `AUTH_${Math.floor(100000 + Math.random() * 900000)}`;

  const paymentDetails: PaymentDetails = {
    brand: brand.toUpperCase(),
    last4,
    chargeId,
    status: 'succeeded',
    networkAuthCode,
    testMode: true,
  };

  return {
    success: true,
    paymentDetails,
  };
}
