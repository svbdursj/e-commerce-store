import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { OrderDetails } from '../types';
import {
  User,
  Package,
  Truck,
  ShieldCheck,
  LogOut,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  MapPin,
  Clock,
} from 'lucide-react';

interface ProfileDashboardProps {
  onViewOrderDetails: (order: OrderDetails) => void;
  onExploreCatalog: () => void;
  onNavigateToAdmin?: () => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  onViewOrderDetails,
  onExploreCatalog,
  onNavigateToAdmin,
}) => {
  const { currentUser, userOrders, signOut } = useAuth();
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  if (!currentUser) {
    return null;
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  const handleCopy = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTrackingId(trackingNum);
    setTimeout(() => setCopiedTrackingId(null), 2000);
  };

  return (
    <main
      id="profile-dashboard-view"
      className="w-full flex-1 max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-20 animate-in fade-in duration-300 text-[#141413]"
    >
      {/* Profile Header Banner */}
      <section
        id="profile-header-banner"
        className="border-b border-[#E5E3DC] pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-[#73726B] block">
              Private Client Portfolio
            </span>
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono font-medium bg-[#141413] text-[#FAF9F6] rounded-none">
              {currentUser.tier}
            </span>
            {currentUser.role === 'admin' && (
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono font-bold bg-amber-200 text-amber-900 border border-amber-300">
                Administrator
              </span>
            )}
            <span
              id="user-unique-identifier-badge"
              className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono text-[#73726B] border border-[#D1CEC7]"
              title="Unique User Identifier Variable"
            >
              UID: {currentUser.id}
            </span>
          </div>

          <h1
            id="profile-client-name"
            className="font-serif text-3xl sm:text-5xl text-[#141413] font-normal tracking-tight"
          >
            {currentUser.fullName}
          </h1>

          <p className="font-sans text-xs sm:text-sm text-[#5C5B54] font-light mt-2 flex items-center space-x-2">
            <span>{currentUser.email}</span>
            <span>•</span>
            <span>Client since {currentUser.memberSince}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
          {currentUser.role === 'admin' && onNavigateToAdmin && (
            <button
              id="dashboard-admin-console-btn"
              type="button"
              onClick={onNavigateToAdmin}
              className="min-h-[44px] inline-flex items-center space-x-2 px-5 py-2.5 bg-[#141413] text-[#FAF9F6] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#2A2926] transition-colors focus:outline-none"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Console</span>
            </button>
          )}

          <button
            id="sign-out-button"
            type="button"
            onClick={signOut}
            className="min-h-[44px] inline-flex items-center space-x-2 px-5 py-2.5 border border-[#D1CEC7] bg-[#FAF9F6] text-xs uppercase tracking-[0.18em] font-medium text-[#73726B] hover:text-[#141413] hover:border-[#141413] transition-colors focus:outline-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* Account Details & Isolation Assurance Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
        {/* Account Details Card */}
        <div
          id="account-details-card"
          className="p-6 border border-[#E5E3DC] bg-[#FAF9F6] space-y-4"
        >
          <div className="flex items-center space-x-2 border-b border-[#E5E3DC] pb-3 text-[#141413]">
            <User className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">
              Account Credentials & Tier
            </h3>
          </div>

          <div className="text-xs text-[#44433E] space-y-2 font-light leading-relaxed">
            <div className="flex justify-between py-1 border-b border-[#F0EEE6]">
              <span className="text-[#73726B]">Full Legal Name</span>
              <span className="font-medium text-[#141413]">{currentUser.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EEE6]">
              <span className="text-[#73726B]">Direct Email</span>
              <span className="font-mono text-[11px] text-[#141413]">{currentUser.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0EEE6]">
              <span className="text-[#73726B]">Unique User ID</span>
              <span className="font-mono text-[11px] text-[#141413]">{currentUser.id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#73726B]">Collector Status</span>
              <span className="font-medium text-[#141413]">{currentUser.tier}</span>
            </div>
          </div>
        </div>

        {/* Default Shipping Destination Card */}
        <div
          id="default-shipping-card"
          className="p-6 border border-[#E5E3DC] bg-[#FAF9F6] space-y-4"
        >
          <div className="flex items-center space-x-2 border-b border-[#E5E3DC] pb-3 text-[#141413]">
            <MapPin className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">
              Default Archival Destination
            </h3>
          </div>

          <div className="text-xs text-[#44433E] space-y-1 font-light leading-relaxed">
            {currentUser.defaultAddress ? (
              <>
                <p className="font-medium text-[#141413]">{currentUser.defaultAddress.fullName}</p>
                <p>
                  {currentUser.defaultAddress.streetAddress}
                  {currentUser.defaultAddress.apartment ? `, ${currentUser.defaultAddress.apartment}` : ''}
                </p>
                <p>
                  {currentUser.defaultAddress.city}, {currentUser.defaultAddress.stateProvince}{' '}
                  {currentUser.defaultAddress.postalCode}
                </p>
                <p>{currentUser.defaultAddress.country}</p>
                <p className="pt-1 text-[#73726B]">
                  Preferred Method:{' '}
                  <span className="capitalize font-medium text-[#141413]">
                    {currentUser.defaultAddress.deliveryMethod || 'Standard'}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-[#73726B]">
                No default shipping address logged yet. Addresses used during checkout are
                automatically saved.
              </p>
            )}
          </div>
        </div>

        {/* Strict Data Isolation Assurance Card */}
        <div
          id="data-isolation-assurance-card"
          className="p-6 border border-[#141413] bg-[#F0EEE6] space-y-3 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2 border-b border-[#D1CEC7] pb-3 text-[#141413]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">
                Strict Record Isolation Active
              </h3>
            </div>
            <p className="text-xs text-[#5C5B54] font-light mt-3 leading-relaxed">
              Your transaction history is cryptographically query-bound strictly to identifier{' '}
              <code className="font-mono text-[#141413] font-semibold">{currentUser.id}</code>. No other
              registered client or guest session can view your completed checkout logs.
            </p>
          </div>

          <div className="pt-3 border-t border-[#D1CEC7] flex items-center justify-between text-[11px] font-mono text-[#73726B]">
            <span>ISOLATION: ENFORCED</span>
            <span>MATCHES: {userOrders.length} ORDERS</span>
          </div>
        </div>
      </div>

      {/* Historical Order History Section */}
      <section id="historical-orders-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E3DC] pb-4">
          <div>
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-[#141413]" />
              <h2
                id="order-history-title"
                className="font-serif text-2xl sm:text-3xl text-[#141413] font-normal"
              >
                Historical Specimen Orders
              </h2>
            </div>
            <p className="text-xs text-[#73726B] font-light mt-1">
              Pulling directly from your past completed checkout logs ({userOrders.length}{' '}
              {userOrders.length === 1 ? 'record' : 'records'}).
            </p>
          </div>

          <button
            id="history-shop-more-button"
            type="button"
            onClick={onExploreCatalog}
            className="min-h-[44px] inline-flex items-center space-x-2 text-xs uppercase tracking-[0.18em] font-medium text-[#141413] hover:text-[#5C5B54] transition-colors self-start sm:self-auto"
          >
            <span>Acquire New Specimen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {userOrders.length === 0 ? (
          /* Empty State */
          <div
            id="empty-order-history"
            className="p-8 sm:p-16 border border-[#E5E3DC] bg-[#FAF9F6] text-center space-y-4 max-w-xl mx-auto my-8"
          >
            <Clock className="w-8 h-8 text-[#8C8A82] mx-auto stroke-[1.5]" />
            <h3 className="font-serif text-2xl text-[#141413] font-normal">
              No acquisitions logged yet
            </h3>
            <p className="text-xs text-[#73726B] font-light leading-relaxed">
              You do not have any historical completed orders linked to identifier{' '}
              <strong className="font-mono text-[#141413]">{currentUser.id}</strong>. Once you
              complete a checkout, your serialized tracking records will appear here.
            </p>
            <div className="pt-3">
              <button
                id="empty-history-explore-catalog-btn"
                type="button"
                onClick={onExploreCatalog}
                className="min-h-[44px] inline-flex items-center justify-center px-8 py-3 bg-[#141413] text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2A2926] transition-colors"
              >
                Explore Curated Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Historical Order Grid */
          <div
            id="historical-orders-grid"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {userOrders.map((order) => (
              <article
                key={order.orderId}
                id={`order-card-${order.orderId}`}
                className="p-5 sm:p-6 border border-[#E5E3DC] bg-[#FAF9F6] flex flex-col justify-between space-y-6 hover:border-[#141413] transition-all"
              >
                {/* Card Header: IDs & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-[#E5E3DC] pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#141413] block">
                        {order.orderId}
                      </span>
                      <span className="text-[11px] text-[#73726B] font-light">
                        Logged {order.date}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 border ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {order.status || 'In Vault Packaging'}
                    </span>
                  </div>

                  {/* Tracking Number Row with Copy Button */}
                  <div className="flex items-center justify-between bg-[#F0EEE6] p-2 sm:p-2.5 border border-[#D1CEC7]">
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <Truck className="w-3.5 h-3.5 text-[#5C5B54] flex-shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider text-[#73726B] flex-shrink-0">
                        Tracking:
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#141413] truncate">
                        {order.trackingNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(order.trackingNumber)}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#73726B] hover:text-[#141413] transition-colors focus:outline-none"
                      title="Copy Tracking Number"
                    >
                      {copiedTrackingId === order.trackingNumber ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Body: Item Thumbnails & Titles */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#73726B] block">
                    Specimens Acquired ({order.items.reduce((a, b) => a + b.quantity, 0)}):
                  </span>
                  <div className="space-y-2">
                    {order.items.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center space-x-3 truncate mr-2">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover border border-[#E5E3DC] flex-shrink-0"
                          />
                          <span className="text-[#141413] font-serif truncate">
                            {product.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#73726B] font-mono flex-shrink-0">
                          {quantity} × {formatCurrency(product.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Ledger & View Full Receipt Button */}
                <div className="pt-4 border-t border-[#E5E3DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#73726B] block">
                      Paid Total
                    </span>
                    <span className="font-sans text-base font-bold text-[#141413]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <button
                    id={`view-order-receipt-${order.orderId}`}
                    type="button"
                    onClick={() => onViewOrderDetails(order)}
                    className="min-h-[44px] inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 border border-[#141413] text-[11px] uppercase tracking-[0.16em] font-medium text-[#141413] hover:bg-[#141413] hover:text-[#FAF9F6] transition-colors focus:outline-none"
                  >
                    <span>View Receipt & Tracking</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
