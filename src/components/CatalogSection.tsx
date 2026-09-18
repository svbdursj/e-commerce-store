import React, { useState, useMemo } from 'react';
import type { Product, ProductCategory } from '../types';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from './ProductCard';
import { Filter } from 'lucide-react';

interface CatalogSectionProps {
  onViewDetails: (product: Product) => void;
}

const CATEGORIES: ProductCategory[] = ['All', 'Outerwear', 'Knitwear', 'Tops', 'Bottoms', 'Footwear'];

export const CatalogSection: React.FC<CatalogSectionProps> = ({ onViewDetails }) => {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');

  // Instant filtering based on selectedCategory
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return products;
    }
    return products.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, products]);

  // Counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: products.length,
      Outerwear: 0,
      Knitwear: 0,
      Tops: 0,
      Bottoms: 0,
      Footwear: 0,
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [products]);

  return (
    <section
      id="product-catalog-section"
      className="w-full py-14 sm:py-20 lg:py-28 px-4 sm:px-8 lg:px-12 bg-[#FAF9F6]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Title & Summary */}
        <div
          id="catalog-header-container"
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-[#E5E3DC] gap-4 sm:gap-6"
        >
          <div>
            <div className="flex items-center space-x-2 text-[#73726B] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#141413]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium text-[#73726B]">
                Curated Wardrobe Archive
              </span>
            </div>
            <h2
              id="catalog-heading"
              className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight leading-[1.15]"
            >
              Permanent Garment Collection
            </h2>
          </div>

          <p className="text-xs text-[#5C5B54] font-normal leading-[1.65] max-w-xs tracking-wide">
            Showing {filteredProducts.length} of {products.length} archived silhouettes. Each garment adheres to rigorous architectural tailoring and pure textile provenance.
          </p>
        </div>

        {/* Horizontal Row of Filter Pills with Min 44px Touch Targets */}
        <div
          id="catalog-filter-pills-container"
          className="flex items-center justify-between flex-wrap gap-4 mb-8 sm:mb-12"
          role="region"
          aria-label="Garment Category Filters"
        >
          <div className="w-full sm:w-auto flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center text-xs uppercase tracking-widest text-[#73726B] mr-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 mr-1.5 stroke-[1.5]" />
              <span>Filter:</span>
            </div>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              const count = categoryCounts[category] || 0;
              return (
                <button
                  key={category}
                  id={`filter-pill-${category.toLowerCase()}`}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[44px] inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] font-medium transition-all duration-200 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                    isSelected
                      ? 'bg-[#141413] text-[#FAF9F6] shadow-sm'
                      : 'bg-[#FAF9F6] text-[#73726B] border border-[#E5E3DC] hover:border-[#141413] hover:text-[#141413]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="whitespace-nowrap">{category}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#FAF9F6]/20 text-[#FAF9F6]'
                        : 'bg-[#EAE8E0] text-[#73726B]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-[#8C8A82] uppercase tracking-[0.18em] font-light hidden sm:inline-block">
            {selectedCategory === 'All' ? 'Complete Archive' : `${selectedCategory} Edition`}
          </span>
        </div>

        {/* Responsive Product Display Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
        <div
          id="product-display-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
