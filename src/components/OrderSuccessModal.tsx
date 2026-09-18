import React from 'react';
import type { OrderDetails } from '../types';
import { CheckCircle, ArrowRight, Printer, MapPin, Package, Calendar } from 'lucide-react';

interface OrderSuccessModalProps {
  order: OrderDetails | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div
      id="order-success-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#141413]/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="order-success-modal-container"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border border-[#E5E3DC] shadow-2xl p-6 sm:p-10 text-[#141413] animate-in zoom-in-95 duration-200"
      >
        {/* Top Stamp & Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#141413] text-[#FAF9F6] flex items-center justify-center mb-4">
            <CheckCircle className="w-7 h-7 stroke-[1.75]" />
          </div>

          <span
            id="success-order-ref"
            className="font-mono text-xs uppercase tracking-[0.25em] text-[#73726B] mb-2"
          >
            Confirmation Reference: {order.orderId}
          </span>

          <h2
            id="success-modal-heading"
            className="font-serif text-3xl sm:text-4xl text-[#141413] font-normal tracking-tight"
          >
            Order Successfully Placed
          </h2>

          <p className="font-sans text-xs sm:text-sm text-[#5C5B54] font-light mt-3 max-w-md leading-relaxed">
            Thank you, {order.shippingAddress.fullName}. Your archival acquisition has been logged into
            the atelier fulfillment queue. A serialized packing itinerary has been queued for {order.shippingAddress.email}.
          </p>
        </div>

        {/* Order Details Ledger */}
        <div className="border-t border-b border-[#E5E3DC] py-6 space-y-5 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-[#E5E3DC]/70">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#73726B] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date Logged
              </span>
              <p className="font-medium text-[#141413] mt-1">{order.date}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#73726B] flex items-center gap-1">
                <Package className="w-3 h-3" /> Total Items
              </span>
              <p className="font-medium text-[#141413] mt-1">
                {order.items.reduce((acc, i) => acc + i.quantity, 0)} Units
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#73726B]">
                Total Amount
              </span>
              <p className="font-medium text-[#141413] mt-1">{formatCurrency(order.total)}</p>
            </div>
          </div>

          {/* Shipping Address Summary */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#73726B] flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Delivery Destination
            </span>
            <p className="text-[#141413] font-medium">{order.shippingAddress.streetAddress}</p>
            <p className="text-[#5C5B54]">
              {order.shippingAddress.city}, {order.shippingAddress.stateProvince}{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
          </div>

          {/* Itemized list preview */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase tracking-wider text-[#73726B] block">
              Specimens Reserved:
            </span>
            <div className="space-y-1.5">
              {order.items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#E5E3DC]/40 last:border-b-0"
                >
                  <span className="text-[#141413] font-light">
                    {product.title} <span className="text-[#73726B]">× {quantity}</span>
                  </span>
                  <span className="font-mono font-medium text-[#141413]">
                    {formatCurrency(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            id="print-order-summary-button"
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 border border-[#D1CEC7] text-xs uppercase tracking-[0.18em] text-[#73726B] hover:text-[#141413] hover:border-[#141413] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            id="success-continue-shopping-button"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-3.5 bg-[#141413] text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2A2926] transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
