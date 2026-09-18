/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { CartProvider, useCart } from './context/CartContext';
import { DiscountsProvider } from './context/DiscountsContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutOverlay } from './components/CheckoutOverlay';
import { OrderConfirmationScreen } from './components/OrderConfirmationScreen';
import { AccountPortal } from './components/AccountPortal';
import { ProfileDashboard } from './components/ProfileDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EditorialFooter } from './components/EditorialFooter';
import type { NavTab, Product, OrderDetails } from './types';
import { ArrowLeft } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { completedOrder, setCompletedOrder } = useCart();
  const { currentUser, isAdmin } = useAuth();

  const handleShopCollection = () => {
    const catalogElement = document.getElementById('product-catalog-section');
    if (catalogElement && activeTab === 'home') {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div id="app-root" className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141413]">
      {/* Fully Sticky Functional Navigation Bar with Dynamic Cart Counter & Admin Link */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Slide-out Cart Drawer Panel */}
      <CartDrawer />

      {/* Multi-Step Checkout Overlay with Stripe Test Processing */}
      <CheckoutOverlay
        onOrderPlaced={(order: OrderDetails) => {
          setCompletedOrder(order);
          setActiveTab('order-confirmation');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Area */}
      {activeTab === 'home' ? (
        <HeroSection
          onShopCollection={handleShopCollection}
          onViewDetails={(product) => setSelectedProduct(product)}
        />
      ) : activeTab === 'catalog' ? (
        <main id="catalog-main-view" className="w-full flex-1">
          <div className="pt-8 pb-4 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
            <button
              id="back-to-home-from-catalog-header"
              type="button"
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-medium text-[#73726B] hover:text-[#141413] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Overview</span>
            </button>
          </div>
          <CatalogSection onViewDetails={(product) => setSelectedProduct(product)} />
        </main>
      ) : activeTab === 'admin' ? (
        <AdminDashboard
          onNavigateToStore={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : activeTab === 'order-confirmation' ? (
        <OrderConfirmationScreen
          order={completedOrder}
          onContinueShopping={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onViewCatalog={() => {
            setActiveTab('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onViewAccount={() => {
            setActiveTab('account');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentUser ? (
        <ProfileDashboard
          onViewOrderDetails={(order) => {
            setCompletedOrder(order);
            setActiveTab('order-confirmation');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onExploreCatalog={() => {
            setActiveTab('catalog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToAdmin={() => {
            setActiveTab('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        <AccountPortal
          onSuccessfulAuth={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Product Detail Specimen Inspection Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(product) => setSelectedProduct(product)}
      />

      {/* Editorial Footer */}
      <EditorialFooter
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <DiscountsProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </DiscountsProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
