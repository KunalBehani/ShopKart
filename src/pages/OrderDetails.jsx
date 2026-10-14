import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderByIdApi } from '../services/api';
import {
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ClipboardList,
  CheckCircle2,
  Truck,
  ShoppingBag
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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const statusSteps = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const statusColors = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700 border-amber-200',
  PLACED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  SHIPPED: 'bg-violet-100 text-violet-700 border-violet-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

const paymentColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700'
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderByIdApi(id);
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || 'Order not found.');
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load order details.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold text-slate-700">Loading order details…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-rose-900">Order not found</h3>
          <p className="text-xs text-rose-700/80 mt-1">{error}</p>
        </div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-brand shadow-md active:scale-95 transition-all"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Back to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const statusClass = statusColors[order.status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const payClass = paymentColors[order.paymentStatus] || 'bg-slate-100 text-slate-700';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
        <Link
          to="/orders"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1.5 border border-indigo-200/60">
            <Package className="w-3.5 h-3.5" />
            <span>Order Details</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Order Status</h2>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {statusSteps.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                          isCompleted
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-slate-200 text-slate-400'
                        } ${isCurrent ? 'ring-2 ring-indigo-300 ring-offset-1' : ''}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span
                        className={`text-[9px] mt-1 font-semibold text-center ${
                          isCompleted ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      >
                        {step.replace('_', ' ')}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mb-5 min-w-4 ${
                          i < currentStepIndex ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Items Ordered</h2>
            </div>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatINR(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 shrink-0">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-800">Order Total</span>
              <span className="text-lg font-black text-indigo-600">
                {formatINR(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Payment</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${payClass}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Order Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusClass}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Payment ID
                  </p>
                  <p className="font-mono text-xs text-slate-600 break-all">
                    {order.razorpayPaymentId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Delivery Address</h2>
              </div>
              <address className="not-italic text-sm text-slate-600 space-y-0.5">
                <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                  {order.shippingAddress.pincode}
                </p>
              </address>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
