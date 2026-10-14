import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersApi } from '../services/api';
import OrderCard from '../components/OrderCard';
import {
  ClipboardList,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyOrdersApi();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to load orders.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 border border-indigo-200/60">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Order History</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">View all your past and current orders.</p>
        </div>
        {!loading && !error && orders.length > 0 && (
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
            <span className="font-bold text-slate-900">{orders.length}</span>{' '}
            {orders.length === 1 ? 'order' : 'orders'}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div id="orders-loading-state" className="flex items-center justify-center gap-3 text-slate-500 py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-base font-semibold text-slate-700">Loading your orders…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          id="orders-error-state"
          className="p-8 sm:p-12 text-center bg-rose-50/60 rounded-3xl border border-rose-200/80 max-w-lg mx-auto space-y-4 my-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-900">Something went wrong.</h3>
            <p className="text-xs text-rose-700/80 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div
          id="orders-empty-state"
          className="p-10 sm:p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-xl mx-auto space-y-5 my-8 shadow-xs"
        >
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto shadow-inner border border-indigo-100">
            <ClipboardList className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              No orders yet
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              You have not placed any orders yet. Start shopping and your orders will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/products"
              id="orders-start-shopping-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && orders.length > 0 && (
        <div id="orders-list" className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
