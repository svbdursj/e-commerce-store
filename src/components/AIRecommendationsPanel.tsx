import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import {
  getClaudeOpusRecommendations,
  type RecommendationResult,
  type AIRecommendationItem,
} from '../utils/aiRecommender';
import {
  Sparkles,
  ShoppingBag,
  Check,
  ArrowRight,
  Plus,
  Cpu,
  Layers,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AIRecommendationsPanelProps {
  activeProduct: Product;
  onSelectProduct: (product: Product) => void;
}

export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  activeProduct,
  onSelectProduct,
}) => {
  const { products } = useProducts();
  const { addToCart, openDrawer } = useCart();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommendationsData, setRecommendationsData] = useState<RecommendationResult | null>(null);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [bundleAdded, setBundleAdded] = useState<boolean>(false);

  // Trigger loading state whenever activeProduct changes
  useEffect(() => {
    setIsLoading(true);
    setBundleAdded(false);
    setAddedItemId(null);

    const timer = setTimeout(() => {
      const result = getClaudeOpusRecommendations(activeProduct, products);
      setRecommendationsData(result);
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [activeProduct, products]);

  const handleQuickAdd = (product: Product) => {
    if (product.stockInventoryCount === 0) return;
    addToCart(product, 1);
    setAddedItemId(product.id);
    setTimeout(() => {
      setAddedItemId(null);
    }, 1500);
  };

  const handleAddBundle = (companionProduct: Product) => {
    if (activeProduct.stockInventoryCount > 0) {
      addToCart(activeProduct, 1);
    }
    if (companionProduct.stockInventoryCount > 0) {
      addToCart(companionProduct, 1);
    }
    setBundleAdded(true);
    setTimeout(() => {
      setBundleAdded(false);
      openDrawer();
    }, 900);
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <section
      id="ai-product-recommendations-panel"
      className="w-full border-t border-[#E5E3DC] bg-[#FAF9F6] p-6 sm:p-8 lg:p-10 transition-colors"
      aria-labelledby="ai-recommendations-heading"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E5E3DC] gap-4">
        <div>
          {/* Engine Attribution Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#141413] text-[#FAF9F6] mb-3">
            <Cpu className="w-3 h-3 text-[#FAF9F6] animate-pulse" />
            <span
              id="ai-engine-badge"
              className="text-[10px] font-mono uppercase tracking-[0.22em] font-medium"
            >
              Powered by Claude Opus 4.8 Engine
            </span>
          </div>

          {/* Requested Exact Label: 'Recommended for You' */}
          <h3
            id="ai-recommendations-heading"
            className="font-serif text-2xl sm:text-3xl text-[#141413] font-normal tracking-tight leading-[1.2]"
          >
            Recommended for You
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5B54] font-normal mt-1 max-w-xl leading-[1.6]">
            Intelligent silhouette synthesis analyzing category tags, weave weight, and material provenance
            to assemble cohesive wardrobe archetypes.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#8C8A82] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#141413]" />
          <span>Curated Silhouette Pairing</span>
        </div>
      </div>

      {/* Loading State Container */}
      {isLoading ? (
        <div
          id="ai-recommendations-loading-state"
          className="py-16 sm:py-20 flex flex-col items-center justify-center text-center space-y-4"
          role="status"
          aria-live="polite"
        >
          <div className="relative flex items-center justify-center">
            {/* Animated Icon with subtle ring */}
            <div className="w-12 h-12 border-2 border-[#E5E3DC] border-t-[#141413] rounded-full animate-spin flex items-center justify-center" />
            <Sparkles className="w-5 h-5 text-[#141413] absolute animate-pulse" />
          </div>

          {/* Requested Exact Text: 'Loading Product Recommendations' */}
          <p
            id="loading-product-recommendations-text"
            className="text-sm sm:text-base font-serif text-[#141413] tracking-wide"
          >
            Loading Product Recommendations
          </p>

          <p className="text-[11px] font-mono text-[#73726B] uppercase tracking-[0.2em] max-w-sm">
            Claude Opus 4.8 analyzing {activeProduct.category} textile structure & tonal synergy...
          </p>
        </div>
      ) : recommendationsData ? (
        <div className="pt-6 space-y-6">
          {/* 2 Related Products Display Cards */}
          <div
            id="ai-recommendations-grid"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {recommendationsData.recommendations.map((item: AIRecommendationItem, index: number) => {
              const recProduct = item.product;
              const isAdded = addedItemId === recProduct.id;
              const isOutOfStock = recProduct.stockInventoryCount === 0;

              return (
                <div
                  key={recProduct.id}
                  id={`ai-rec-card-${recProduct.id}`}
                  className="group relative bg-[#FAF9F6] border border-[#E5E3DC] hover:border-[#141413] transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Top Bar: Synergy metric & Specimen Ref */}
                  <div className="px-4 py-2.5 bg-[#F0EEE6] border-b border-[#E5E3DC] flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5 text-[#141413] font-semibold">
                      <Sparkles className="w-3 h-3 text-[#141413]" />
                      <span>{item.matchScore}% Match • {item.synergyTag}</span>
                    </span>
                    <span className="text-[#73726B]">Specimen 0{index + 1}</span>
                  </div>

                  {/* Main Product Info and Imagery */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail Image */}
                    <div
                      className="relative w-full sm:w-32 h-44 sm:h-36 bg-[#E5E3DC] overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => onSelectProduct(recProduct)}
                      title={`Inspect ${recProduct.title}`}
                    >
                      <img
                        src={recProduct.imageUrl}
                        alt={recProduct.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-white px-2 py-1 bg-rose-600">
                            Archived
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details & Claude Reasoning */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#73726B]">
                            {recProduct.category} {recProduct.color && `• ${recProduct.color}`}
                          </span>
                          <span className="text-sm font-semibold text-[#141413]">
                            {formatPrice(recProduct.price)}
                          </span>
                        </div>

                        <h4
                          onClick={() => onSelectProduct(recProduct)}
                          className="font-serif text-base sm:text-lg text-[#141413] hover:underline cursor-pointer leading-snug"
                        >
                          {recProduct.title}
                        </h4>

                        {/* Claude Opus Architectural Styling Rationale */}
                        <div className="mt-2.5 p-2.5 bg-[#F5F4EE] border-l-2 border-[#141413] text-xs text-[#44433E] font-light leading-relaxed">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-[#73726B] block mb-0.5 font-medium">
                            Claude Opus 4.8 Styling Rationale:
                          </span>
                          {item.pairingReason}
                        </div>
                      </div>

                      {/* Action buttons with 44px touch targets */}
                      <div className="mt-4 pt-3 border-t border-[#E5E3DC] flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectProduct(recProduct)}
                          className="min-h-[44px] text-[11px] font-medium uppercase tracking-[0.16em] text-[#73726B] hover:text-[#141413] inline-flex items-center space-x-1 transition-colors px-1"
                        >
                          <span>Inspect Specimen</span>
                          <ArrowRight className="w-3 h-3 stroke-[2]" />
                        </button>

                        <button
                          id={`quick-add-rec-${recProduct.id}`}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handleQuickAdd(recProduct)}
                          className={`min-h-[44px] px-4 py-2 text-xs uppercase tracking-[0.18em] font-medium transition-all flex items-center space-x-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413] ${
                            isOutOfStock
                              ? 'bg-[#E5E3DC] text-[#8C8A82] cursor-not-allowed'
                              : isAdded
                              ? 'bg-emerald-800 text-white'
                              : 'bg-[#141413] text-[#FAF9F6] hover:bg-[#2A2926]'
                          }`}
                        >
                          {isOutOfStock ? (
                            <span>Sold Out</span>
                          ) : isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Add to Bag</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Expansion Incentive: Complete Ensemble Bundle Box */}
          {recommendationsData.recommendations.length > 0 && (
            <div
              id="ai-bundle-outfit-box"
              className="p-5 sm:p-6 bg-[#141413] text-[#FAF9F6] flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#141413]"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4C2BA]">
                    Ensemble Bundle Curation
                  </span>
                </div>
                <h4 className="font-serif text-lg sm:text-xl text-[#FAF9F6] tracking-tight">
                  Pair {activeProduct.title} with {recommendationsData.recommendations[0].product.title}
                </h4>
                <p className="text-xs text-[#C4C2BA] font-light max-w-xl">
                  Add both pieces to your bag in a single transaction to harmonize the complete silhouette.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C8A82] block">
                    Combined Total
                  </span>
                  <span className="font-serif text-xl font-medium text-[#FAF9F6]">
                    {formatPrice(
                      activeProduct.price + recommendationsData.recommendations[0].product.price
                    )}
                  </span>
                </div>

                <button
                  id="add-curated-bundle-btn"
                  type="button"
                  onClick={() => handleAddBundle(recommendationsData.recommendations[0].product)}
                  disabled={
                    activeProduct.stockInventoryCount === 0 ||
                    recommendationsData.recommendations[0].product.stockInventoryCount === 0
                  }
                  className={`min-h-[48px] px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center space-x-2 focus:outline-none ${
                    bundleAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FAF9F6] text-[#141413] hover:bg-[#EAE8E0]'
                  }`}
                >
                  {bundleAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>Ensemble Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                      <span>Bundle Complete Ensemble</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};
