import React from 'react';
import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { CatalogSection } from './CatalogSection';
import type { Product } from '../types';

interface HeroSectionProps {
  onShopCollection?: () => void;
  onViewDetails: (product: Product) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopCollection, onViewDetails }) => {
  return (
    <main id="main-content" className="w-full">
      {/* Primary Minimalist Hero Section */}
      <section
        id="hero-section"
        className="relative w-full py-14 sm:py-20 lg:py-28 px-4 sm:px-8 lg:px-12 bg-[#FAF9F6]"
      >
        <div className="max-w-5xl mx-auto">
          {/* Subtle Architectural Release Index */}
          <div
            id="hero-edition-marker"
            className="flex items-center space-x-2.5 sm:space-x-3 mb-6 sm:mb-10 text-[#73726B]"
          >
            <span className="w-2 h-2 rounded-full bg-[#141413] flex-shrink-0" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium text-[#44433E]">
              Global Permanent Collection
            </span>
            <span className="text-[#D1CEC7]">/</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-normal text-[#73726B]">
              Vol. 2026
            </span>
          </div>

          {/* Bold Typographic Headline with Explicit Line-Height Ratio */}
          <h1
            id="hero-headline"
            className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal text-[#141413] tracking-[-0.03em] leading-[1.08] sm:leading-[1.05] text-balance mb-6 sm:mb-8"
          >
            Sartorial Wardrobe for Deliberate Living
          </h1>

          {/* Supporting Paragraph Outlining Premium Product Standards */}
          <p
            id="hero-product-standards"
            className="font-sans text-base sm:text-lg md:text-xl text-[#44433E] font-normal leading-[1.65] max-w-[68ch] mb-8 sm:mb-12"
          >
            Conceived at the crossroads of architectural tailoring and pure textile provenance. Every garment
            is engineered according to rigorous single-origin standards: double-faced cashmere, dry-waxed
            organic cottons, extra-fine merino wool, and calfskin footwear constructed in small, serialized editions.
            We reject seasonal excess in pursuit of enduring wardrobe archetypes.
          </p>

          {/* Prominent Call-to-Action Button with min 44px touch target */}
          <div id="hero-actions-container" className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
            <button
              id="cta-shop-collection"
              type="button"
              onClick={onShopCollection}
              className="group w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center space-x-4 px-8 sm:px-10 py-4 bg-[#141413] text-[#FAF9F6] border border-[#141413] text-xs sm:text-sm uppercase tracking-[0.2em] font-medium transition-all duration-200 hover:bg-[#262523] hover:border-[#262523] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
            >
              <span className="whitespace-nowrap">Shop Collection</span>
              <ArrowRight
                id="cta-arrow-icon"
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Thin 1px Component Layout Divider */}
      <div id="hero-divider-section" className="w-full px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto border-t border-[#E5E3DC]" />
      </div>

      {/* Directly Beneath Hero: High-Performance Product Catalog Layout Section */}
      <CatalogSection onViewDetails={onViewDetails} />

      {/* Thin 1px Component Layout Divider */}
      <div id="catalog-divider-section" className="w-full px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto border-t border-[#E5E3DC]" />
      </div>

      {/* Editorial Standards Overview - Supporting Product Standards */}
      <section
        id="product-standards-manifesto"
        className="w-full py-14 sm:py-20 lg:py-28 px-4 sm:px-8 lg:px-12 bg-[#FAF9F6]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Standard 1 */}
            <div
              id="standard-pillar-1"
              className="flex flex-col space-y-4 p-6 sm:p-8 bg-[#FAF9F6] border border-[#E5E3DC] hover:border-[#141413] transition-all duration-200"
            >
              <div className="flex items-center space-x-3 text-[#141413]">
                <Compass className="w-5 h-5 stroke-[1.5]" />
                <span className="text-xs uppercase tracking-[0.25em] font-medium text-[#141413]">
                  01 // Precision Craft
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#141413] font-normal tracking-tight leading-[1.25]">
                Architectural Proportions
              </h3>
              <p className="text-sm text-[#5C5B54] leading-[1.65] font-normal">
                Every dimension is mathematically calibrated to create spatial stillness. We prioritize
                tactile balance, ergonomic refinement, and zero unneeded components.
              </p>
            </div>

            {/* Standard 2 */}
            <div
              id="standard-pillar-2"
              className="flex flex-col space-y-4 p-6 sm:p-8 bg-[#FAF9F6] border border-[#E5E3DC] hover:border-[#141413] transition-all duration-200"
            >
              <div className="flex items-center space-x-3 text-[#141413]">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                <span className="text-xs uppercase tracking-[0.25em] font-medium text-[#141413]">
                  02 // Material Integrity
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#141413] font-normal tracking-tight leading-[1.25]">
                Single-Origin Provenance
              </h3>
              <p className="text-sm text-[#5C5B54] leading-[1.65] font-normal">
                Sourced exclusively from certified heritage mills. Materials are left untreated with toxic
                polymers, permitting rich natural patinas to mature gracefully over decades.
              </p>
            </div>

            {/* Standard 3 */}
            <div
              id="standard-pillar-3"
              className="flex flex-col space-y-4 p-6 sm:p-8 bg-[#FAF9F6] border border-[#E5E3DC] hover:border-[#141413] transition-all duration-200"
            >
              <div className="flex items-center space-x-3 text-[#141413]">
                <Sparkles className="w-5 h-5 stroke-[1.5]" />
                <span className="text-xs uppercase tracking-[0.25em] font-medium text-[#141413]">
                  03 // Circular Longevity
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#141413] font-normal tracking-tight leading-[1.25]">
                Lifelong Serviceability
              </h3>
              <p className="text-sm text-[#5C5B54] leading-[1.65] font-normal">
                Constructed with modular mechanical fasteners rather than adhesive shortcuts. Every seam,
                joint, and surface can be disassembled, repaired, and restored for life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Thin 1px Layout Divider */}
      <div id="bottom-divider-section" className="w-full px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto border-t border-[#E5E3DC]" />
      </div>
    </main>
  );
};
