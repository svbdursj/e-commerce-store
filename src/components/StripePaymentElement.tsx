import React from 'react';
import {
  STRIPE_TEST_CARDS,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  type StripeCardInput,
  type StripeTestPreset,
} from '../services/stripeService';
import { CreditCard, Lock, ShieldCheck, AlertCircle, Check } from 'lucide-react';

interface StripePaymentElementProps {
  cardInput: StripeCardInput;
  onChange: (updated: StripeCardInput) => void;
  cardErrors: Record<string, string>;
  isProcessing: boolean;
}

export const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
  cardInput,
  onChange,
  cardErrors,
  isProcessing,
}) => {
  const brand = detectCardBrand(cardInput.number);

  const handleApplyPreset = (preset: StripeTestPreset) => {
    onChange({
      ...cardInput,
      number: preset.cardNumber,
      expiry: preset.expiry,
      cvc: preset.cvc,
      nameOnCard: cardInput.nameOnCard || 'Julian Vance',
    });
  };

  return (
    <div
      id="stripe-test-payment-module"
      className="p-4 sm:p-6 border border-[#E5E3DC] bg-[#FAF9F6] space-y-6"
    >
      {/* Stripe Header & Test Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E3DC] pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-[#635BFF] flex items-center justify-center text-white font-bold font-sans text-xs tracking-wider shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141413]">
                Stripe Payment Gateway
              </span>
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono font-medium bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20 rounded-full">
                Test Module
              </span>
            </div>
            <p className="text-[11px] text-[#73726B] font-light">
              Native Stripe test environment. Use any valid test credentials below.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-[#73726B] font-light self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-[#44433E]" />
          <span>Encrypted via 256-bit TLS</span>
        </div>
      </div>

      {/* Fast Preset Test Card Pills */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#73726B] block">
          Select Stripe Test Profile:
        </span>
        <div className="flex flex-wrap gap-2">
          {STRIPE_TEST_CARDS.map((preset) => {
            const isSelected = cardInput.number.replace(/\D/g, '') === preset.cardNumber.replace(/\D/g, '');
            return (
              <button
                key={preset.title}
                type="button"
                disabled={isProcessing}
                onClick={() => handleApplyPreset(preset)}
                className={`min-h-[44px] px-3.5 py-2 text-xs font-mono border transition-all flex items-center space-x-1.5 focus:outline-none ${
                  isSelected
                    ? 'border-[#141413] bg-[#141413] text-[#FAF9F6]'
                    : 'border-[#D1CEC7] bg-[#F0EEE6] text-[#44433E] hover:border-[#141413] hover:text-[#141413]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                <span>{preset.title.split(' (')[0]}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded ${
                    preset.outcome === 'success'
                      ? isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stripe Card Element Input Wrapper */}
      <div className="space-y-4">
        {/* Name on Card */}
        <div>
          <label
            htmlFor="stripe-card-name"
            className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
          >
            Name on Card *
          </label>
          <input
            id="stripe-card-name"
            type="text"
            disabled={isProcessing}
            value={cardInput.nameOnCard}
            onChange={(e) => onChange({ ...cardInput, nameOnCard: e.target.value })}
            placeholder="e.g. Julian Vance"
            className={`w-full min-h-[44px] px-4 py-3 bg-[#FAF9F6] border text-sm text-[#141413] focus:outline-none transition-colors ${
              cardErrors.nameOnCard
                ? 'border-red-500 focus:border-red-600'
                : 'border-[#D1CEC7] focus:border-[#141413]'
            }`}
          />
          {cardErrors.nameOnCard && (
            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {cardErrors.nameOnCard}
            </p>
          )}
        </div>

        {/* Card Number with Brand Badge */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="stripe-card-number"
              className="text-xs uppercase tracking-wider text-[#44433E] font-medium"
            >
              Card Number *
            </label>
            <div className="flex items-center space-x-1.5">
              {brand !== 'unknown' ? (
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#EAE8E0] text-[#141413] border border-[#D1CEC7]">
                  {brand.toUpperCase()}
                </span>
              ) : (
                <CreditCard className="w-4 h-4 text-[#73726B]" />
              )}
            </div>
          </div>

          <div className="relative">
            <input
              id="stripe-card-number"
              type="text"
              disabled={isProcessing}
              value={cardInput.number}
              onChange={(e) =>
                onChange({
                  ...cardInput,
                  number: formatCardNumber(e.target.value),
                })
              }
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              className={`w-full min-h-[44px] font-mono text-sm tracking-widest px-4 py-3 bg-[#FAF9F6] border text-[#141413] focus:outline-none transition-colors ${
                cardErrors.number
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-[#D1CEC7] focus:border-[#141413]'
              }`}
            />
          </div>
          {cardErrors.number && (
            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {cardErrors.number}
            </p>
          )}
        </div>

        {/* Expiry, CVC & Billing Zip Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Expiration Date */}
          <div>
            <label
              htmlFor="stripe-card-expiry"
              className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
            >
              Expiration *
            </label>
            <input
              id="stripe-card-expiry"
              type="text"
              disabled={isProcessing}
              value={cardInput.expiry}
              onChange={(e) =>
                onChange({
                  ...cardInput,
                  expiry: formatExpiry(e.target.value),
                })
              }
              placeholder="MM / YY"
              maxLength={7}
              className={`w-full min-h-[44px] font-mono text-sm px-4 py-3 bg-[#FAF9F6] border text-[#141413] focus:outline-none transition-colors ${
                cardErrors.expiry
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-[#D1CEC7] focus:border-[#141413]'
              }`}
            />
            {cardErrors.expiry && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {cardErrors.expiry}
              </p>
            )}
          </div>

          {/* CVC Code */}
          <div>
            <label
              htmlFor="stripe-card-cvc"
              className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
            >
              CVC Code *
            </label>
            <div className="relative">
              <input
                id="stripe-card-cvc"
                type="password"
                disabled={isProcessing}
                value={cardInput.cvc}
                onChange={(e) =>
                  onChange({
                    ...cardInput,
                    cvc: e.target.value.replace(/\D/g, '').slice(0, 4),
                  })
                }
                placeholder={brand === 'amex' ? '1234' : '123'}
                maxLength={4}
                className={`w-full min-h-[44px] font-mono text-sm px-4 py-3 bg-[#FAF9F6] border text-[#141413] focus:outline-none transition-colors ${
                  cardErrors.cvc
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-[#D1CEC7] focus:border-[#141413]'
                }`}
              />
              <Lock className="w-3.5 h-3.5 text-[#8C8A82] absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            {cardErrors.cvc && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {cardErrors.cvc}
              </p>
            )}
          </div>

          {/* Postal / ZIP Code */}
          <div>
            <label
              htmlFor="stripe-card-postal"
              className="block text-xs uppercase tracking-wider text-[#44433E] mb-1.5 font-medium"
            >
              Postal / ZIP *
            </label>
            <input
              id="stripe-card-postal"
              type="text"
              disabled={isProcessing}
              value={cardInput.postalCode}
              onChange={(e) =>
                onChange({
                  ...cardInput,
                  postalCode: e.target.value.slice(0, 10),
                })
              }
              placeholder="94103"
              className={`w-full min-h-[44px] font-mono text-sm px-4 py-3 bg-[#FAF9F6] border text-[#141413] focus:outline-none transition-colors ${
                cardErrors.postalCode
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-[#D1CEC7] focus:border-[#141413]'
              }`}
            />
            {cardErrors.postalCode && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {cardErrors.postalCode}
              </p>
            )}
          </div>
        </div>

        {/* Global Payment Error if any (e.g. simulated decline) */}
        {cardErrors.general && (
          <div
            id="stripe-payment-general-error"
            className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Card Authorization Failed</span>
              <span>{cardErrors.general}</span>
            </div>
          </div>
        )}

        {/* Stripe Trust Assurance Footer */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#73726B] font-light">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Stripe PCI-DSS Level 1 Service Provider Certified</span>
          </div>
          <span className="font-mono text-[10px] text-[#8C8A82]">API // v2025.test</span>
        </div>
      </div>
    </div>
  );
};
