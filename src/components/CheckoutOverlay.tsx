import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDiscounts } from '../context/DiscountsContext';
import type { ShippingAddress, OrderDetails } from '../types';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Truck,
  Package,
  Loader2,
  Lock,
  ShieldCheck,
  CreditCard,
  Tag,
} from 'lucide-react';
import { StripePaymentElement } from './StripePaymentElement';
import {
  validateCardNumber,
  validateExpiry,
  validateCvc,
  processStripePayment,
  generateTrackingNumber,
  type StripeCardInput,
} from '../services/stripeService';

interface CheckoutOverlayProps {
  onOrderPlaced: (order: OrderDetails) => void;
}

export const CheckoutOverlay: React.FC<CheckoutOverlayProps> = ({ onOrderPlaced }) => {
  const { cart, subtotal, isCheckoutOpen, closeCheckout, clearCart } = useCart();
  const { currentUser, recordOrder, updateCurrentUserAddress } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form State for Step 1
  const [shippingData, setShippingData] = useState<ShippingAddress>(() => {
    if (currentUser?.defaultAddress) {
      return {
        fullName: currentUser.defaultAddress.fullName || currentUser.fullName,
        email: currentUser.defaultAddress.email || currentUser.email,
        phone: currentUser.defaultAddress.phone || currentUser.phone || '',
        streetAddress: currentUser.defaultAddress.streetAddress || '',
        apartment: currentUser.defaultAddress.apartment || '',
        city: currentUser.defaultAddress.city || '',
        stateProvince: currentUser.defaultAddress.stateProvince || '',
        postalCode: currentUser.defaultAddress.postalCode || '',
        country: currentUser.defaultAddress.country || 'United States',
        deliveryMethod: currentUser.defaultAddress.deliveryMethod || 'standard',
      };
    }
    return {
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      streetAddress: '',
      apartment: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: 'United States',
      deliveryMethod: 'standard',
    };
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Stripe Native Test Module State for Step 2
  const [cardInput, setCardInput] = useState<StripeCardInput>({
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvc: '242',
    postalCode: '',
    nameOnCard: '',
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Discount & Promo Code System Integration
  const { appliedPromo, applyPromoCode, removeAppliedPromo, calculateDiscount } = useDiscounts();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput, subtotal);
    if (res.success) {
      setPromoMessage({ type: 'success', text: res.message });
      setPromoInput('');
    } else {
      setPromoMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setPromoMessage(null), 4000);
  };

  // Synchronize billing name & zip from shipping if empty
  useEffect(() => {
    if (shippingData.fullName && !cardInput.nameOnCard) {
      setCardInput((prev) => ({
        ...prev,
        nameOnCard: shippingData.fullName,
      }));
    }
    if (shippingData.postalCode && !cardInput.postalCode) {
      setCardInput((prev) => ({
        ...prev,
        postalCode: shippingData.postalCode,
      }));
    }
  }, [shippingData.fullName, shippingData.postalCode, cardInput.nameOnCard, cardInput.postalCode]);

  if (!isCheckoutOpen) return null;

  const shippingCost = shippingData.deliveryMethod === 'express' ? 25 : 0;
  const discountSavings = calculateDiscount(subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discountSavings);
  const estimatedTax = Math.round(discountedSubtotal * 0.075);
  const total = discountedSubtotal + shippingCost + estimatedTax;

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!shippingData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!shippingData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingData.email)) {
      errors.email = 'Please provide a valid email';
    }
    if (!shippingData.streetAddress.trim()) errors.streetAddress = 'Street address is required';
    if (!shippingData.city.trim()) errors.city = 'City is required';
    if (!shippingData.stateProvince.trim()) errors.stateProvince = 'State or Province is required';
    if (!shippingData.postalCode.trim()) errors.postalCode = 'Postal / ZIP code is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCardFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (!cardInput.nameOnCard.trim()) {
      errors.nameOnCard = 'Name on card is required';
    }

    const numCheck = validateCardNumber(cardInput.number);
    if (!numCheck.isValid) {
      errors.number = numCheck.error || 'Invalid card number';
    }

    const expCheck = validateExpiry(cardInput.expiry);
    if (!expCheck.isValid) {
      errors.expiry = expCheck.error || 'Invalid expiration date';
    }

    const cvcCheck = validateCvc(cardInput.cvc, numCheck.brand);
    if (!cvcCheck.isValid) {
      errors.cvc = cvcCheck.error || 'Invalid security code';
    }

    if (!cardInput.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCardInput((prev) => ({
        ...prev,
        nameOnCard: prev.nameOnCard || shippingData.fullName,
        postalCode: prev.postalCode || shippingData.postalCode,
      }));
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProcessPayment = async () => {
    if (!validateCardFields()) {
      return;
    }

    setIsProcessing(true);
    setCardErrors({});

    try {
      const paymentResult = await processStripePayment(cardInput, total);

      if (!paymentResult.success) {
        setIsProcessing(false);
        setCardErrors({
          general:
            paymentResult.error ||
            'Stripe payment authorization failed. Please verify test credentials.',
        });
        return;
      }

      // Successful authorization
      const trackingNumber = generateTrackingNumber(shippingData.deliveryMethod);
      const deliveryDays = shippingData.deliveryMethod === 'express' ? 2 : 4;
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);

      // Link incoming order transactions directly to a unique user identifier variable
      const userId = currentUser ? currentUser.id : `usr_guest_${Date.now().toString(36)}`;

      const newOrder: OrderDetails = {
        orderId: `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        userId,
        trackingNumber,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        estimatedDelivery: estimatedDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        status: 'In Vault Packaging',
        items: [...cart],
        shippingAddress: { ...shippingData },
        paymentDetails: paymentResult.paymentDetails!,
        subtotal,
        discountAmount: discountSavings,
        promoCodeApplied: appliedPromo?.code,
        shippingCost,
        tax: estimatedTax,
        total,
      };

      // Record to internal data schema & update address
      recordOrder(newOrder);
      if (currentUser && !currentUser.defaultAddress) {
        updateCurrentUserAddress(shippingData);
      }

      // Clear client's shopping cart & promo code state upon success
      clearCart();
      removeAppliedPromo();
      setIsProcessing(false);
      closeCheckout();

      // Route application layout to the polished Order Confirmation screen
      onOrderPlaced(newOrder);
    } catch (err) {
      setIsProcessing(false);
      setCardErrors({
        general: 'An unexpected connection error occurred with Stripe test gateway.',
      });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div
      id="checkout-screen-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-main-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF9F6] flex flex-col justify-between text-[#141413] animate-in fade-in duration-200"
    >
      {/* Top Checkout Header */}
      <header
        id="checkout-header"
        className="sticky top-0 z-20 w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E5E3DC] px-4 sm:px-12 py-3.5 sm:py-5 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            id="checkout-back-button"
            type="button"
            disabled={isProcessing}
            onClick={() => {
              if (currentStep === 2) {
                setCurrentStep(1);
              } else {
                closeCheckout();
              }
            }}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#F0EEE6] rounded-full text-[#141413] transition-colors focus:outline-none disabled:opacity-40"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </button>
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-semibold text-[#73726B] block">
              Direct Checkout Protocol
            </span>
            <span
              id="checkout-main-title"
              className="font-serif text-lg sm:text-2xl text-[#141413]"
            >
              É D I T I O N // Secure Checkout
            </span>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div
          id="checkout-stepper-indicator"
          className="flex items-center space-x-2 sm:space-x-8 text-[11px] sm:text-xs uppercase tracking-[0.18em]"
        >
          <div
            id="step-indicator-1"
            className={`flex items-center space-x-2 ${
              currentStep === 1 ? 'text-[#141413] font-semibold' : 'text-[#73726B]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono border ${
                currentStep === 1
                  ? 'bg-[#141413] text-[#FAF9F6] border-[#141413]'
                  : 'bg-[#FAF9F6] text-[#73726B] border-[#D1CEC7]'
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline">Shipping Address</span>
          </div>

          <span className="text-[#D1CEC7] hidden sm:inline">/</span>

          <div
            id="step-indicator-2"
            className={`flex items-center space-x-2 ${
              currentStep === 2 ? 'text-[#141413] font-semibold' : 'text-[#73726B]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono border ${
                currentStep === 2
                  ? 'bg-[#141413] text-[#FAF9F6] border-[#141413]'
                  : 'bg-[#FAF9F6] text-[#73726B] border-[#D1CEC7]'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">Payment & Summary</span>
          </div>
        </div>

        <button
          id="checkout-close-button"
          type="button"
          disabled={isProcessing}
          onClick={closeCheckout}
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#F0EEE6] rounded-full text-[#141413] transition-colors focus:outline-none disabled:opacity-40"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>
      </header>

      {/* Main Checkout View Area */}
      <main
        id="checkout-content-container"
        className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-16"
      >
        {currentStep === 1 ? (
          /* STEP 1: Shipping Address Fields */
          <div id="checkout-step-1-container" className="animate-in fade-in duration-200">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-[0.25em] font-medium text-[#73726B]">
                Step 1 of 2
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#141413] mt-1 font-normal tracking-tight">
                Shipping Destination & Logistics
              </h2>
              <p className="text-xs text-[#5C5B54] font-light mt-2 max-w-xl">
                Please enter your physical delivery destination. All parcels are dispatched with sealed
                tamper-evident packaging and tracked via certified transit.
              </p>
            </div>

            <form onSubmit={handleProceedToReview} className="space-y-8" noValidate>
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141413] border-b border-[#E5E3DC] pb-2">
                  Contact & Consignee
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="shipping-full-name"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      Full Name *
                    </label>
                    <input
                      id="shipping-full-name"
                      type="text"
                      value={shippingData.fullName}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, fullName: e.target.value })
                      }
                      placeholder="e.g. Julian Vance"
                      className={`w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border text-sm text-[#141413] focus:outline-none transition-colors ${
                        formErrors.fullName
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#D1CEC7] focus:border-[#141413]'
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="shipping-email"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      Email Address *
                    </label>
                    <input
                      id="shipping-email"
                      type="email"
                      value={shippingData.email}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, email: e.target.value })
                      }
                      placeholder="julian.vance@studio.com"
                      className={`w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border text-sm text-[#141413] focus:outline-none transition-colors ${
                        formErrors.email
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#D1CEC7] focus:border-[#141413]'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="shipping-phone"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      Phone Number (Courier Dispatch)
                    </label>
                    <input
                      id="shipping-phone"
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, phone: e.target.value })
                      }
                      placeholder="+1 (555) 019-2834"
                      className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="shipping-country"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      Destination Country
                    </label>
                    <select
                      id="shipping-country"
                      value={shippingData.country}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, country: e.target.value })
                      }
                      className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Japan">Japan</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Switzerland">Switzerland</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Physical Street Address */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141413] border-b border-[#E5E3DC] pb-2">
                  Physical Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="shipping-street-address"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      Street Address *
                    </label>
                    <input
                      id="shipping-street-address"
                      type="text"
                      value={shippingData.streetAddress}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, streetAddress: e.target.value })
                      }
                      placeholder="742 Evergreen Promenade"
                      className={`w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border text-sm text-[#141413] focus:outline-none transition-colors ${
                        formErrors.streetAddress
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#D1CEC7] focus:border-[#141413]'
                      }`}
                    />
                    {formErrors.streetAddress && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.streetAddress}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="shipping-apartment"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      id="shipping-apartment"
                      type="text"
                      value={shippingData.apartment}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, apartment: e.target.value })
                      }
                      placeholder="Penthouse 4B"
                      className="w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border border-[#D1CEC7] text-sm text-[#141413] focus:border-[#141413] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="shipping-city"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      City *
                    </label>
                    <input
                      id="shipping-city"
                      type="text"
                      value={shippingData.city}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, city: e.target.value })
                      }
                      placeholder="San Francisco"
                      className={`w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border text-sm text-[#141413] focus:outline-none transition-colors ${
                        formErrors.city
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#D1CEC7] focus:border-[#141413]'
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="shipping-state"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      State / Province / Region *
                    </label>
                    <input
                      id="shipping-state"
                      type="text"
                      value={shippingData.stateProvince}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, stateProvince: e.target.value })
                      }
                      placeholder="California"
                      className={`w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border text-sm text-[#141413] focus:outline-none transition-colors ${
                        formErrors.stateProvince
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#D1CEC7] focus:border-[#141413]'
                      }`}
                    />
                    {formErrors.stateProvince && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.stateProvince}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="shipping-postal"
                      className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
                    >
                      Postal / ZIP Code *
                    </label>
                    <input
                      id="shipping-postal"
                      type="text"
                      value={shippingData.postalCode}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, postalCode: e.target.value })
                      }
                      placeholder="94103"
                      className={`w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border text-sm text-[#141413] focus:outline-none transition-colors ${
                        formErrors.postalCode
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#D1CEC7] focus:border-[#141413]'
                      }`}
                    />
                    {formErrors.postalCode && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Speed Selection */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141413] border-b border-[#E5E3DC] pb-2">
                  Delivery Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    id="delivery-option-standard"
                    className={`p-4 border flex items-start space-x-3 cursor-pointer transition-all ${
                      shippingData.deliveryMethod === 'standard'
                        ? 'border-[#141413] bg-[#F0EEE6]'
                        : 'border-[#D1CEC7] hover:border-[#141413]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="standard"
                      checked={shippingData.deliveryMethod === 'standard'}
                      onChange={() =>
                        setShippingData({ ...shippingData, deliveryMethod: 'standard' })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#141413]">
                        <span>Standard Archival Delivery</span>
                        <span>Free</span>
                      </div>
                      <p className="text-xs text-[#5C5B54] font-light mt-1">
                        Dispatched via carbon-offset surface freight. Arrives in 3–5 business days.
                      </p>
                    </div>
                  </label>

                  <label
                    id="delivery-option-express"
                    className={`p-4 border flex items-start space-x-3 cursor-pointer transition-all ${
                      shippingData.deliveryMethod === 'express'
                        ? 'border-[#141413] bg-[#F0EEE6]'
                        : 'border-[#D1CEC7] hover:border-[#141413]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="express"
                      checked={shippingData.deliveryMethod === 'express'}
                      onChange={() =>
                        setShippingData({ ...shippingData, deliveryMethod: 'express' })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#141413]">
                        <span>Priority Express Courier</span>
                        <span>$25</span>
                      </div>
                      <p className="text-xs text-[#5C5B54] font-light mt-1">
                        Dedicated white-glove direct handling with next-flight priority. 1–2 business days.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Promo Code Entry in Step 1 */}
              <div id="checkout-step1-promo-section" className="pt-2">
                <div className="p-4 bg-[#FAF9F6] border border-[#E5E3DC] space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="checkout-promo-input-step1"
                      className="text-[10px] font-mono uppercase tracking-[0.22em] font-medium text-[#73726B]"
                    >
                      Promo Code
                    </label>
                    {appliedPromo && (
                      <span className="text-[10px] font-mono text-emerald-800 font-semibold">
                        Discount Active
                      </span>
                    )}
                  </div>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2.5 bg-white border border-[#D1CEC7]">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-mono text-xs font-semibold text-[#141413]">
                          {appliedPromo.code}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {appliedPromo.discountType === 'percentage'
                            ? `${appliedPromo.value}% OFF`
                            : `$${appliedPromo.value} OFF`}
                        </span>
                        <span className="text-xs font-mono text-[#5C5B54]">
                          (-{formatCurrency(discountSavings)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeAppliedPromo}
                        className="min-h-[44px] inline-flex items-center px-2 text-xs font-mono text-[#73726B] hover:text-[#141413] underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        id="checkout-promo-input-step1"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Try WELCOME10 or ATELIER50"
                        className="flex-1 min-h-[44px] px-3 py-2 text-xs font-mono uppercase bg-white border border-[#D1CEC7] text-[#141413] placeholder:normal-case placeholder:text-[#8C8A82] focus:outline-none focus:border-[#141413]"
                      />
                      <button
                        id="checkout-apply-promo-btn-step1"
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!promoInput.trim()}
                        className="min-h-[44px] px-4 py-2 bg-[#141413] text-[#FAF9F6] text-xs font-mono uppercase tracking-wider font-medium hover:bg-[#2A2926] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {promoMessage && (
                    <p
                      className={`text-[10px] font-mono mt-1 ${
                        promoMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#E5E3DC] flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  id="shipping-cancel-button"
                  type="button"
                  onClick={closeCheckout}
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center px-8 py-3 border border-[#D1CEC7] text-xs uppercase tracking-[0.2em] font-medium text-[#73726B] hover:text-[#141413] hover:border-[#141413] transition-colors"
                >
                  Return to Store
                </button>

                <button
                  id="shipping-proceed-step-2"
                  type="submit"
                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center space-x-3 px-10 py-3 bg-[#141413] text-[#FAF9F6] border border-[#141413] text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#2A2926] active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                >
                  <span>Continue to Payment & Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Secure Payment Processing & Order Summary Validation */
          <div id="checkout-step-2-container" className="animate-in fade-in duration-200">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-[0.25em] font-medium text-[#73726B]">
                Step 2 of 2
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#141413] mt-1 font-normal tracking-tight">
                Payment Processing & Validation
              </h2>
              <p className="text-xs text-[#5C5B54] font-light mt-2 max-w-xl">
                Securely authorize this acquisition using Stripe’s native test module architecture.
                Live payment tokens and funds are safely bypassed in test mode.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column: Stripe Test Module, Destination & Items */}
              <div className="lg:col-span-2 space-y-8">
                {/* 1. Stripe Native Test Module Component */}
                <StripePaymentElement
                  cardInput={cardInput}
                  onChange={setCardInput}
                  cardErrors={cardErrors}
                  isProcessing={isProcessing}
                />

                {/* 2. Shipping Destination Card */}
                <div
                  id="review-shipping-card"
                  className="p-6 border border-[#E5E3DC] bg-[#FAF9F6] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E3DC] pb-3">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-[#141413]" />
                      <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141413]">
                        Verified Delivery Destination
                      </h3>
                    </div>
                    <button
                      id="edit-shipping-address-btn"
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setCurrentStep(1)}
                      className="min-h-[44px] inline-flex items-center text-xs uppercase tracking-[0.16em] text-[#73726B] hover:text-[#141413] underline underline-offset-4 disabled:opacity-40"
                    >
                      Edit Address
                    </button>
                  </div>

                  <div className="text-xs text-[#44433E] space-y-1 font-light leading-relaxed">
                    <p className="font-medium text-[#141413]">{shippingData.fullName}</p>
                    <p>
                      {shippingData.streetAddress}
                      {shippingData.apartment ? `, ${shippingData.apartment}` : ''}
                    </p>
                    <p>
                      {shippingData.city}, {shippingData.stateProvince} {shippingData.postalCode}
                    </p>
                    <p>{shippingData.country}</p>
                    <p className="pt-2 text-[#73726B]">
                      <span className="font-medium text-[#141413]">Courier Updates:</span>{' '}
                      {shippingData.email}
                      {shippingData.phone && ` • ${shippingData.phone}`}
                    </p>
                    <p className="pt-1 text-[#73726B]">
                      <span className="font-medium text-[#141413]">Transit Speed:</span>{' '}
                      {shippingData.deliveryMethod === 'standard'
                        ? 'Standard Archival Delivery (Free)'
                        : 'Priority Express Courier ($25)'}
                    </p>
                  </div>
                </div>

                {/* 3. Itemized Selection Table */}
                <div id="review-items-list" className="space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141413] border-b border-[#E5E3DC] pb-2 flex items-center space-x-2">
                    <Package className="w-4 h-4 text-[#141413]" />
                    <span>Archived Items ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                  </h3>

                  <div className="space-y-4">
                    {cart.map(({ product, quantity, selectedSize }) => (
                      <div
                        key={`${product.id}-${selectedSize || 'std'}`}
                        id={`review-item-${product.id}`}
                        className="flex items-center justify-between p-4 border border-[#E5E3DC] bg-[#FAF9F6]"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            className="w-16 h-18 object-cover border border-[#E5E3DC]"
                          />
                          <div>
                            <h4 className="font-serif text-base text-[#141413] font-normal">
                              {product.title}
                            </h4>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                              <span className="text-[10px] uppercase tracking-wider text-[#73726B] block">
                                {product.category} Series • Qty: {quantity}
                              </span>
                              {selectedSize && (
                                <span className="px-2 py-0.5 text-[9px] font-mono font-medium bg-[#EAE8E0] text-[#141413] border border-[#D1CEC7]">
                                  Size: {selectedSize}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-sans text-sm font-semibold text-[#141413] block">
                            {formatCurrency(product.price * quantity)}
                          </span>
                          <span className="text-[10px] text-[#73726B]">
                            {formatCurrency(product.price)} ea
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Financial Ledger & Payment Action Button */}
              <div className="lg:col-span-1">
                <div
                  id="review-financial-breakdown"
                  className="p-6 border border-[#141413] bg-[#F0EEE6] space-y-6 sticky top-24"
                >
                  <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#141413] border-b border-[#D1CEC7] pb-3">
                    Ledger Validation
                  </h3>

                  {/* Promo Code Input on Checkout Step 2 */}
                  <div id="checkout-step2-promo-box" className="p-3.5 bg-white border border-[#D1CEC7] space-y-2">
                    <label
                      htmlFor="checkout-promo-input-step2"
                      className="block text-[10px] font-mono uppercase tracking-[0.22em] font-medium text-[#73726B]"
                    >
                      Promo Code
                    </label>

                    {appliedPromo ? (
                      <div className="flex items-center justify-between p-2 bg-[#FAF9F6] border border-[#E5E3DC]">
                        <div className="flex items-center space-x-1.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="font-mono text-xs font-semibold text-[#141413]">
                            {appliedPromo.code}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {appliedPromo.discountType === 'percentage'
                              ? `${appliedPromo.value}% OFF`
                              : `$${appliedPromo.value} OFF`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeAppliedPromo}
                          className="min-h-[44px] inline-flex items-center px-2 text-[11px] font-mono text-[#73726B] hover:text-[#141413] underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <input
                          id="checkout-promo-input-step2"
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Try WELCOME10"
                          className="w-full min-h-[44px] px-3 py-2 text-xs font-mono uppercase bg-[#FAF9F6] border border-[#D1CEC7] text-[#141413] placeholder:normal-case placeholder:text-[#8C8A82] focus:outline-none focus:border-[#141413]"
                        />
                        <button
                          id="checkout-apply-promo-btn-step2"
                          type="submit"
                          disabled={!promoInput.trim()}
                          className="min-h-[44px] px-4 py-2 bg-[#141413] text-[#FAF9F6] text-xs font-mono uppercase tracking-wider font-medium hover:bg-[#2A2926] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
                        >
                          Apply
                        </button>
                      </form>
                    )}

                    {promoMessage && (
                      <p
                        className={`text-[10px] font-mono mt-1 ${
                          promoMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {promoMessage.text}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-[#5C5B54]">
                      <span>Items Subtotal</span>
                      <span className="font-medium text-[#141413]">{formatCurrency(subtotal)}</span>
                    </div>

                    {appliedPromo && discountSavings > 0 && (
                      <div className="flex justify-between text-emerald-800 font-medium">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Promo Discount ({appliedPromo.code})
                        </span>
                        <span id="checkout-step2-savings" className="font-mono">
                          -{formatCurrency(discountSavings)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#5C5B54]">
                      <span>Archival Packaging & Transit</span>
                      <span className="font-medium text-[#141413]">
                        {shippingCost === 0 ? 'Complimentary' : formatCurrency(shippingCost)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#5C5B54]">
                      <span>Estimated State & Local Tax</span>
                      <span className="font-medium text-[#141413]">
                        {formatCurrency(estimatedTax)}
                      </span>
                    </div>

                    <div className="border-t border-[#D1CEC7] pt-3 flex justify-between text-sm font-semibold text-[#141413]">
                      <span className="uppercase tracking-wider">Final Order Total</span>
                      <span id="review-total-price" className="font-sans text-xl">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  {/* Required Action Button: Shows 'Processing…' when submitting */}
                  <button
                    id="stripe-authorize-payment-button"
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcessPayment}
                    className="w-full min-h-[50px] inline-flex items-center justify-center space-x-3 py-3.5 px-6 bg-[#141413] text-[#FAF9F6] border border-[#141413] text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#2A2926] active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FAF9F6]" />
                        <span id="processing-loading-state">Processing…</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-[#FAF9F6]" />
                        <span>Place Order • {formatCurrency(total)}</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-[#FAF9F6] border border-[#D1CEC7] text-[10px] text-[#73726B] leading-relaxed space-y-1">
                    <div className="flex items-center space-x-1.5 text-[#141413] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-700" />
                      <span>Stripe Test Module Active</span>
                    </div>
                    <p>
                      Submitting uses Stripe’s client test architecture. Successful clearance clears
                      the shopping cart and navigates to the dedicated Order Confirmation screen.
                    </p>
                  </div>

                  <button
                    id="step-2-back-button"
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setCurrentStep(1)}
                    className="w-full text-center text-xs uppercase tracking-[0.18em] text-[#73726B] hover:text-[#141413] transition-colors disabled:opacity-40"
                  >
                    ← Edit Shipping Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
