import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useDiscounts } from '../context/DiscountsContext';
import type { OrderDetails, Product, ProductCategory, DiscountType } from '../types';
import {
  TrendingUp,
  PackageCheck,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Layers,
  Sparkles,
  X,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Percent,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateToStore?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToStore }) => {
  const { currentUser, isAdmin, allOrders, updateOrderStatus, signIn } = useAuth();
  const {
    products,
    lowStockCount,
    outOfStockCount,
    updateProductStock,
    updateProductPrice,
    addProduct,
    resetCatalog,
  } = useProducts();

  // Order Table Controls
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Processing' | 'Shipped' | 'Delivered'>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const [statusUpdateNotice, setStatusUpdateNotice] = useState<string | null>(null);

  // Inventory Panel Controls
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'All' | 'LowStock' | 'OutOfStock'>('All');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<string>('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Promo Code Management State & Hooks
  const { promoCodes, createPromoCode, togglePromoStatus, deletePromoCode } = useDiscounts();
  const [showAddPromoForm, setShowAddPromoForm] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<DiscountType>('percentage');
  const [newPromoValue, setNewPromoValue] = useState('15');
  const [newPromoActive, setNewPromoActive] = useState(true);
  const [newPromoMinSpend, setNewPromoMinSpend] = useState('');
  const [newPromoDescription, setNewPromoDescription] = useState('');
  const [promoActionMessage, setPromoActionMessage] = useState<string | null>(null);

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const numVal = parseFloat(newPromoValue);
    if (isNaN(numVal) || numVal <= 0) return;

    const res = createPromoCode({
      code: newPromoCode.trim().toUpperCase(),
      discountType: newDiscountType,
      value: numVal,
      isActive: newPromoActive,
      minimumSpend: newPromoMinSpend ? parseFloat(newPromoMinSpend) : undefined,
      description: newPromoDescription.trim() || undefined,
    });

    if (res.success) {
      setPromoActionMessage(res.message);
      setNewPromoCode('');
      setNewPromoValue('15');
      setNewPromoMinSpend('');
      setNewPromoDescription('');
      setShowAddPromoForm(false);
    } else {
      setPromoActionMessage(res.message);
    }
    setTimeout(() => setPromoActionMessage(null), 4000);
  };

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Outerwear');
  const [newPrice, setNewPrice] = useState('280');
  const [newStock, setNewStock] = useState('10');
  const [newDescription, setNewDescription] = useState('');
  const [newMaterials, setNewMaterials] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // 1. Calculate Metrics
  const grossSalesRevenue = useMemo(() => {
    return allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  }, [allOrders]);

  const totalOrdersCount = allOrders.length;

  const orderStatusCounts = useMemo(() => {
    const counts = { Processing: 0, Shipped: 0, Delivered: 0 };
    allOrders.forEach((order) => {
      if (order.status === 'Processing') counts.Processing++;
      else if (order.status === 'Shipped') counts.Shipped++;
      else if (order.status === 'Delivered') counts.Delivered++;
      else if (order.status === 'In Vault Packaging') counts.Processing++;
      else if (order.status === 'In Transit') counts.Shipped++;
    });
    return counts;
  }, [allOrders]);

  const averageOrderValue = totalOrdersCount > 0 ? grossSalesRevenue / totalOrdersCount : 0;

  // 2. Filtered Orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.orderId.toLowerCase().includes(q) ||
        order.shippingAddress.fullName.toLowerCase().includes(q) ||
        order.shippingAddress.email.toLowerCase().includes(q) ||
        order.trackingNumber.toLowerCase().includes(q) ||
        order.items.some((it) => it.product.title.toLowerCase().includes(q));

      const matchesStatus =
        orderStatusFilter === 'All' ||
        order.status === orderStatusFilter ||
        (orderStatusFilter === 'Processing' && order.status === 'In Vault Packaging') ||
        (orderStatusFilter === 'Shipped' && order.status === 'In Transit');

      return matchesSearch && matchesStatus;
    });
  }, [allOrders, orderSearchQuery, orderStatusFilter]);

  // 3. Filtered Products for Inventory Panel
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = inventorySearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.title.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.materials && product.materials.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (inventoryFilter === 'LowStock') {
        return product.stockInventoryCount > 0 && product.stockInventoryCount <= 5;
      }
      if (inventoryFilter === 'OutOfStock') {
        return product.stockInventoryCount === 0;
      }
      return true;
    });
  }, [products, inventorySearchQuery, inventoryFilter]);

  // Handle status change with instant feedback
  const handleStatusChange = (orderId: string, newStatus: 'Processing' | 'Shipped' | 'Delivered') => {
    updateOrderStatus(orderId, newStatus);
    setStatusUpdateNotice(`Order ${orderId} status updated to ${newStatus}`);
    setTimeout(() => {
      setStatusUpdateNotice(null);
    }, 3500);
  };

  // Handle inline price save
  const handleSavePrice = (productId: string) => {
    const val = parseFloat(tempPriceValue);
    if (!isNaN(val) && val > 0) {
      updateProductPrice(productId, val);
    }
    setEditingPriceId(null);
  };

  // Handle Add Product submit
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProd: Product = {
      id: `garment-custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      price: Math.max(1, parseFloat(newPrice) || 100),
      stockInventoryCount: Math.max(0, parseInt(newStock, 10) || 0),
      description: newDescription.trim() || 'Tailored sartorial edition designed with high-grade fabrication.',
      materials: newMaterials.trim() || '100% Organic Fibers',
      color: newColor.trim() || 'Charcoal',
      sizes: ['S', 'M', 'L', 'XL'],
      imageUrl:
        newImageUrl.trim() ||
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80',
    };

    addProduct(newProd);
    setShowAddProductModal(false);
    // Reset inputs
    setNewTitle('');
    setNewPrice('280');
    setNewStock('10');
    setNewDescription('');
    setNewMaterials('');
    setNewColor('');
    setNewImageUrl('');
  };

  // Access Restriction Gate
  if (!isAdmin) {
    return (
      <div
        id="admin-access-denied-gate"
        className="min-h-[70vh] flex items-center justify-center px-6 py-20 bg-[#FAF9F6]"
      >
        <div className="max-w-md w-full bg-white border border-[#E5E3DC] p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#73726B] block mb-2">
            Security Clearance Error // 403
          </span>
          <h2 className="font-serif text-2xl text-[#141413] mb-3">
            Executive Access Required
          </h2>
          <p className="font-sans text-xs text-[#5C5B54] leading-relaxed mb-6 font-light">
            The Atelier Operations Console is restricted to authenticated administrative directors.
            Non-admin accounts cannot inspect commercial revenues, customer transactions, or warehouse inventories.
          </p>

          <div className="space-y-3">
            <button
              id="admin-instant-auth-button"
              type="button"
              onClick={() => signIn('admin@edition.store')}
              className="w-full py-3 px-4 bg-[#141413] text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2A2926] transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate as Admin Director</span>
            </button>

            {onNavigateToStore && (
              <button
                id="admin-return-store-button"
                type="button"
                onClick={onNavigateToStore}
                className="w-full py-2.5 px-4 border border-[#D1CEC7] text-[#141413] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#F0EEE6] transition-all"
              >
                Return to Storefront
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-container" className="w-full bg-[#FAF9F6] min-h-screen text-[#141413] pb-24">
      {/* Top Operations Header Bar */}
      <section id="admin-header-bar" className="border-b border-[#E5E3DC] bg-[#FAF9F6]/90 backdrop-blur-sm sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-[0.28em] text-[#73726B]">
                É D I T I O N // ATELIER OPERATIONS CONSOLE
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#141413] font-normal tracking-tight mt-1">
              Store Executive & Inventory Management
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="min-h-[44px] px-3.5 py-2 bg-[#F0EEE6] border border-[#E5E3DC] flex items-center space-x-2 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-mono text-[11px] text-[#44433E]">
                Director: <strong className="text-[#141413]">{currentUser?.fullName || 'Elena Vance'}</strong>
              </span>
            </div>

            <button
              id="admin-reset-catalog-btn"
              type="button"
              onClick={resetCatalog}
              title="Reset inventory count and prices to factory defaults"
              className="min-h-[44px] px-3.5 py-2 border border-[#D1CEC7] bg-white hover:bg-[#F0EEE6] text-xs font-mono text-[#5C5B54] hover:text-[#141413] transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            {onNavigateToStore && (
              <button
                id="admin-view-storefront-btn"
                type="button"
                onClick={onNavigateToStore}
                className="min-h-[44px] px-4 py-2 bg-[#141413] text-[#FAF9F6] hover:bg-[#2A2926] text-xs uppercase tracking-[0.16em] font-medium transition-all flex items-center space-x-2"
              >
                <span>Live Storefront</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Floating Status Notification Toast */}
      {statusUpdateNotice && (
        <div
          id="admin-status-toast"
          className="fixed bottom-6 right-6 z-50 bg-[#141413] text-white px-5 py-3 shadow-xl border border-[#44433E] flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-sans font-light tracking-wide">{statusUpdateNotice}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10">
        {/* ========================================================= */}
        {/* 3-CARD METRICS ROW                                         */}
        {/* ========================================================= */}
        <section id="admin-metrics-row" className="mb-10 sm:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Total Gross Sales Revenue */}
            <div
              id="metric-card-revenue"
              className="bg-white border border-[#E5E3DC] p-6 relative overflow-hidden transition-all hover:border-[#141413]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#73726B]">
                  Revenue Performance
                </span>
                <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E5E3DC] flex items-center justify-center text-[#141413]">
                  <DollarSign className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>

              <div className="mb-3">
                <div className="text-[11px] text-[#73726B] font-light uppercase tracking-wider mb-0.5">
                  Total Gross Sales
                </div>
                <div className="font-serif text-3xl sm:text-4xl text-[#141413] tracking-tight font-normal">
                  ${grossSalesRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EEE6] flex items-center justify-between text-xs font-mono text-[#5C5B54]">
                <span>AOV: ${averageOrderValue.toFixed(2)}</span>
                <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 text-[10px]">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18.4% Net
                </span>
              </div>
            </div>

            {/* Card 2: Total Orders Processed */}
            <div
              id="metric-card-orders"
              className="bg-white border border-[#E5E3DC] p-6 relative overflow-hidden transition-all hover:border-[#141413]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#73726B]">
                  Fulfillment Pipeline
                </span>
                <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E5E3DC] flex items-center justify-center text-[#141413]">
                  <PackageCheck className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>

              <div className="mb-3">
                <div className="text-[11px] text-[#73726B] font-light uppercase tracking-wider mb-0.5">
                  Total Orders Logged
                </div>
                <div className="font-serif text-3xl sm:text-4xl text-[#141413] tracking-tight font-normal">
                  {totalOrdersCount} <span className="text-base font-sans text-[#73726B] font-light">Transactions</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EEE6] flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
                  {orderStatusCounts.Processing} Processing
                </span>
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200">
                  {orderStatusCounts.Shipped} Shipped
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {orderStatusCounts.Delivered} Delivered
                </span>
              </div>
            </div>

            {/* Card 3: Low Stock Alerts */}
            <div
              id="metric-card-inventory-alert"
              className={`bg-white border p-6 relative overflow-hidden transition-all ${
                lowStockCount > 0 ? 'border-amber-400/80' : 'border-[#E5E3DC]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#73726B]">
                  Warehouse Depletion
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    lowStockCount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-[#FAF9F6] text-[#73726B]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>

              <div className="mb-3">
                <div className="text-[11px] text-[#73726B] font-light uppercase tracking-wider mb-0.5">
                  Low Stock Alerts (≤ 5 units)
                </div>
                <div className="font-serif text-3xl sm:text-4xl text-[#141413] tracking-tight font-normal flex items-baseline space-x-2">
                  <span>{lowStockCount}</span>
                  <span className="text-base font-sans text-[#73726B] font-light">Garments</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EEE6] flex items-center justify-between text-[11px] font-mono">
                <span className="text-rose-700 font-semibold">
                  {outOfStockCount} Out of Stock
                </span>
                <button
                  type="button"
                  onClick={() => setInventoryFilter('LowStock')}
                  className="text-[10px] text-[#141413] underline underline-offset-2 hover:text-[#5C5B54]"
                >
                  Filter Inventory →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* MAIN WORKBENCH: SPREADSHEET TABLE & INVENTORY PANEL        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================= */}
          {/* LEFT: ORDER MANAGEMENT SPREADSHEET TABLE (Col 7 / 12)   */}
          {/* ======================================================= */}
          <section
            id="admin-orders-spreadsheet-section"
            className="lg:col-span-7 bg-white border border-[#E5E3DC] p-4 sm:p-6 shadow-sm"
          >
            {/* Table Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#E5E3DC]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#73726B] block">
                  Logistics & Fulfillment
                </span>
                <h2 className="font-serif text-xl text-[#141413]">
                  Order Management Spreadsheet
                </h2>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-1">
                {(['All', 'Processing', 'Shipped', 'Delivered'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setOrderStatusFilter(status)}
                    className={`min-h-[44px] px-3.5 py-2 text-[11px] font-mono transition-all inline-flex items-center justify-center ${
                      orderStatusFilter === status
                        ? 'bg-[#141413] text-[#FAF9F6]'
                        : 'bg-[#F0EEE6] text-[#5C5B54] hover:bg-[#E5E3DC]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Filter */}
            <div className="py-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#73726B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Order ID, Customer Name, Email, Garment, or Tracking..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full min-h-[44px] bg-[#FAF9F6] border border-[#E5E3DC] pl-9 pr-3 py-2 text-xs text-[#141413] placeholder-[#8C8A82] focus:outline-none focus:border-[#141413]"
                />
              </div>
            </div>

            {/* Interactive Spreadsheet Table */}
            <div className="overflow-x-auto border border-[#E5E3DC]">
              <table id="admin-orders-table" className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F0EEE6] border-b border-[#E5E3DC] text-[10px] font-mono uppercase tracking-[0.16em] text-[#5C5B54]">
                    <th className="py-3 px-3">Order Ref</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Garments</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Status Selector</th>
                    <th className="py-3 px-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3DC]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[#73726B] font-light">
                        No orders match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const totalGarments = order.items.reduce((sum, it) => sum + it.quantity, 0);
                      const displayStatus =
                        order.status === 'In Vault Packaging'
                          ? 'Processing'
                          : order.status === 'In Transit'
                          ? 'Shipped'
                          : order.status;

                      return (
                        <tr
                          key={order.orderId}
                          id={`order-row-${order.orderId}`}
                          className="hover:bg-[#FAF9F6] transition-colors group"
                        >
                          {/* Order Ref & Date */}
                          <td className="py-3 px-3 font-mono">
                            <div className="font-semibold text-[#141413]">{order.orderId}</div>
                            <div className="text-[10px] text-[#73726B]">{order.date}</div>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-3">
                            <div className="font-medium text-[#141413]">
                              {order.shippingAddress.fullName}
                            </div>
                            <div className="text-[10px] text-[#73726B] font-mono truncate max-w-[120px]">
                              {order.shippingAddress.city}, {order.shippingAddress.stateProvince}
                            </div>
                          </td>

                          {/* Garments Preview */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono font-medium text-[#141413]">
                                {totalGarments} {totalGarments === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#73726B] truncate max-w-[140px]">
                              {order.items.map((it) => it.product.title).join(', ')}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-3 font-mono font-medium text-[#141413]">
                            ${order.total.toFixed(2)}
                            <div className="text-[9px] text-[#73726B] font-normal uppercase">
                              {order.paymentDetails?.brand || 'CARD'} ••••{order.paymentDetails?.last4 || '4242'}
                            </div>
                          </td>

                          {/* Interactive Dropdown Status Selector */}
                          <td className="py-3 px-3">
                            <div className="relative inline-block">
                              <select
                                id={`status-select-${order.orderId}`}
                                value={displayStatus}
                                onChange={(e) =>
                                  handleStatusChange(
                                    order.orderId,
                                    e.target.value as 'Processing' | 'Shipped' | 'Delivered'
                                  )
                                }
                                className={`min-h-[44px] text-[11px] font-mono px-3 py-2 border appearance-none pr-7 cursor-pointer rounded-none focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                                  displayStatus === 'Processing'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : displayStatus === 'Shipped'
                                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                }`}
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-[#5C5B54]">
                                <ArrowUpDown className="w-3 h-3" />
                              </div>
                            </div>
                          </td>

                          {/* View Full Manifest Details */}
                          <td className="py-3 px-2 text-right">
                            <button
                              id={`view-order-details-${order.orderId}`}
                              type="button"
                              onClick={() => setSelectedOrderDetails(order)}
                              title="Inspect full transaction manifest"
                              className="w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-[#73726B] hover:text-[#141413] hover:bg-[#E5E3DC] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#73726B] font-mono">
              <span>Showing {filteredOrders.length} of {allOrders.length} total orders</span>
              <span>Statuses: Processing • Shipped • Delivered</span>
            </div>
          </section>

          {/* ======================================================= */}
          {/* RIGHT: INVENTORY TRACKING & DATABASE PANEL (Col 5 / 12)  */}
          {/* ======================================================= */}
          <section
            id="admin-inventory-tracking-panel"
            className="lg:col-span-5 bg-white border border-[#E5E3DC] p-4 sm:p-6 shadow-sm"
          >
            {/* Panel Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-[#E5E3DC]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#73726B] block">
                  Warehouse Database
                </span>
                <h2 className="font-serif text-xl text-[#141413]">
                  Inventory Tracking Panel
                </h2>
              </div>

              <button
                id="admin-add-garment-btn"
                type="button"
                onClick={() => setShowAddProductModal(true)}
                className="min-h-[44px] px-3.5 py-2 bg-[#141413] text-[#FAF9F6] text-xs font-medium hover:bg-[#2A2926] transition-all flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Garment</span>
              </button>
            </div>

            {/* Inventory Filters & Search */}
            <div className="py-3 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#73726B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search catalog garments..."
                  value={inventorySearchQuery}
                  onChange={(e) => setInventorySearchQuery(e.target.value)}
                  className="w-full min-h-[44px] bg-[#FAF9F6] border border-[#E5E3DC] pl-9 pr-3 py-2 text-xs text-[#141413] placeholder-[#8C8A82] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setInventoryFilter('All')}
                  className={`min-h-[44px] px-3 py-2 text-[11px] inline-flex items-center ${
                    inventoryFilter === 'All'
                      ? 'bg-[#141413] text-white'
                      : 'bg-[#F0EEE6] text-[#5C5B54] hover:bg-[#E5E3DC]'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryFilter('LowStock')}
                  className={`min-h-[44px] px-3 py-2 text-[11px] inline-flex items-center ${
                    inventoryFilter === 'LowStock'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Low Stock (≤5)
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryFilter('OutOfStock')}
                  className={`min-h-[44px] px-3 py-2 text-[11px] inline-flex items-center ${
                    inventoryFilter === 'OutOfStock'
                      ? 'bg-rose-700 text-white font-semibold'
                      : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  Out of Stock ({outOfStockCount})
                </button>
              </div>
            </div>

            {/* Product List with Direct Database Stock & Price Controls */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stockInventoryCount === 0;
                const isLowStock = product.stockInventoryCount > 0 && product.stockInventoryCount <= 5;
                const isEditingPrice = editingPriceId === product.id;

                return (
                  <div
                    key={product.id}
                    id={`inventory-card-${product.id}`}
                    className={`p-3.5 border transition-all ${
                      isOutOfStock
                        ? 'border-rose-300 bg-rose-50/20'
                        : isLowStock
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-[#E5E3DC] bg-white hover:border-[#D1CEC7]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-14 h-16 object-cover bg-[#E5E3DC] shrink-0 border border-[#E5E3DC]"
                      />

                      {/* Info & Direct Database Modifiers */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] uppercase font-mono text-[#73726B]">
                            {product.category}
                          </span>
                          {/* Live Stock Badge */}
                          {isOutOfStock ? (
                            <span className="px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[9px] uppercase font-bold tracking-wider">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[9px] uppercase font-semibold">
                              Low Stock ({product.stockInventoryCount} left)
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[9px] uppercase">
                              {product.stockInventoryCount} in Stock
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-sm text-[#141413] truncate font-medium">
                          {product.title}
                        </h3>

                        {/* Direct Stock & Price Adjustment Controls */}
                        <div className="mt-2.5 pt-2.5 border-t border-[#F0EEE6] flex flex-wrap items-center gap-3">
                          {/* Stock Counter Stepper */}
                          <div>
                            <span className="text-[9px] uppercase font-mono text-[#73726B] block mb-1">
                              Stock Units:
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                title="Decrease stock"
                                onClick={() =>
                                  updateProductStock(product.id, product.stockInventoryCount - 1)
                                }
                                className="w-11 h-11 min-w-[44px] min-h-[44px] border border-[#D1CEC7] bg-[#FAF9F6] hover:bg-[#E5E3DC] text-[#141413] flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <input
                                type="number"
                                min="0"
                                max="9999"
                                value={product.stockInventoryCount}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val)) updateProductStock(product.id, val);
                                }}
                                className={`w-14 h-11 min-h-[44px] text-center text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-[#141413] ${
                                  isOutOfStock
                                    ? 'border-rose-400 bg-rose-50 text-rose-800 font-bold'
                                    : 'border-[#D1CEC7] bg-white text-[#141413]'
                                }`}
                              />

                              <button
                                type="button"
                                title="Increase stock"
                                onClick={() =>
                                  updateProductStock(product.id, product.stockInventoryCount + 1)
                                }
                                className="w-11 h-11 min-w-[44px] min-h-[44px] border border-[#D1CEC7] bg-[#FAF9F6] hover:bg-[#E5E3DC] text-[#141413] flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Direct Price Adjuster */}
                          <div>
                            <span className="text-[9px] uppercase font-mono text-[#73726B] block mb-1">
                              Retail Price:
                            </span>
                            {isEditingPrice ? (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-mono">$</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={tempPriceValue}
                                  onChange={(e) => setTempPriceValue(e.target.value)}
                                  className="w-16 h-11 min-h-[44px] px-2 text-xs font-mono border border-[#141413] bg-white text-[#141413]"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(product.id)}
                                  className="px-3 h-11 min-h-[44px] bg-[#141413] text-white text-[11px] font-mono uppercase inline-flex items-center justify-center"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPriceId(product.id);
                                  setTempPriceValue(product.price.toString());
                                }}
                                title="Click to adjust price"
                                className="min-h-[44px] text-xs font-mono font-medium text-[#141413] px-3 py-2 border border-dashed border-[#D1CEC7] hover:border-[#141413] hover:bg-[#FAF9F6] transition-colors inline-flex items-center space-x-1"
                              >
                                <span>${product.price}</span>
                                <span className="text-[9px] text-[#73726B] font-light ml-1">Edit</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Quick Stock Shortcuts */}
                        <div className="mt-2 flex items-center space-x-3 text-[10px] font-mono text-[#73726B]">
                          <button
                            type="button"
                            onClick={() => updateProductStock(product.id, 0)}
                            className="min-h-[44px] inline-flex items-center py-2 px-1 hover:text-rose-700 underline underline-offset-2"
                          >
                            Set to 0 (Zero Out)
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateProductStock(product.id, product.stockInventoryCount + 10)
                            }
                            className="min-h-[44px] inline-flex items-center py-2 px-1 hover:text-[#141413] underline underline-offset-2"
                          >
                            +10 Units Restock
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ========================================================= */}
        {/* DISCOUNT & PROMO CODE MANAGEMENT SECTION                   */}
        {/* ========================================================= */}
        <section
          id="admin-promo-management-section"
          className="mt-10 bg-white border border-[#E5E3DC] p-4 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E5E3DC]">
            <div>
              <div className="flex items-center space-x-2">
                <Tag className="w-3.5 h-3.5 text-[#141413]" />
                <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#73726B]">
                  Client Incentives & Campaigns
                </span>
              </div>
              <h2 className="font-serif text-2xl text-[#141413] mt-1">
                Active Discounts & Promo Code Management
              </h2>
              <p className="text-xs text-[#5C5B54] font-light mt-1">
                Create new promotional discount codes, adjust values, and toggle active status across the storefront.
              </p>
            </div>

            <button
              id="admin-toggle-add-promo-btn"
              type="button"
              onClick={() => setShowAddPromoForm(!showAddPromoForm)}
              className="min-h-[44px] inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#141413] text-[#FAF9F6] text-xs font-mono uppercase tracking-wider font-medium hover:bg-[#2A2926] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddPromoForm ? 'Close Form' : 'Create Promo Code'}</span>
            </button>
          </div>

          {promoActionMessage && (
            <div className="my-4 p-3 bg-[#FAF9F6] border border-[#141413] text-xs font-mono text-[#141413] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{promoActionMessage}</span>
            </div>
          )}

          {/* New Promo Code Inline Form */}
          {showAddPromoForm && (
            <form
              id="admin-create-promo-form"
              onSubmit={handleCreatePromoCode}
              className="my-6 p-4 sm:p-6 bg-[#FAF9F6] border border-[#D1CEC7] animate-in fade-in duration-150 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DC]">
                <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#141413]">
                  Deploy New Promotional Code
                </h3>
                <span className="text-[10px] font-mono text-[#73726B]">All fields required *</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="admin-new-promo-code"
                    className="block text-[10px] uppercase font-mono tracking-wider text-[#44433E] mb-1.5 font-medium"
                  >
                    Code String *
                  </label>
                  <input
                    id="admin-new-promo-code"
                    type="text"
                    required
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. VIP20 or FALLSALE"
                    className="w-full min-h-[44px] px-3 py-2 text-xs font-mono uppercase bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-new-promo-type"
                    className="block text-[10px] uppercase font-mono tracking-wider text-[#44433E] mb-1.5 font-medium"
                  >
                    Discount Type *
                  </label>
                  <select
                    id="admin-new-promo-type"
                    value={newDiscountType}
                    onChange={(e) => setNewDiscountType(e.target.value as DiscountType)}
                    className="w-full min-h-[44px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="flat">Flat Dollar Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-new-promo-val"
                    className="block text-[10px] uppercase font-mono tracking-wider text-[#44433E] mb-1.5 font-medium"
                  >
                    Value {newDiscountType === 'percentage' ? '(%)' : '($)'} *
                  </label>
                  <input
                    id="admin-new-promo-val"
                    type="number"
                    min="1"
                    max={newDiscountType === 'percentage' ? '100' : '9999'}
                    required
                    value={newPromoValue}
                    onChange={(e) => setNewPromoValue(e.target.value)}
                    placeholder={newDiscountType === 'percentage' ? '15' : '50'}
                    className="w-full min-h-[44px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-new-promo-min"
                    className="block text-[10px] uppercase font-mono tracking-wider text-[#44433E] mb-1.5 font-medium"
                  >
                    Min Order Spend ($ Optional)
                  </label>
                  <input
                    id="admin-new-promo-min"
                    type="number"
                    min="0"
                    value={newPromoMinSpend}
                    onChange={(e) => setNewPromoMinSpend(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full min-h-[44px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="admin-new-promo-desc"
                    className="block text-[10px] uppercase font-mono tracking-wider text-[#44433E] mb-1.5 font-medium"
                  >
                    Campaign Description (Optional)
                  </label>
                  <input
                    id="admin-new-promo-desc"
                    type="text"
                    value={newPromoDescription}
                    onChange={(e) => setNewPromoDescription(e.target.value)}
                    placeholder="e.g. Autumn seasonal subscriber perk"
                    className="w-full min-h-[44px] px-3 py-2 text-xs font-sans bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4 sm:pt-0">
                  <label className="min-h-[44px] flex items-center space-x-2 cursor-pointer">
                    <input
                      id="admin-new-promo-active-check"
                      type="checkbox"
                      checked={newPromoActive}
                      onChange={(e) => setNewPromoActive(e.target.checked)}
                      className="w-4 h-4 rounded border-[#D1CEC7] text-[#141413] focus:ring-[#141413]"
                    />
                    <span className="text-xs font-mono text-[#141413]">Active Immediately</span>
                  </label>

                  <button
                    id="admin-submit-new-promo-btn"
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 bg-[#141413] text-[#FAF9F6] text-xs font-mono uppercase tracking-wider font-medium hover:bg-[#2A2926] transition-colors ml-auto inline-flex items-center justify-center"
                  >
                    Save & Deploy
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Promo Codes Collection Table */}
          <div className="mt-6 overflow-x-auto">
            <table id="admin-promo-codes-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E3DC] text-[10px] font-mono uppercase tracking-[0.2em] text-[#73726B]">
                  <th className="py-3 px-3">Code String</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Value</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6] text-xs font-mono">
                {promoCodes.map((promo) => (
                  <tr
                    key={promo.id}
                    id={`admin-promo-row-${promo.code}`}
                    className="hover:bg-[#FAF9F6] transition-colors"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-[#73726B]" />
                        <span className="font-semibold text-sm text-[#141413]">{promo.code}</span>
                      </div>
                      {promo.description && (
                        <p className="text-[10px] font-sans text-[#73726B] font-light mt-0.5">
                          {promo.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-3 uppercase text-[11px] text-[#5C5B54]">
                      {promo.discountType === 'percentage' ? 'Percentage' : 'Flat Credit'}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-[#141413]">
                      {promo.discountType === 'percentage' ? `${promo.value}% OFF` : `$${promo.value} OFF`}
                    </td>

                    <td className="py-3.5 px-3 text-[#73726B]">
                      {promo.minimumSpend ? `Orders over $${promo.minimumSpend}` : 'No minimum'}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        id={`promo-status-badge-${promo.code}`}
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-semibold ${
                          promo.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        }`}
                      >
                        {promo.isActive ? 'Active' : 'Turned Off'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          id={`toggle-promo-btn-${promo.code}`}
                          type="button"
                          onClick={() => togglePromoStatus(promo.id)}
                          className={`min-h-[44px] px-3.5 py-2 text-[10px] uppercase font-mono border transition-colors inline-flex items-center justify-center ${
                            promo.isActive
                              ? 'border-[#D1CEC7] text-[#5C5B54] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                              : 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {promo.isActive ? 'Turn Off' : 'Turn On'}
                        </button>

                        <button
                          id={`delete-promo-btn-${promo.code}`}
                          type="button"
                          onClick={() => deletePromoCode(promo.id)}
                          title="Delete promo code"
                          className="w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-[#8C8A82] hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* ORDER INSPECTION MODAL / MANIFEST DRAWER                   */}
      {/* ========================================================= */}
      {selectedOrderDetails && (
        <div
          id="order-details-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-[#FAF9F6] border border-[#E5E3DC] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#73726B] hover:text-[#141413] border border-[#E5E3DC] bg-white transition-colors"
              aria-label="Close manifest modal"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#73726B] block mb-1">
              Atelier Logistics Manifest
            </span>
            <h2 className="font-serif text-2xl text-[#141413] mb-1">
              Order {selectedOrderDetails.orderId}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-[#5C5B54] mb-6">
              <span>Date: {selectedOrderDetails.date}</span>
              <span>•</span>
              <span className="font-semibold text-[#141413]">
                Status: {selectedOrderDetails.status}
              </span>
            </div>

            {/* Quick Status Updater inside Manifest */}
            <div className="p-4 bg-white border border-[#E5E3DC] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#73726B] block">
                  Change Dispatch Status
                </span>
                <span className="text-xs text-[#141413]">
                  Current tag: <strong>{selectedOrderDetails.status}</strong>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(['Processing', 'Shipped', 'Delivered'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      handleStatusChange(selectedOrderDetails.orderId, st);
                      setSelectedOrderDetails((prev) => (prev ? { ...prev, status: st } : null));
                    }}
                    className={`min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center text-xs font-mono transition-all ${
                      selectedOrderDetails.status === st
                        ? 'bg-[#141413] text-white'
                        : 'border border-[#D1CEC7] bg-[#FAF9F6] text-[#44433E] hover:bg-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
              <div className="p-4 bg-white border border-[#E5E3DC]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#73726B] block mb-2">
                  Destination Address
                </span>
                <div className="font-medium text-[#141413]">
                  {selectedOrderDetails.shippingAddress.fullName}
                </div>
                <div className="text-[#5C5B54] font-light mt-1 leading-relaxed">
                  {selectedOrderDetails.shippingAddress.streetAddress}
                  {selectedOrderDetails.shippingAddress.apartment && (
                    <span>, {selectedOrderDetails.shippingAddress.apartment}</span>
                  )}
                  <br />
                  {selectedOrderDetails.shippingAddress.city},{' '}
                  {selectedOrderDetails.shippingAddress.stateProvince}{' '}
                  {selectedOrderDetails.shippingAddress.postalCode}
                  <br />
                  {selectedOrderDetails.shippingAddress.country}
                </div>
                <div className="mt-2 text-[#73726B] font-mono text-[11px]">
                  {selectedOrderDetails.shippingAddress.email}
                </div>
              </div>

              <div className="p-4 bg-white border border-[#E5E3DC]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#73726B] block mb-2">
                  Logistics Serialization
                </span>
                <div className="font-mono text-xs text-[#141413] font-semibold mb-1">
                  {selectedOrderDetails.trackingNumber}
                </div>
                <div className="text-[#5C5B54] text-[11px] leading-relaxed">
                  Carrier: Atelier White-Glove Courier
                  <br />
                  Method: {selectedOrderDetails.shippingAddress.deliveryMethod.toUpperCase()}
                  <br />
                  Est. Delivery: {selectedOrderDetails.estimatedDelivery}
                </div>
                <div className="mt-2 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 inline-block">
                  Payment: {selectedOrderDetails.paymentDetails?.brand} •••• {selectedOrderDetails.paymentDetails?.last4} (Auth OK)
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#73726B] block mb-2">
                Order Items Manifest
              </span>
              <div className="border border-[#E5E3DC] divide-y divide-[#E5E3DC] bg-white">
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={it.product.imageUrl}
                        alt={it.product.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-12 object-cover border border-[#E5E3DC]"
                      />
                      <div>
                        <div className="font-medium text-[#141413]">{it.product.title}</div>
                        <div className="text-[10px] text-[#73726B] font-mono">
                          Category: {it.product.category} • Qty: {it.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-[#141413] font-semibold">
                      ${(it.product.price * it.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="p-4 bg-white border border-[#E5E3DC] text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-[#73726B]">
                <span>Subtotal:</span>
                <span>${selectedOrderDetails.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#73726B]">
                <span>Shipping:</span>
                <span>${selectedOrderDetails.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#73726B]">
                <span>Tax:</span>
                <span>${selectedOrderDetails.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#141413] font-bold text-sm pt-2 border-t border-[#E5E3DC]">
                <span>Total Amount:</span>
                <span>${selectedOrderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD NEW GARMENT MODAL                                     */}
      {/* ========================================================= */}
      {showAddProductModal && (
        <div
          id="add-garment-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-[#FAF9F6] border border-[#E5E3DC] w-full max-w-lg p-4 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#73726B] hover:text-[#141413] border border-[#E5E3DC] bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#73726B] block mb-1">
              Catalog Management // Ingestion
            </span>
            <h2 className="font-serif text-2xl text-[#141413] mb-4">
              Add Garment to Collection
            </h2>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono text-[#73726B] mb-1">
                  Garment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belgian Linen Overshirt"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-[#73726B] mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className="w-full min-h-[44px] p-2.5 bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  >
                    <option value="Outerwear">Outerwear</option>
                    <option value="Knitwear">Knitwear</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-[#73726B] mb-1">
                    Colorway
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Washed Olive"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full min-h-[44px] p-2.5 bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-[#73726B] mb-1">
                    Retail Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="280"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full min-h-[44px] p-2.5 bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-[#73726B] mb-1">
                    Initial Stock Count *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="10"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full min-h-[44px] p-2.5 bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#73726B] mb-1">
                  Fabric & Materials
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Organic Giza Cotton (240 gsm)"
                  value={newMaterials}
                  onChange={(e) => setNewMaterials(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#73726B] mb-1">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed tailoring notes and silhouette characteristics..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#73726B] mb-1">
                  Image URL (Unsplash or CDN)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 bg-white border border-[#D1CEC7] text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="min-h-[44px] px-4 py-2.5 border border-[#D1CEC7] text-[#5C5B54] hover:text-[#141413] hover:bg-[#F0EEE6] inline-flex items-center justify-center transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 bg-[#141413] text-[#FAF9F6] uppercase tracking-[0.16em] font-medium hover:bg-[#2A2926] inline-flex items-center justify-center transition-colors"
                >
                  Publish Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
