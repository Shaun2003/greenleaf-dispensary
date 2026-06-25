import React, { useState } from 'react';
import { TrendingUp, ShoppingBag, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { Product, Order } from '../types';

interface AdminOverviewProps {
  products: Product[];
  orders: Order[];
  onRestockProduct: (productId: string, amount: number) => void;
  promoCodes: { code: string; discount: number }[];
  onAddPromo: (code: string, discount: number) => void;
  onRemovePromo: (code: string) => void;
  homepageBanner: string;
  onUpdateBanner: (text: string) => void;
}

export default function AdminOverview({
  products,
  orders,
  onRestockProduct,
  promoCodes,
  onAddPromo,
  onRemovePromo,
  homepageBanner,
  onUpdateBanner,
}: AdminOverviewProps) {
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('10');
  const [bannerInput, setBannerInput] = useState(homepageBanner);
  const [bannerSuccess, setBannerSuccess] = useState(false);

  // Compute stats
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  // Format revenue daily trend using active order data
  const dailyRevMap: { [key: string]: number } = {};
  orders.forEach((o) => {
    const d = new Date(o.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dailyRevMap[d] = (dailyRevMap[d] || 0) + o.total;
  });

  // Guarantee at least some data for the chart
  const dates = Object.keys(dailyRevMap).slice(-7);
  if (dates.length === 0) {
    dates.push('Jun 18', 'Jun 20', 'Jun 22', 'Jun 23');
    dailyRevMap['Jun 18'] = 112;
    dailyRevMap['Jun 20'] = 0;
    dailyRevMap['Jun 22'] = 83;
    dailyRevMap['Jun 23'] = 50;
  }
  const maxRev = Math.max(...dates.map((d) => dailyRevMap[d] || 0), 100);

  const handleUpdateBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBanner(bannerInput);
    setBannerSuccess(true);
    setTimeout(() => setBannerSuccess(false), 2000);
  };

  const handleAddPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    onAddPromo(newPromoCode.toUpperCase().trim(), Number(newPromoDiscount));
    setNewPromoCode('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans selection:bg-brand-green selection:text-white px-2 sm:px-0">
      {/* Overview Stat Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Stat 1 */}
        <div className="glass-light rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-brand-muted-green font-medium">Total Store Revenue</span>
            <div className="p-1.5 rounded-lg bg-brand-tag border border-brand-border text-brand-green">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif font-bold text-brand-dark text-lg sm:text-xl lg:text-2xl">R{totalSales.toLocaleString()}</p>
            <p className="text-[9px] sm:text-[10px] text-brand-muted-green font-mono mt-0.5">Live aggregated billing</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-light rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-brand-muted-green font-medium">Total Orders Placed</span>
            <div className="p-1.5 rounded-lg bg-brand-tag border border-brand-border text-brand-green">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif font-bold text-brand-dark text-lg sm:text-xl lg:text-2xl">{totalOrdersCount}</p>
            <p className="text-[9px] sm:text-[10px] text-brand-muted-green font-mono mt-0.5">Guest & registered checkout</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-light rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-brand-muted-green font-medium">Pending Delivery/Pickup</span>
            <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-brand-gold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif font-bold text-brand-dark text-lg sm:text-xl lg:text-2xl">{pendingOrdersCount}</p>
            <p className="text-[9px] sm:text-[10px] text-brand-muted-green font-mono mt-0.5">Needs status update</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-light rounded-2xl p-4 sm:p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-brand-muted-green font-medium">Inventory Stock Alerts</span>
            <div className={`p-1.5 rounded-lg border text-xs ${
              lowStockProducts.length > 0
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                : 'bg-brand-tag border-brand-border text-brand-green'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif font-bold text-brand-dark text-lg sm:text-xl lg:text-2xl">{lowStockProducts.length}</p>
            <p className="text-[9px] sm:text-[10px] text-brand-muted-green font-mono mt-0.5">Products with stock &lt;= 5</p>
          </div>
        </div>

      </div>

      {/* Analytics Chart & Low Stock Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass-light rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-serif font-bold text-brand-dark text-xs sm:text-sm">7-Day Revenue Trend</h3>
            <span className="text-[9px] sm:text-[10px] text-brand-green font-mono font-semibold">Dynamic Chart Engine</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="relative h-48 sm:h-64 w-full flex items-end justify-between pt-4 sm:pt-6 px-2 sm:px-4">
            <div className="absolute inset-x-0 bottom-0 border-b border-brand-border" />
            {dates.map((date) => {
              const amount = dailyRevMap[date] || 0;
              const heightPercent = maxRev > 0 ? (amount / maxRev) * 80 : 0;
              return (
                <div key={date} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-1 transition-opacity bg-brand-green text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg">
                    R{amount.toFixed(2)}
                  </div>
                  {/* Visual Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-5 sm:w-8 bg-brand-green/85 group-hover:bg-brand-green rounded-t transition-all duration-500 shadow-inner"
                  />
                  <span className="text-[9px] text-brand-muted-green font-mono mt-2">{date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Alert list and Quick Replenish */}
        <div className="lg:col-span-1 glass-light rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-serif font-bold text-brand-dark text-sm">Low Stock Alerts</h3>
            <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 font-mono px-2 py-0.5 rounded uppercase font-bold">
              Action Required
            </span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-12 text-xs text-brand-muted-green font-mono">
                ✓ All inventory items well-stocked!
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-between gap-2 text-brand-dark">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-brand-dark truncate pr-2">{p.name}</h4>
                    <p className="text-[10px] text-brand-muted-green font-mono mt-0.5">Current Stock: <span className="text-rose-600 font-bold">{p.stock}</span></p>
                  </div>
                  
                  <button
                    onClick={() => onRestockProduct(p.id, 20)}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" /> RESTOCK +20
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Promotion Codes & Homepage Banner CMS side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Promo Code Management */}
        <div className="glass-light rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-serif font-bold text-brand-dark text-xs sm:text-sm">Discount Coupons & Promos</h3>
            <span className="text-[8px] sm:text-[10px] text-brand-green font-mono font-semibold">Cart integration</span>
          </div>

          <form onSubmit={handleAddPromoSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="PROMOCODE"
              value={newPromoCode}
              onChange={(e) => setNewPromoCode(e.target.value)}
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-xs text-brand-dark focus:border-brand-green focus:outline-none placeholder:text-brand-muted-green/60 font-mono uppercase tracking-wider"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newPromoDiscount}
                onChange={(e) => setNewPromoDiscount(e.target.value)}
                className="flex-1 px-2 py-2 bg-brand-bg border border-brand-border rounded-lg text-xs text-brand-dark focus:border-brand-green focus:outline-none font-mono cursor-pointer"
              >
                <option value="10">10% Off</option>
                <option value="15">15% Off</option>
                <option value="20">20% Off</option>
                <option value="25">25% Off</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold rounded-lg transition-all font-mono tracking-wide cursor-pointer"
              >
                CREATE
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
            {promoCodes.map((promo) => (
              <div key={promo.code} className="p-2.5 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-between text-brand-dark">
                <div>
                  <span className="text-xs font-bold font-mono text-brand-green tracking-wider bg-brand-tag px-1.5 py-0.5 border border-brand-border rounded">
                    {promo.code}
                  </span>
                  <span className="text-[10px] text-brand-green font-mono font-bold ml-2">-{promo.discount}%</span>
                </div>
                <button
                  onClick={() => onRemovePromo(promo.code)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-mono font-medium cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Homepage CMS Banner Manager */}
        <div className="glass-light rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-serif font-bold text-brand-dark text-sm">Storefront CMS Banner</h3>
            <span className="text-[10px] text-brand-green font-mono font-semibold">Dynamic update</span>
          </div>

          <p className="text-xs text-brand-muted-green leading-normal">
            Update the banner text displayed at the top of the Customer Homepage hero section to highlight daily dispensaries, community guidelines, or seasonal sales.
          </p>

          <form onSubmit={handleUpdateBannerSubmit} className="space-y-3">
            <textarea
              value={bannerInput}
              onChange={(e) => setBannerInput(e.target.value)}
              maxLength={150}
              rows={2}
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-xs text-brand-dark focus:border-brand-green focus:outline-none resize-none font-sans"
            />
            <div className="flex items-center justify-between">
              {bannerSuccess ? (
                <span className="text-xs text-brand-green font-mono flex items-center gap-1">
                  ✓ Updated homepage banner!
                </span>
              ) : (
                <span className="text-[10px] text-brand-muted-green font-mono">Max 150 characters</span>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold rounded-lg transition-all font-sans cursor-pointer"
              >
                PUBLISH CHANGE
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
