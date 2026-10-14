import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart, getCartProductId, getLineSubtotal } from '../context/CartContext';
import {
  ShoppingBag,
  ShoppingCart,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  Package,
  Receipt
} from 'lucide-react';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);

const Cart = () => {
  const {
    cart,
    cartCount,
    subtotal,
    loading,
    error,
    fetchCart,
    updateQuantity,
    removeFromCart,
    isSaving
  } = useCart();

  const [actionError, setActionError] = useState(null);

  const showActionError = (message) => {
    setActionError(message);
    setTimeout(() => setActionError(null), 3500);
  };

  const handleDecrease = async (item) => {
    const productId = getCartProductId(item);
    if (item.quantity <= 1) return;
    const res = await updateQuantity(productId, item.quantity - 1);
    if (!res.success) showActionError(res.message);
  };

  const handleIncrease = async (item) => {
    const productId = getCartProductId(item);
    const stock = item.product?.stock ?? 0;
    if (item.quantity >= stock) {
      showActionError(`Cannot add more than available stock (${stock})`);
      return;
    }
    const res = await updateQuantity(productId, item.quantity + 1);
    if (!res.success) showActionError(res.message);
  };

  const handleRemove = async (item) => {
    const productId = getCartProductId(item);
    const res = await removeFromCart(productId);
    if (!res.success) showActionError(res.message);
  };

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 border border-indigo-200/60">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Shopping Cart</span>
          </div>
          <h1 id="cart-heading" className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quantities are stored per product. Subtotal is always calculated as price × quantity.
          </p>
        </div>

        {!loading && !error && cartCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              <span id="cart-item-count" className="font-bold text-slate-900">{cartCount}</span>{' '}
              {cartCount === 1 ? 'item' : 'items'}
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {actionError && (
        <div
          id="cart-action-error"
          className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading && (
        <div id="cart-loading-state" className="space-y-6 py-6 animate-pulse">
          <div className="flex items-center justify-center gap-3 text-slate-500 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-base font-semibold text-slate-700">Loading your cart...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div
          id="cart-error-state"
          className="p-8 sm:p-12 text-center bg-rose-50/60 rounded-3xl border border-rose-200/80 max-w-lg mx-auto space-y-4 my-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-900">Something went wrong.</h3>
            <p className="text-xs text-rose-700/80 mt-1">
              We couldn't load your cart. {error}
            </p>
          </div>
          <button
            id="cart-retry-btn"
            onClick={fetchCart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {!loading && !error && cart.length === 0 && (
        <div
          id="cart-empty-state"
          className="p-10 sm:p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-xl mx-auto space-y-5 my-8 shadow-xs"
        >
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto shadow-inner border border-indigo-100">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Your cart is empty
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Add products from the catalogue. The same item will increase quantity instead of creating duplicate rows.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/products"
              id="cart-browse-products-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && cart.length > 0 && (
        <div id="cart-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const product = item.product || {};
              const productId = getCartProductId(item);
              const stock = product.stock ?? 0;
              const saving = isSaving(productId);
              const atMaxStock = item.quantity >= stock;
              const lineTotal = getLineSubtotal(item);

              return (
                <div
                  key={productId}
                  id={`cart-item-${productId}`}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                >
                  <Link to={`/products/${productId}`} className="shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full sm:w-28 h-36 sm:h-28 rounded-xl object-cover bg-slate-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/products/${productId}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1"
                        >
                          {product.name || 'Product'}
                        </Link>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" />
                          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                        </p>
                        <p className="text-sm font-extrabold text-indigo-600 mt-2">
                          {formatINR(product.price)}
                        </p>
                      </div>
                      <button
                        id={`cart-remove-${productId}`}
                        onClick={() => handleRemove(item)}
                        disabled={saving}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 cursor-pointer disabled:opacity-50"
                        title="Remove from cart"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button
                          id={`cart-qty-decrease-${productId}`}
                          onClick={() => handleDecrease(item)}
                          disabled={saving || item.quantity <= 1}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          id={`cart-qty-${productId}`}
                          className="w-10 text-center font-bold text-sm text-slate-900"
                        >
                          {item.quantity}
                        </span>
                        <button
                          id={`cart-qty-increase-${productId}`}
                          onClick={() => handleIncrease(item)}
                          disabled={saving || atMaxStock}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer"
                          title={atMaxStock ? `Only ${stock} in stock` : 'Increase quantity'}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Line total</p>
                        <p id={`cart-line-total-${productId}`} className="text-sm font-extrabold text-slate-900">
                          {formatINR(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="lg:col-span-4">
            <div
              id="cart-order-summary"
              className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 p-6 space-y-4 sticky top-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Order Summary</h2>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Items</span>
                  <span id="summary-item-count" className="font-semibold text-slate-900">{cartCount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span id="cart-subtotal" className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping</span>
                  <span id="cart-shipping" className="font-semibold text-slate-900">
                    {shipping === 0 ? 'Free' : formatINR(shipping)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Total</span>
                <span id="cart-total" className="text-xl font-black text-indigo-600">{formatINR(total)}</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Subtotal is derived on the client from live product prices × quantities. It is not stored in MongoDB.
              </p>

              <Link
                id="cart-checkout-btn"
                to="/checkout"
                className="w-full py-3 rounded-xl text-white font-bold text-sm gradient-brand shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
