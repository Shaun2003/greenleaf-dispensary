import { useState } from 'react';
import { Download, ShoppingBag, Eye, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { Order } from '../types';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
}

export default function AdminOrders({ orders, onUpdateOrderStatus }: AdminOrdersProps) {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered'];

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'All') return true;
    return o.status === filterStatus;
  });

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Order ID,Customer Name,Customer Email,Date,Delivery Option,Total,Status,Promo Code,Shipping Address\r\n';
    
    orders.forEach((o) => {
      const formattedDate = new Date(o.date).toISOString().replace(/T/, ' ').replace(/\..+/, '');
      const cleanAddress = o.address.replace(/,/g, ' ');
      csvContent += `${o.id},"${o.customerName}","${o.customerEmail}","${formattedDate}","${o.deliveryOption}",${o.total},"${o.status}","${o.promoApplied || 'None'}","${cleanAddress}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `greenleaf_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans selection:bg-brand-green selection:text-white">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-brand-dark text-base">Client Orders Logbook</h3>
          <p className="text-xs text-brand-muted-green font-mono">Process shipments, verify transactions, and review billing</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter selection */}
          <div className="flex items-center gap-1.5 bg-brand-bg border border-brand-border rounded-lg px-2.5 py-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-brand-muted-green" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-brand-dark focus:outline-none cursor-pointer font-sans"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="Processing">Processing Only</option>
              <option value="Shipped">Shipped Only</option>
              <option value="Delivered">Delivered Only</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold rounded-lg font-sans flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT ALL CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main list - Mobile Cards and Desktop Table */}
        <div className="lg:col-span-2">
          
          {/* Mobile Logbook View */}
          <div className="block md:hidden space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="glass-light p-8 text-center text-brand-muted-green font-mono text-xs">
                No records match the requested filter.
              </div>
            ) : (
              filteredOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className={`glass-light p-4 rounded-2xl space-y-3 shadow-xs cursor-pointer text-brand-dark transition-all ${
                    selectedOrder?.id === o.id ? 'border-brand-green bg-brand-tag/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono font-bold text-brand-dark text-xs">{o.id}</p>
                      <p className="text-[10px] text-brand-muted-green font-mono">
                        {new Date(o.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase ${
                      o.status === 'Pending'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : o.status === 'Processing'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : o.status === 'Shipped'
                        ? 'bg-teal-50 text-teal-600 border border-teal-100'
                        : 'bg-emerald-50 text-brand-green border border-brand-border'
                    }`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-y border-brand-bg text-xs">
                    <div>
                      <p className="font-semibold text-brand-dark truncate max-w-[150px]">{o.customerName}</p>
                      <p className="text-[10px] text-brand-muted-green font-mono truncate max-w-[150px]">{o.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase inline-block ${
                        o.deliveryOption === 'delivery'
                          ? 'bg-purple-50 text-purple-600 border border-purple-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {o.deliveryOption}
                      </span>
                      <p className="font-mono font-bold text-brand-dark text-xs mt-1">R{o.total}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-brand-muted-green font-mono">
                      {o.items.length} items purchased
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                      }}
                      className="px-3 py-1 bg-brand-bg hover:bg-brand-tag text-brand-dark border border-brand-border rounded-lg text-[10px] font-sans flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3 h-3" /> View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block glass-light rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-bg border-b border-brand-border text-brand-dark font-mono uppercase">
                    <th className="p-4">Order ID / Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Delivery Option</th>
                    <th className="p-4">Total Bill</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-bg">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-brand-muted-green font-mono text-xs">
                        No records match the requested filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr
                        key={o.id}
                        className={`hover:bg-brand-bg/35 transition-colors ${
                          selectedOrder?.id === o.id ? 'bg-brand-tag/50' : ''
                        }`}
                      >
                        <td className="p-4 font-mono whitespace-nowrap">
                          <p className="font-bold text-brand-dark">{o.id}</p>
                          <p className="text-[10px] text-brand-muted-green">
                            {new Date(o.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-brand-dark truncate max-w-[120px]">{o.customerName}</p>
                          <p className="text-[10px] text-brand-muted-green font-mono truncate max-w-[120px]">{o.customerEmail}</p>
                        </td>
                        <td className="p-4 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                            o.deliveryOption === 'delivery'
                              ? 'bg-purple-50 text-purple-600 border border-purple-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {o.deliveryOption}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-brand-dark whitespace-nowrap">R{o.total}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase whitespace-nowrap ${
                            o.status === 'Pending'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : o.status === 'Processing'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : o.status === 'Shipped'
                              ? 'bg-teal-50 text-teal-600 border border-teal-100'
                              : 'bg-emerald-50 text-brand-green border border-brand-border'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 rounded-lg bg-brand-bg hover:bg-brand-tag border border-brand-border text-brand-muted-green hover:text-brand-dark transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Detailed panel on selection */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            /* Fixed Full Overlay on Mobile, Classic Sidebar Card on Desktop */
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-xs lg:relative lg:inset-auto lg:z-auto lg:p-0 lg:bg-transparent lg:backdrop-blur-none">
              
              {/* Backdrop closer on mobile */}
              <div className="absolute inset-0 lg:hidden cursor-pointer" onClick={() => setSelectedOrder(null)} />

              <div className="glass-light p-5 space-y-6 shadow-2xl lg:shadow-sm text-brand-dark w-full max-w-lg lg:max-w-none max-h-[90vh] overflow-y-auto relative z-10 animate-slide-up">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-brand-dark text-xs uppercase tracking-wider font-mono">
                      Order Details
                    </h4>
                    <p className="text-sm font-extrabold text-brand-green font-mono mt-0.5">
                      {selectedOrder.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs text-brand-muted-green hover:text-brand-dark font-mono font-medium cursor-pointer px-2.5 py-1 bg-brand-bg rounded-lg border border-brand-border hover:bg-brand-tag transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Status Update flow */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono block">
                    Update Processing Status
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {statuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          onUpdateOrderStatus(selectedOrder.id, st);
                          setSelectedOrder({ ...selectedOrder, status: st });
                        }}
                        className={`py-1.5 px-2 text-center rounded-lg text-[10px] font-semibold font-mono border transition-all cursor-pointer ${
                          selectedOrder.status === st
                            ? 'bg-brand-green text-white border-brand-green font-bold shadow-xs'
                            : 'bg-brand-bg border-brand-border text-brand-muted-green hover:text-brand-dark hover:border-brand-muted-green'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shipping info */}
                <div className="space-y-3 pt-3 border-t border-brand-bg text-xs">
                  <div>
                    <p className="text-[10px] text-brand-muted-green font-mono uppercase">Delivery Target</p>
                    <p className="text-brand-dark mt-0.5 leading-relaxed font-semibold">
                      {selectedOrder.customerName}
                    </p>
                    <p className="text-brand-muted-green font-mono">{selectedOrder.customerEmail}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-brand-muted-green font-mono uppercase">Shipping Address</p>
                    <p className="text-brand-dark mt-0.5 leading-relaxed font-sans bg-brand-bg p-2.5 rounded-xl border border-brand-border">
                      {selectedOrder.address}
                    </p>
                  </div>

                  {selectedOrder.promoApplied && (
                    <div>
                      <p className="text-[10px] text-brand-muted-green font-mono uppercase">Promo Coupon Applied</p>
                      <p className="text-brand-green mt-0.5 leading-none font-bold font-mono">
                        {selectedOrder.promoApplied}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items Summary list */}
                <div className="space-y-3 pt-3 border-t border-brand-bg">
                  <p className="text-[10px] text-brand-muted-green font-mono uppercase">Cart items</p>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {selectedOrder.items.map((it) => (
                      <div key={it.product.id} className="flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-green font-mono">{it.quantity}x</span>
                          <span className="text-brand-dark truncate max-w-[120px]">{it.product.name}</span>
                        </div>
                        <span className="font-mono text-brand-muted-green">R{it.product.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-brand-bg pt-2.5 font-mono text-xs font-bold text-brand-dark">
                    <span>Grand Total:</span>
                    <span className="text-brand-green">R{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-light p-8 text-center text-brand-muted-green text-xs font-mono shadow-xs">
              <ShoppingBag className="w-8 h-8 text-brand-border mx-auto mb-2" />
              Select an order from the spreadsheet log to view customer shipping directions, items purchased, and handle courier status updates.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
