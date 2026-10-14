import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart, getLineSubtotal } from '../context/CartContext';
import { createPaymentOrderApi, verifyPaymentApi } from '../services/api';
import {
  ShoppingBag,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  MapPin,
  Receipt,
  CheckCircle2
} from 'lucide-react';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);

const INITIAL_FORM = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: ''
};

// Load Razorpay checkout.js script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, setCart } = useCart();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      e.phone = 'Phone must be a valid 10-digit number';
    }
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode.trim()) {
      e.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      e.pincode = 'Pincode must contain exactly 6 digits';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ─── Place Order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setApiError(null);
    setPaymentError(null);

    // Client-side validation first — do not hit backend if invalid
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (cart.length === 0) {
      setApiError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setApiError('Failed to load payment gateway. Please check your connection and try again.');
        setSubmitting(false);
        return;
      }

      // Step 2: Create ShopKart + Razorpay order on backend
      const data = await createPaymentOrderApi(form);

      if (!data.success) {
        setApiError(data.message || 'Failed to create order. Please try again.');
        setSubmitting(false);
        return;
      }

      // Step 3: Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          // Step 4: Send payment details to backend for HMAC verification
          try {
            const verifyData = await verifyPaymentApi({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyData.success) {
              // Step 5: Clear global cart state (backend already cleared DB cart)
              setCart([]);
              // Step 6: Navigate to success page
              navigate(`/order-success/${data.shopKartOrderId}`);
            } else {
              setPaymentError(verifyData.message || 'Payment verification failed. Please contact support.');
            }
          } catch (err) {
            const msg = err.response?.data?.message || 'Payment verification failed. Please try again.';
            setPaymentError(msg);
          }
        },

        prefill: {
          name: form.fullName,
          contact: form.phone
        },

        theme: {
          color: '#4f46e5'
        },

        modal: {
          ondismiss: () => {
            setSubmitting(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setPaymentError(
          `Payment failed: ${response.error?.description || 'Unknown error'}. Your cart has not been cleared.`
        );
        setSubmitting(false);
      });

      paymentObject.open();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setApiError(msg);
      setSubmitting(false);
    }
  };

  // ─── UI ────────────────────────────────────────────────────────────────────
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
        <Link
          to="/cart"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1.5 border border-indigo-200/60">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Checkout</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        </div>
      </div>

      {/* Error alerts */}
      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}
      {paymentError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Payment failed</p>
            <p className="mt-1">{paymentError}</p>
            <p className="mt-1 text-xs">Your cart has not been cleared. Please try again.</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Shipping Form ── */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Shipping Details</h2>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Aarav Sharma"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    errors.fullName
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-400'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    errors.phone
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-400'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  placeholder="22 MG Road, Apartment 4B"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    errors.addressLine1
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-400'
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* City + State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Bengaluru"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                      errors.city
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-200 bg-slate-50 focus:border-indigo-400'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Karnataka"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                      errors.state
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-200 bg-slate-50 focus:border-indigo-400'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="560001"
                  maxLength={6}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    errors.pincode
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-400'
                  }`}
                />
                {errors.pincode && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.pincode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <aside className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/40 p-6 space-y-4 sticky top-24">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Order Summary</h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-500">Your cart is empty.</p>
                  <Link
                    to="/products"
                    className="inline-block text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cart.map((item) => {
                      const product = item.product || {};
                      const productId =
                        product._id ? product._id.toString() : item.product?.toString();
                      return (
                        <div key={productId} className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900 shrink-0">
                            {formatINR(getLineSubtotal(item))}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Items ({totalItems})</span>
                      <span className="font-semibold">{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-black text-slate-900 pt-1">
                      <span>Total</span>
                      <span className="text-indigo-600">{formatINR(subtotal)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Final amount is calculated and verified on the server.
                    </p>
                  </div>
                </>
              )}

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm gradient-brand shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Secured by Razorpay · Test Mode
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
