import React, { useState } from 'react';
import type { OrderDetails } from '../types';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  Calendar,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

interface OrderConfirmationScreenProps {
  order: OrderDetails | null;
  onContinueShopping: () => void;
  onViewCatalog: () => void;
  onViewAccount?: () => void;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  order,
  onContinueShopping,
  onViewCatalog,
  onViewAccount,
}) => {
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!order) {
    return (
      <main className="w-full flex-1 py-28 px-6 text-center max-w-xl mx-auto flex flex-col items-center">
        <h2 className="font-serif text-3xl text-[#141413] mb-4">No active order logged</h2>
        <p className="text-xs text-[#73726B] mb-8 font-light">
          Your session does not contain an active order confirmation.
        </p>
        <button
          type="button"
          onClick={onContinueShopping}
          className="px-8 py-3.5 bg-[#141413] text-[#FAF9F6] text-xs uppercase tracking-[0.2em]"
        >
          Return to Collection
        </button>
      </main>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  const handleCopyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <main
      id="order-confirmation-screen"
      className="w-full flex-1 max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-20 animate-in fade-in duration-300 text-[#141413]"
    >
      {/* Top Banner Stamp */}
      <div className="border-b border-[#E5E3DC] pb-6 sm:pb-8 mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#141413] text-[#FAF9F6] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-[#73726B] block">
                Payment Authorized // Order Confirmed
              </span>
              <span className="font-mono text-xs text-[#141413]">
                Ref: {order.orderId}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Stripe Test Clearance: Succeeded</span>
            </span>
          </div>
        </div>

        <h1
          id="order-confirmation-headline"
          className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#141413] font-normal tracking-tight leading-tight"
        >
          Acquisition Confirmed
        </h1>
        <p className="font-sans text-xs sm:text-base text-[#5C5B54] font-light max-w-2xl mt-3 sm:mt-4 leading-relaxed">
          Thank you, <strong className="font-medium text-[#141413]">{order.shippingAddress.fullName}</strong>.
          Your payment has been cleared via Stripe’s test module. Your specimen reservation is now
          permanently logged in the atelier vault and entered into the white-glove packaging queue.
        </p>
      </div>

      {/* Prominent Unique Tracking Number Card */}
      <section
        id="order-tracking-hero-card"
        className="p-4 sm:p-8 bg-[#F0EEE6] border border-[#141413] mb-8 sm:mb-12 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D1CEC7] pb-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#73726B] block mb-1">
              Unique Order Tracking Number
            </span>
            <div className="flex items-center space-x-3">
              <span
                id="unique-order-tracking-number"
                className="font-mono text-lg sm:text-2xl font-bold tracking-wider text-[#141413]"
              >
                {order.trackingNumber}
              </span>
              <button
                id="copy-tracking-number-button"
                type="button"
                onClick={handleCopyTracking}
                className="w-11 h-11 min-w-[44px] min-h-[44px] border border-[#D1CEC7] bg-[#FAF9F6] text-[#141413] hover:bg-[#141413] hover:text-[#FAF9F6] transition-colors focus:outline-none flex items-center justify-center"
                title="Copy tracking number"
                aria-label="Copy tracking number"
              >
                {copiedTracking ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 stroke-[1.5]" />
                )}
              </button>
              {copiedTracking && (
                <span className="text-xs text-emerald-700 font-mono">Copied!</span>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#73726B] block">
              Estimated Delivery
            </span>
            <span className="font-sans text-sm font-semibold text-[#141413]">
              {order.estimatedDelivery}
            </span>
            <span className="text-[11px] text-[#73726B] block">
              Carrier: Certified Archival Freight
            </span>
          </div>
        </div>

        {/* Live Tracking Milestones */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs uppercase tracking-wider text-[#73726B] font-medium">
            <span>Fulfillment Protocol Status</span>
            <span className="text-[#141413] font-semibold">Stage 2 of 4: Packaging & Serialization</span>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="h-2 bg-[#141413] rounded-none" title="Payment Authorized (Completed)" />
            <div className="h-2 bg-[#141413] rounded-none animate-pulse" title="Vault Packaging (Active)" />
            <div className="h-2 bg-[#D1CEC7] rounded-none" title="Courier Custody (Pending)" />
            <div className="h-2 bg-[#D1CEC7] rounded-none" title="Final Delivery (Pending)" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-[#5C5B54]">
            <div>
              <span className="font-medium text-[#141413] block">1. Payment Cleared</span>
              <span>Stripe Authorized</span>
            </div>
            <div>
              <span className="font-medium text-[#141413] block">2. Vault Curation</span>
              <span>In Progress</span>
            </div>
            <div>
              <span className="font-medium text-[#141413] block">3. Courier Dispatch</span>
              <span>Scheduled</span>
            </div>
            <div>
              <span className="font-medium text-[#141413] block">4. Final Delivery</span>
              <span>Signature Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Ledger & Verification Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Items & Shipping Destination */}
        <div className="lg:col-span-2 space-y-10">
          {/* Itemized Order Table */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#E5E3DC] pb-3">
              <Package className="w-4 h-4 text-[#141413]" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141413]">
                Acquired Specimens ({order.items.reduce((a, b) => a + b.quantity, 0)} Units)
              </h3>
            </div>

            <div className="space-y-4">
              {order.items.map(({ product, quantity, selectedSize }) => (
                <div
                  key={`${product.id}-${selectedSize || 'std'}`}
                  id={`confirmation-item-${product.id}`}
                  className="flex items-center justify-between p-4 border border-[#E5E3DC] bg-[#FAF9F6]"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 object-cover border border-[#E5E3DC]"
                    />
                    <div>
                      <h4 className="font-serif text-lg text-[#141413] font-normal">
                        {product.title}
                      </h4>
                      <div className="flex items-center flex-wrap gap-2 mt-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-[#73726B] block">
                          {product.category} Series • Serialized Unit
                        </span>
                        {selectedSize && (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-medium bg-[#EAE8E0] text-[#141413] border border-[#D1CEC7]">
                            Size: {selectedSize}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#5C5B54] font-mono mt-1 block">
                        Quantity: {quantity} × {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-sans text-base font-semibold text-[#141413] block">
                      {formatCurrency(product.price * quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping and Delivery Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Delivery Destination */}
            <div className="p-6 border border-[#E5E3DC] bg-[#FAF9F6] space-y-3">
              <div className="flex items-center space-x-2 border-b border-[#E5E3DC] pb-2 text-[#141413]">
                <Truck className="w-4 h-4" />
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold">
                  Delivery Destination
                </h4>
              </div>
              <div className="text-xs text-[#44433E] space-y-1 font-light leading-relaxed">
                <p className="font-medium text-[#141413]">{order.shippingAddress.fullName}</p>
                <p>
                  {order.shippingAddress.streetAddress}
                  {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
                </p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.stateProvince}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2 text-[#73726B]">
                  <span className="font-medium text-[#141413]">Notification:</span>{' '}
                  {order.shippingAddress.email}
                </p>
              </div>
            </div>

            {/* Payment & Security Verification */}
            <div className="p-6 border border-[#E5E3DC] bg-[#FAF9F6] space-y-3">
              <div className="flex items-center space-x-2 border-b border-[#E5E3DC] pb-2 text-[#141413]">
                <CreditCard className="w-4 h-4" />
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold">
                  Payment Verification
                </h4>
              </div>
              <div className="text-xs text-[#44433E] space-y-1.5 font-light leading-relaxed">
                <p className="font-medium text-[#141413] flex items-center justify-between">
                  <span>Method:</span>
                  <span className="font-mono text-[11px] uppercase">
                    {order.paymentDetails?.brand || 'CARD'} •••• {order.paymentDetails?.last4 || '4242'}
                  </span>
                </p>
                <p className="flex items-center justify-between text-[#73726B]">
                  <span>Authorization:</span>
                  <span className="font-mono text-[10px]">
                    {order.paymentDetails?.networkAuthCode || 'AUTH_928104'}
                  </span>
                </p>
                <p className="flex items-center justify-between text-[#73726B]">
                  <span>Charge ID:</span>
                  <span className="font-mono text-[10px] truncate max-w-[140px]">
                    {order.paymentDetails?.chargeId || 'ch_test_928104'}
                  </span>
                </p>
                <p className="flex items-center justify-between text-[#73726B]">
                  <span>Status:</span>
                  <span className="text-emerald-700 font-medium uppercase text-[10px]">
                    Captured (Test Mode)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Breakdown & Next Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 border border-[#141413] bg-[#F0EEE6] space-y-6 sticky top-24">
            <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#141413] border-b border-[#D1CEC7] pb-3">
              Formal Financial Ledger
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#5C5B54]">
                <span>Items Subtotal</span>
                <span className="font-medium text-[#141413]">{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>
                    Promo Discount {order.promoCodeApplied ? `(${order.promoCodeApplied})` : ''}
                  </span>
                  <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-[#5C5B54]">
                <span>Archival Handling</span>
                <span className="font-medium text-[#141413]">
                  {order.shippingCost === 0 ? 'Complimentary' : formatCurrency(order.shippingCost)}
                </span>
              </div>

              <div className="flex justify-between text-[#5C5B54]">
                <span>State & Municipal Tax</span>
                <span className="font-medium text-[#141413]">{formatCurrency(order.tax)}</span>
              </div>

              <div className="border-t border-[#D1CEC7] pt-3 flex justify-between text-sm font-semibold text-[#141413]">
                <span className="uppercase tracking-wider">Total Paid</span>
                <span className="font-sans text-xl">{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F6] border border-[#D1CEC7] text-[10px] text-[#73726B] leading-relaxed space-y-1">
              <div className="flex items-center space-x-1.5 text-[#141413] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-700" />
                <span>Zero Live Balance Deduction</span>
              </div>
              <p>
                This transaction was processed in Stripe’s native test module architecture.
                No real funds or credit lines were debited.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                id="print-invoice-button"
                type="button"
                onClick={() => window.print()}
                className="w-full min-h-[44px] inline-flex items-center justify-center space-x-2 py-3 px-4 border border-[#141413] text-xs uppercase tracking-[0.2em] font-medium text-[#141413] bg-transparent hover:bg-[#FAF9F6] transition-colors focus:outline-none"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Invoice</span>
              </button>

              {onViewAccount && (
                <button
                  id="confirmation-view-account-btn"
                  type="button"
                  onClick={onViewAccount}
                  className="w-full min-h-[44px] inline-flex items-center justify-center space-x-2 py-3 px-4 border border-[#141413] text-xs uppercase tracking-[0.2em] font-medium text-[#141413] bg-[#F0EEE6] hover:bg-white transition-colors focus:outline-none"
                >
                  <span>View Order in Account Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                id="confirmation-continue-shopping-btn"
                type="button"
                onClick={onContinueShopping}
                className="w-full min-h-[48px] inline-flex items-center justify-center space-x-2 py-3.5 px-6 bg-[#141413] text-[#FAF9F6] text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#2A2926] transition-colors focus:outline-none"
              >
                <span>Return to Overview</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="confirmation-view-catalog-btn"
                type="button"
                onClick={onViewCatalog}
                className="w-full min-h-[44px] inline-flex items-center justify-center text-center text-xs uppercase tracking-[0.18em] text-[#73726B] hover:text-[#141413] transition-colors pt-1"
              >
                Explore More Works in Catalog →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
