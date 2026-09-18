import React, { useState } from 'react';
import { ShoppingBag, Menu, X, ArrowUpRight, Shield, Instagram, Music2 } from 'lucide-react';
import type { NavTab, NavItem } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { id: 'nav-link-home', label: 'Home', tab: 'home', href: '#home' },
  { id: 'nav-link-catalog', label: 'Catalog', tab: 'catalog', href: '#catalog' },
  { id: 'nav-link-account', label: 'Account', tab: 'account', href: '#account' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartContext = useCart();
  const { currentUser, isAdmin } = useAuth();

  const effectiveCartCount = cartCount !== undefined ? cartCount : cartContext.totalItemsCount;
  const effectiveOpenCart = onOpenCart || cartContext.openDrawer;

  const navItems: NavItem[] = [...BASE_NAV_ITEMS];
  if (isAdmin) {
    navItems.push({
      id: 'nav-link-admin',
      label: 'Admin',
      tab: 'admin',
      href: '#admin',
    });
  }

  return (
    <header
      id="global-header"
      className="sticky top-0 z-50 w-full bg-[#FAF9F6] border-b border-[#E5E3DC] transition-colors"
      style={{ backgroundColor: '#FAF9F6', opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo Text Placeholder (Left) */}
          <div id="brand-logo-container" className="flex-1 flex items-center">
            <button
              id="brand-logo-button"
              type="button"
              onClick={() => onSelectTab('home')}
              className="group text-left min-h-[44px] flex flex-col justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
              aria-label="Atelier Foundation Home"
            >
              <span
                id="brand-logo-text"
                className="font-sans text-xs sm:text-sm uppercase tracking-[0.28em] font-semibold text-[#141413] group-hover:text-[#44433E] transition-colors whitespace-nowrap"
              >
                É D I T I O N // N°01
              </span>
              <span className="block text-[10px] tracking-[0.18em] uppercase text-[#73726B] font-light mt-0.5">
                Wardrobe Archive
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links (Center) */}
          <nav
            id="center-navigation"
            className="hidden md:flex items-center justify-center space-x-6 lg:space-x-10 flex-initial"
            aria-label="Primary Navigation"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              const displayLabel =
                item.tab === 'account' && currentUser
                  ? `Account (${currentUser.fullName.split(' ')[0]})`
                  : item.label;

              return (
                <button
                  key={item.id}
                  id={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.tab)}
                  className={`relative min-h-[44px] px-2 py-2 text-xs sm:text-sm uppercase tracking-[0.18em] font-medium transition-colors flex items-center space-x-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413] ${
                    isActive
                      ? 'text-[#141413]'
                      : 'text-[#73726B] hover:text-[#141413]'
                  }`}
                >
                  {item.tab === 'account' && currentUser && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                  )}
                  {item.tab === 'admin' && (
                    <Shield className="w-3.5 h-3.5 text-[#141413] mr-1" />
                  )}
                  <span className="whitespace-nowrap">{displayLabel}</span>
                  {item.tab === 'admin' && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono tracking-widest bg-[#141413] text-[#FAF9F6]">
                      PANEL
                    </span>
                  )}
                  {isActive && (
                    <span
                      id={`${item.id}-indicator`}
                      className="absolute bottom-1 left-2 right-2 h-[1.5px] bg-[#141413]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Stylized Cart Counter Icon Asset (Right) */}
          <div
            id="header-actions-container"
            className="flex-1 flex items-center justify-end space-x-2 sm:space-x-3"
          >
            <button
              id="cart-action-button"
              type="button"
              onClick={effectiveOpenCart}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#141413] hover:bg-[#F0EEE6] active:scale-95 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
              aria-label={`Shopping bag containing ${effectiveCartCount} items`}
            >
              <ShoppingBag
                id="cart-bag-icon"
                className="w-5 h-5 stroke-[1.5]"
                aria-hidden="true"
              />
              {/* Stylized Counter Badge */}
              <span
                id="cart-counter-badge"
                className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center text-[9px] font-medium tracking-tight bg-[#141413] text-[#FAF9F6] border border-[#FAF9F6] rounded-full"
              >
                {effectiveCartCount}
              </span>
            </button>

            {/* Mobile Hamburger Toggle Button (min 44px touch target) */}
            <button
              id="mobile-menu-toggle-button"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#141413] hover:bg-[#F0EEE6] rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-[#141413]"
              aria-label="Open Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-overlay"
          className="fixed inset-0 z-[100] md:hidden bg-[#141413]/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <aside
            id="mobile-navigation-slideout"
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-[#FAF9F6] border-l border-[#E5E3DC] shadow-2xl flex flex-col justify-between p-6 z-[101] text-[#141413]"
            style={{ backgroundColor: '#FAF9F6', opacity: 1, isolation: 'isolate' }}
          >
            <div>
              {/* Drawer Top Bar: Brand & Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-[#E5E3DC]">
                <div>
                  <span className="font-sans text-xs uppercase tracking-[0.24em] font-semibold text-[#141413] block">
                    É D I T I O N
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-[#73726B] font-medium">
                    Navigation Archive
                  </span>
                </div>

                <button
                  id="mobile-menu-close-button"
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#141413] bg-[#F0EEE6] hover:bg-[#E5E3DC] active:scale-95 transition-all focus:outline-none"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Navigation Links List */}
              <nav
                id="mobile-navigation-links"
                className="flex flex-col py-6 space-y-2.5 bg-[#FAF9F6]"
                style={{ backgroundColor: '#FAF9F6', opacity: 1 }}
              >
                {navItems.map((item) => {
                  const isActive = activeTab === item.tab;
                  const displayLabel =
                    item.tab === 'account' && currentUser
                      ? `Account (${currentUser.fullName.split(' ')[0]})`
                      : item.label;

                  return (
                    <button
                      key={`mobile-${item.id}`}
                      id={`mobile-${item.id}`}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`min-h-[48px] px-4 py-3 rounded-none flex items-center justify-between text-xs uppercase tracking-[0.22em] font-medium text-left transition-colors border ${
                        isActive
                          ? 'bg-[#141413] text-[#FAF9F6] border-[#141413]'
                          : 'bg-[#FAF9F6] text-[#141413] border-[#E5E3DC] hover:border-[#141413] hover:bg-[#F0EEE6]'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#141413' : '#FAF9F6',
                        color: isActive ? '#FAF9F6' : '#141413',
                        opacity: 1,
                      }}
                    >
                      <div className="flex items-center space-x-2.5">
                        {item.tab === 'account' && currentUser && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        )}
                        {item.tab === 'admin' && (
                          <Shield className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#FAF9F6]' : 'text-[#141413]'}`} />
                        )}
                        <span className="font-semibold">{displayLabel}</span>
                        {item.tab === 'admin' && (
                          <span className={`px-1.5 py-0.5 text-[8px] font-mono tracking-widest ${
                            isActive ? 'bg-[#FAF9F6] text-[#141413]' : 'bg-[#141413] text-[#FAF9F6]'
                          }`}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      <ArrowUpRight className={`w-3.5 h-3.5 flex-shrink-0 stroke-[2] ${isActive ? 'text-[#FAF9F6]' : 'text-[#141413]'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Slide-out Drawer Footer / Shopping Bag Quick Link */}
            <div className="pt-6 border-t border-[#E5E3DC] space-y-4">
              <button
                id="mobile-slideout-bag-button"
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  effectiveOpenCart();
                }}
                className="w-full min-h-[48px] px-4 py-3 bg-[#FAF9F6] border border-[#141413] text-[#141413] hover:bg-[#141413] hover:text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                  <span>Shopping Bag</span>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#EAE8E0] text-[#141413] rounded-full">
                  {effectiveCartCount}
                </span>
              </button>

              {/* Social Channels in Drawer */}
              <div id="mobile-drawer-social-links" className="space-y-2 pt-2">
                <span className="text-[9px] uppercase tracking-[0.22em] font-medium text-[#73726B] block">
                  Social Salons
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    id="mobile-drawer-link-tiktok"
                    href="https://www.tiktok.com/@editionatelier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3 py-2 bg-[#FAF9F6] border border-[#E5E3DC] hover:border-[#141413] hover:bg-[#F0EEE6] flex items-center justify-between text-[#141413] transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Music2 className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span className="text-[10px] uppercase tracking-[0.14em] font-semibold">TikTok</span>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-[#73726B]" />
                  </a>

                  <a
                    id="mobile-drawer-link-instagram"
                    href="https://www.instagram.com/editionatelier"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3 py-2 bg-[#FAF9F6] border border-[#E5E3DC] hover:border-[#141413] hover:bg-[#F0EEE6] flex items-center justify-between text-[#141413] transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Instagram className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span className="text-[10px] uppercase tracking-[0.14em] font-semibold">Instagram</span>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-[#73726B]" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-[#8C8A82]">
                <span>Archive Vol. 2026</span>
                <span>Curated Luxury</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
