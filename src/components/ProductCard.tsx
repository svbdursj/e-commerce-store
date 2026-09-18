import React, { useState } from 'react';
import type { Product } from '../types';
import { ArrowUpRight, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart } = useCart();

  const isOutOfStock = product.stockInventoryCount === 0;
  const isLowStock = product.stockInventoryCount > 0 && product.stockInventoryCount <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1600);
  };

  // Formatted price with decimal places
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <article
      id={`product-card-${product.id}`}
      className="group flex flex-col justify-between bg-[#FAF9F6] border border-[#E5E3DC] p-4 sm:p-5 hover:border-[#141413] hover:-translate-y-0.5 transition-all duration-200 ease-out"
    >
      <div>
        {/* Product Image Frame */}
        <div
          id={`product-image-container-${product.id}`}
          className="relative aspect-[4/5] w-full overflow-hidden bg-[#F0EEE6] mb-5 border border-[#E5E3DC]"
        >
          {/* Skeleton placeholder while loading */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-[#ECEAE2] animate-pulse" />
          )}

          {!imageError ? (
            <img
              id={`product-image-${product.id}`}
              src={product.imageUrl}
              alt={product.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isOutOfStock ? 'grayscale-[50%] opacity-85' : ''}`}
            />
          ) : (
            /* Fallback minimal graphic if network blocks image */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#73726B]">
              <span className="font-serif text-2xl text-[#141413] mb-2">{product.title}</span>
              <span className="text-xs uppercase tracking-widest text-[#8C8A82]">Edition Specimen</span>
            </div>
          )}

          {/* Category Pill Tag Overlay */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span
              id={`product-badge-category-${product.id}`}
              className="inline-block px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#FAF9F6]/95 backdrop-blur-sm text-[#141413] border border-[#E5E3DC]"
            >
              {product.category}
            </span>
          </div>

          {/* Stock inventory status badge */}
          <div className="absolute bottom-3 right-3 pointer-events-none">
            {isOutOfStock ? (
              <span
                id={`product-stock-${product.id}`}
                className="inline-block px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-mono font-bold bg-rose-700 text-white shadow-sm"
              >
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span
                id={`product-stock-${product.id}`}
                className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] font-mono font-semibold bg-amber-600 text-white backdrop-blur-sm shadow-sm"
              >
                Low Stock: {product.stockInventoryCount} left
              </span>
            ) : (
              <span
                id={`product-stock-${product.id}`}
                className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] font-mono font-medium bg-[#141413]/90 text-[#FAF9F6] backdrop-blur-sm"
              >
                {product.stockInventoryCount} in stock
              </span>
            )}
          </div>
        </div>

        {/* Product Metadata Details */}
        <div id={`product-info-${product.id}`} className="flex flex-col space-y-2 mb-4">
          <div className="flex items-baseline justify-between gap-2">
            <span
              id={`product-category-label-${product.id}`}
              className="text-[11px] uppercase tracking-[0.22em] font-medium text-[#73726B]"
            >
              {product.category} Series {product.color && `• ${product.color}`}
            </span>
            <span
              id={`product-price-${product.id}`}
              className="font-sans text-sm font-semibold tracking-tight text-[#141413]"
            >
              {formattedPrice}
            </span>
          </div>

          <h3
            id={`product-title-${product.id}`}
            className="font-serif text-xl sm:text-2xl text-[#141413] font-normal tracking-tight group-hover:text-[#262523] transition-colors leading-[1.25] line-clamp-1"
            title={product.title}
          >
            {product.title}
          </h3>

          <p
            id={`product-desc-${product.id}`}
            className="text-xs text-[#5C5B54] font-normal leading-[1.65] line-clamp-2"
          >
            {product.description}
          </p>
        </div>
      </div>

      {/* Interactive Action Buttons with Min 44px Touch Targets */}
      <div id={`product-action-wrapper-${product.id}`} className="pt-3 flex flex-col sm:flex-row gap-2 sm:gap-2.5">
        <button
          id={`product-add-cart-${product.id}`}
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`flex-1 min-h-[44px] inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs uppercase tracking-[0.18em] font-medium border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
            isOutOfStock
              ? 'bg-[#E5E3DC] text-[#8C8A82] border-[#E5E3DC] cursor-not-allowed'
              : justAdded
              ? 'bg-[#141413] text-[#FAF9F6] border-[#141413]'
              : 'bg-[#141413] text-[#FAF9F6] border-[#141413] hover:bg-[#262523] active:scale-[0.99]'
          }`}
          aria-label={isOutOfStock ? `${product.title} is out of stock` : `Add ${product.title} to cart`}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : justAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2]" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        <button
          id={`product-view-details-${product.id}`}
          type="button"
          onClick={() => onViewDetails(product)}
          className="flex-1 min-h-[44px] inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 border border-[#D1CEC7] text-xs uppercase tracking-[0.18em] font-medium text-[#141413] bg-transparent hover:border-[#141413] hover:bg-[#F0EEE6] active:scale-[0.99] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75]" />
        </button>
      </div>
    </article>
  );
};
