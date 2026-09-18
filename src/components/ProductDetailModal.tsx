import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { X, ShieldCheck, Box, PackageCheck, Layers, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct,
}) => {
  const { addToCart, openDrawer } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [justAdded, setJustAdded] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (product) {
      setSelectedQty(1);
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M');
      setJustAdded(false);
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, selectedQty, selectedSize);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
      openDrawer();
    }, 900);
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div
      id="product-detail-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 lg:p-8 bg-[#141413]/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalContentRef}
        id="product-detail-modal-content"
        className="relative w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto bg-[#FAF9F6] border border-[#E5E3DC] shadow-2xl text-[#141413] animate-in zoom-in-95 duration-200 focus:outline-none"
      >
        {/* Close Button with Min 44px Touch Target */}
        <button
          id="product-detail-close-button"
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#FAF9F6]/90 hover:bg-[#141413] hover:text-[#FAF9F6] text-[#141413] border border-[#E5E3DC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
          aria-label="Close product details"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Imagery Showcase */}
          <div className="relative bg-[#F0EEE6] border-b md:border-b-0 md:border-r border-[#E5E3DC] min-h-[260px] sm:min-h-[340px] md:min-h-[500px]">
            <img
              id="modal-product-image"
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center max-h-[420px] md:max-h-none"
            />
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
              <span
                id="modal-product-id-badge"
                className="px-2.5 py-1 text-[10px] tracking-[0.25em] uppercase font-mono bg-[#141413] text-[#FAF9F6]"
              >
                REF // {product.id}
              </span>
            </div>
          </div>

          {/* Right: Technical & Editorial Specs */}
          <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category and stock badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span
                  id="modal-product-category"
                  className="uppercase tracking-[0.25em] font-semibold text-[#73726B]"
                >
                  {product.category} Collection {product.color && `• ${product.color}`}
                </span>
                {product.stockInventoryCount === 0 ? (
                  <span
                    id="modal-product-stock-count"
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono font-bold bg-rose-600 text-white"
                  >
                    <span>Out of Stock</span>
                  </span>
                ) : product.stockInventoryCount <= 5 ? (
                  <span
                    id="modal-product-stock-count"
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300"
                  >
                    <PackageCheck className="w-3 h-3 text-amber-900" />
                    <span>Low Stock: {product.stockInventoryCount} Units Remaining</span>
                  </span>
                ) : (
                  <span
                    id="modal-product-stock-count"
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono font-medium bg-[#EAE8E0] text-[#141413]"
                  >
                    <PackageCheck className="w-3 h-3 text-[#141413]" />
                    <span>{product.stockInventoryCount} Units in Vault</span>
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h2
                  id="modal-product-title"
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#141413] font-normal tracking-tight leading-tight pr-12 md:pr-0"
                >
                  {product.title}
                </h2>
                <p
                  id="modal-product-price"
                  className="font-sans text-xl sm:text-2xl font-semibold text-[#141413] mt-2"
                >
                  {formattedPrice}
                </p>
              </div>

              <div className="w-full border-t border-[#E5E3DC] pt-4" />

              {/* Description */}
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#73726B] block mb-2">
                  Object Narrative
                </span>
                <p
                  id="modal-product-description"
                  className="font-sans text-sm text-[#44433E] leading-relaxed font-light"
                >
                  {product.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 pt-2">
                {product.materials && (
                  <div className="flex items-start space-x-3 text-xs">
                    <Layers className="w-4 h-4 text-[#73726B] mt-0.5 flex-shrink-0 stroke-[1.5]" />
                    <div>
                      <span className="font-medium text-[#141413] uppercase tracking-wider text-[10px] block">
                        Material Composition
                      </span>
                      <span className="text-[#5C5B54] font-light">{product.materials}</span>
                    </div>
                  </div>
                )}

                {product.dimensions && (
                  <div className="flex items-start space-x-3 text-xs">
                    <Box className="w-4 h-4 text-[#73726B] mt-0.5 flex-shrink-0 stroke-[1.5]" />
                    <div>
                      <span className="font-medium text-[#141413] uppercase tracking-wider text-[10px] block">
                        Dimensions & Envelope
                      </span>
                      <span className="text-[#5C5B54] font-light">{product.dimensions}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#73726B] mt-0.5 flex-shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="font-medium text-[#141413] uppercase tracking-wider text-[10px] block">
                      Authenticity Guarantee
                    </span>
                    <span className="text-[#5C5B54] font-light">
                      Accompanied by an embossed archival certificate of provenance and serialized stamp.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Garment Size Selection Section */}
            <div id="modal-size-selection-container" className="pt-5 border-t border-[#E5E3DC] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-[0.22em] font-medium text-[#73726B]">
                  Select Size
                </span>
                <span className="text-xs font-mono text-[#141413]">
                  Selected Fit: <strong className="font-semibold">{selectedSize}</strong>
                </span>
              </div>

              <div id="modal-size-options" className="flex flex-wrap gap-2">
                {(product.sizes && product.sizes.length > 0
                  ? product.sizes
                  : ['S', 'M', 'L', 'XL']
                ).map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      id={`modal-size-btn-${size.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] min-h-[44px] px-3.5 py-2 text-xs font-mono border transition-all duration-150 flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413] ${
                        isSelected
                          ? 'border-[#141413] bg-[#141413] text-[#FAF9F6] font-medium shadow-sm scale-[1.02]'
                          : 'border-[#D1CEC7] bg-white text-[#44433E] hover:border-[#141413] hover:text-[#141413]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Quantity & Add to Cart Section */}
            <div className="pt-4 border-t border-[#E5E3DC] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Quantity Stepper with 44px touch targets */}
                <div
                  id="modal-quantity-stepper"
                  className={`flex items-center justify-between sm:justify-start border bg-[#FAF9F6] ${
                    product.stockInventoryCount === 0 ? 'border-[#D1CEC7] opacity-40' : 'border-[#141413]'
                  }`}
                >
                  <button
                    type="button"
                    disabled={product.stockInventoryCount === 0 || selectedQty <= 1}
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-[#141413] hover:bg-[#F0EEE6] disabled:opacity-30 transition-colors focus:outline-none"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 stroke-[1.5]" />
                  </button>
                  <span className="w-10 text-center text-sm font-mono font-medium text-[#141413]">
                    {product.stockInventoryCount === 0 ? 0 : selectedQty}
                  </span>
                  <button
                    type="button"
                    disabled={product.stockInventoryCount === 0 || selectedQty >= product.stockInventoryCount}
                    onClick={() =>
                      setSelectedQty(Math.min(product.stockInventoryCount, selectedQty + 1))
                    }
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-[#141413] hover:bg-[#F0EEE6] disabled:opacity-30 transition-colors focus:outline-none"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  id="modal-add-to-cart-button"
                  type="button"
                  disabled={product.stockInventoryCount === 0}
                  onClick={handleAdd}
                  className={`flex-1 min-h-[48px] py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center space-x-2 border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                    product.stockInventoryCount === 0
                      ? 'bg-[#E5E3DC] text-[#8C8A82] border-[#E5E3DC] cursor-not-allowed'
                      : justAdded
                      ? 'bg-[#141413] text-[#FAF9F6] border-[#141413]'
                      : 'bg-[#141413] text-[#FAF9F6] border-[#141413] hover:bg-[#2A2926]'
                  }`}
                >
                  {product.stockInventoryCount === 0 ? (
                    <span>Archival Piece Out of Stock</span>
                  ) : justAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                      <span>Add to Cart • {formattedPrice}</span>
                    </>
                  )}
                </button>
              </div>

              <button
                id="modal-close-action-button"
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] py-2.5 px-6 border border-[#E5E3DC] text-[#73726B] hover:text-[#141413] hover:border-[#141413] text-xs uppercase tracking-[0.18em] font-medium transition-colors"
              >
                Close Specimen Details
              </button>
            </div>
          </div>
        </div>

        {/* Base of Detailed View: AI Product Recommendations Powered by Claude Opus 4.8 Engine */}
        <AIRecommendationsPanel
          activeProduct={product}
          onSelectProduct={(newProduct) => {
            if (onSelectProduct) {
              onSelectProduct(newProduct);
            }
          }}
        />
      </div>
    </div>
  );
};
