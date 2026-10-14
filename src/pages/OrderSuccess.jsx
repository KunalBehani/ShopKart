import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderByIdApi } from '../services/api';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ClipboardList,
  Loader2,
  AlertCircle
} from 'lucide-react';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await getOrderByIdApi(orderId);
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || 'Could not load order details.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="text-sm font-semibold">Loading order details…</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 space-y-8 animate-fade-in text-center">
      {/* Success icon */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner border border-emerald-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : order ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 text-left space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Order ID</span>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                {order._id}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Total</span>
              <span className="font-extrabold text-indigo-600 text-base">
                {formatINR(order.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Payment</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-700'
                    : order.paymentStatus === 'FAILED'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                {order.status}
              </span>
            </div>
          </div>

          {/* Items summary */}
          {order.items && order.items.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Items Ordered
              </p>
              <div className="space-y-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">
                      {item.name} <span className="text-slate-400">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 pt-1">
            Your order has been saved and can be viewed in My Orders.
          </p>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white gradient-brand shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <ClipboardList className="w-4 h-4" />
          View My Orders
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
