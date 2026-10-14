import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ClipboardList
} from 'lucide-react';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

const statusColors = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  PLACED: 'bg-indigo-100 text-indigo-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700'
};

const paymentColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700'
};

// ─── Reusable Order Card ────────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const statusClass = statusColors[order.status] || 'bg-slate-100 text-slate-700';
  const payClass = paymentColors[order.paymentStatus] || 'bg-slate-100 text-slate-700';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-mono text-slate-500">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusClass}`}>
            {order.status.replace('_', ' ')}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${payClass}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-slate-700 line-clamp-1 flex-1">
              {item.name}
              <span className="text-slate-400 ml-1">× {item.quantity}</span>
            </span>
            <span className="font-semibold text-slate-900 shrink-0 ml-2">
              {formatINR(item.price * item.quantity)}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-slate-400">+{order.items.length - 3} more item(s)</p>
        )}
      </div>

      {/* Total + action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total</p>
          <p className="text-base font-extrabold text-indigo-600">{formatINR(order.totalAmount)}</p>
        </div>
        <Link
          to={`/orders/${order._id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
        >
          View Details
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
