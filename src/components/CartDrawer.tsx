import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useDiscounts } from '../context/DiscountsContext';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    totalItemsCount,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    openCheckout,
  } = useCart();

  const { appliedPromo, applyPromoCode, removeAppliedPromo, calculateDiscount } = useDiscounts();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const discountSavings = calculateDiscount(subtotal);
  const finalTotal = Math.max(0, subtotal - discountSavings);

  const formattedSubtotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(subtotal);

  const formattedSavings = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(discountSavings);

  const formattedFinalTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(finalTotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const result = applyPromoCode(promoInput, subtotal);
    if (result.success) {
      setPromoMessage({ type: 'success', text: result.message });
      setPromoInput('');
    } else {
      setPromoMessage({ type: 'error', text: result.message });
    }

    setTimeout(() => {
      setPromoMessage(null);
    }, 4500);
  };

  return (
    <div
      id="cart-drawer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag Drawer"
      className="fixed inset-0 z-50 flex justify-end bg-[#141413]/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      {/* Drawer Panel */}
      <aside
        id="cart-drawer-panel"
        className="w-full sm:w-[480px] h-full bg-[#FAF9F6] border-l border-[#E5E3DC] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 text-[#141413]"
      >
        {/* Drawer Header */}
        <div
          id="cart-drawer-header"
          className="p-6 sm:px-8 border-b border-[#E5E3DC] flex items-center justify-between bg-[#FAF9F6]"
        >
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            <h2
              id="cart-drawer-title"
              className="font-serif text-2xl text-[#141413] tracking-tight"
            >
              Shopping Bag
            </h2>
            <span
              id="cart-drawer-count-badge"
              className="px-2.5 py-0.5 text-xs font-mono bg-[#EAE8E0] text-[#141413] border border-[#E5E3DC]"
            >
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            id="close-cart-drawer-button"
            type="button"
            onClick={closeDrawer}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#F0EEE6] text-[#141413] rounded-full transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Drawer Body / Items List */}
        <div id="cart-drawer-body" className="flex-1 overflow-y-auto p-4 sm:p-6 sm:px-8 space-y-6">
          {cart.length === 0 ? (
            <div
              id="empty-cart-state"
              className="h-full flex flex-col items-center justify-center text-center py-16 px-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#F0EEE6] border border-[#E5E3DC] flex items-center justify-center mb-6 text-[#73726B]">
                <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
              </div>
              <h3 className="font-serif text-2xl text-[#141413] mb-2 font-normal">
                Your bag is empty
              </h3>
              <p className="text-xs text-[#73726B] max-w-xs font-light leading-relaxed mb-8">
                Explore our permanent collection and add items to reserve them in your selection.
              </p>
              <button
                id="empty-cart-continue-button"
                type="button"
                onClick={closeDrawer}
                className="px-8 py-3.5 bg-[#141413] text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2A2926] transition-colors"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map(({ product, quantity, selectedSize }) => {
                const itemFormattedPrice = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(product.price);

                const itemLineTotal = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(product.price * quantity);

                return (
                  <div
                    key={`${product.id}-${selectedSize || 'std'}`}
                    id={`cart-item-row-${product.id}`}
                    className="flex space-x-4 pb-6 border-b border-[#E5E3DC] last:border-b-0"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-24 flex-shrink-0 bg-[#F0EEE6] border border-[#E5E3DC] overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            id={`cart-item-title-${product.id}`}
                            className="font-serif text-lg text-[#141413] leading-snug line-clamp-1"
                            title={product.title}
                          >
                            {product.title}
                          </h4>
                          <span
                            id={`cart-item-linetotal-${product.id}`}
                            className="font-sans text-sm font-semibold text-[#141413] whitespace-nowrap"
                          >
                            {itemLineTotal}
                          </span>
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5 mt-1">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#73726B] font-medium">
                            {product.category} Series • {itemFormattedPrice}
                          </span>
                          {selectedSize && (
                            <span
                              id={`cart-item-size-${product.id}`}
                              className="px-2 py-0.5 text-[9px] font-mono font-medium bg-[#EAE8E0] text-[#141413] border border-[#D1CEC7]"
                            >
                              Size: {selectedSize}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Remove Button */}
                      <div className="flex items-center justify-between pt-3">
                        <div
                          id={`quantity-stepper-${product.id}`}
                          className="flex items-center border border-[#E5E3DC] bg-[#FAF9F6]"
                        >
                          <button
                            id={`decrement-qty-${product.id}`}
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1, selectedSize)}
                            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#141413] hover:bg-[#F0EEE6] transition-colors focus:outline-none"
                            aria-label={`Decrease quantity of ${product.title}`}
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                          <span
                            id={`qty-display-${product.id}`}
                            className="w-8 text-center text-xs font-mono font-medium text-[#141413]"
                          >
                            {quantity}
                          </span>
                          <button
                            id={`increment-qty-${product.id}`}
                            type="button"
                            disabled={quantity >= product.stockInventoryCount}
                            onClick={() => updateQuantity(product.id, quantity + 1, selectedSize)}
                            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#141413] hover:bg-[#F0EEE6] disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
                            aria-label={`Increase quantity of ${product.title}`}
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>

                        {/* Remove Text Button with 44px touch height */}
                        <button
                          id={`remove-item-${product.id}`}
                          type="button"
                          onClick={() => removeFromCart(product.id, selectedSize)}
                          className="min-h-[44px] px-2 flex items-center text-xs uppercase tracking-[0.16em] text-[#73726B] hover:text-[#141413] underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Base / Subtotal and Proceed to Checkout */}
        {cart.length > 0 && (
          <div
            id="cart-drawer-footer"
            className="p-4 sm:p-6 sm:px-8 border-t border-[#E5E3DC] bg-[#FAF9F6] space-y-4"
          >
            {/* Promo Code Input Section */}
            <div id="cart-drawer-promo-section" className="space-y-2 pb-2 border-b border-[#E5E3DC]/70">
              <label
                htmlFor="cart-drawer-promo-input"
                className="block text-[10px] font-mono uppercase tracking-[0.22em] font-medium text-[#73726B]"
              >
                Promo Code
              </label>

              {appliedPromo ? (
                <div
                  id="cart-drawer-applied-promo-badge"
                  className="p-2.5 bg-[#F0EEE6] border border-[#D1CEC7] flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Tag className="w-3.5 h-3.5 text-[#141413]" />
                    <span className="font-mono text-xs font-semibold text-[#141413]">
                      {appliedPromo.code}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {appliedPromo.discountType === 'percentage'
                        ? `${appliedPromo.value}% OFF`
                        : `$${appliedPromo.value} OFF`}
                    </span>
                  </div>

                  <button
                    id="cart-drawer-remove-promo-btn"
                    type="button"
                    onClick={removeAppliedPromo}
                    className="min-h-[44px] px-2 flex items-center text-[11px] uppercase tracking-wider text-[#73726B] hover:text-[#141413] underline font-medium focus:outline-none"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="cart-drawer-promo-input"
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Try WELCOME10 or ATELIER50"
                      className="w-full min-h-[44px] px-3 py-2 text-xs font-mono uppercase bg-white border border-[#D1CEC7] text-[#141413] placeholder:text-[#8C8A82] placeholder:normal-case focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                  <button
                    id="cart-drawer-apply-promo-btn"
                    type="submit"
                    disabled={!promoInput.trim()}
                    className="min-h-[44px] px-4 py-2 bg-[#141413] text-[#FAF9F6] text-xs font-mono uppercase tracking-wider font-medium hover:bg-[#262523] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Feedback Notice */}
              {promoMessage && (
                <p
                  className={`text-[11px] font-mono mt-1 ${
                    promoMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Calculated Subtotal, Discount & Final Bag Total */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#73726B]">
                <span className="uppercase tracking-[0.2em] font-medium">
                  Subtotal
                </span>
                <span id="cart-drawer-subtotal" className="font-mono text-xs font-medium text-[#141413]">
                  {formattedSubtotal}
                </span>
              </div>

              {appliedPromo && discountSavings > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-800">
                  <span className="uppercase tracking-[0.2em] font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Promo Savings ({appliedPromo.code})
                  </span>
                  <span id="cart-drawer-savings-amount" className="font-mono text-xs font-semibold">
                    -{formattedSavings}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#73726B]">
                <span>Archival Handling & Logistics</span>
                <span className="uppercase tracking-wider font-medium text-[#141413]">
                  Complimentary
                </span>
              </div>

              <div className="flex items-center justify-between text-sm pt-2 border-t border-[#E5E3DC]">
                <span className="uppercase tracking-[0.2em] font-semibold text-[#141413] text-xs">
                  Estimated Total
                </span>
                <span
                  id="cart-drawer-final-total"
                  className="font-sans text-xl font-semibold text-[#141413]"
                >
                  {formattedFinalTotal}
                </span>
              </div>
            </div>

            {/* High-Contrast Proceed to Checkout Button */}
            <button
              id="proceed-to-checkout-button"
              type="button"
              onClick={openCheckout}
              className="w-full inline-flex items-center justify-center space-x-3 py-4 px-8 bg-[#141413] text-[#FAF9F6] border border-[#141413] text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#262523] active:scale-[0.99] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#8C8A82] tracking-wider uppercase font-light">
              Secure Session • Zero Live Payment Tokens Embedded
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};
