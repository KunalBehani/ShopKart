import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductByIdApi } from '../services/api';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Package, 
  Tag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Minus,
  Sparkles,
  Share2,
  Heart
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWishlist, isSaving, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToCart, isSaving: isCartSaving, getItemQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCartToast, setAddedToCartToast] = useState(false);
  const [cartError, setCartError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductByIdApi(id);
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        const msg = err.response?.data?.message || 'Something went wrong while loading product details.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setCartError(null);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isCartSaving(product._id) || product.stock <= 0) return;

    const res = await addToCart(product, quantity);
    if (!res.success) {
      setCartError(res.message);
      setTimeout(() => setCartError(null), 3500);
      return;
    }

    setAddedToCartToast(true);
    setQuantity(1);
    setTimeout(() => {
      setAddedToCartToast(false);
    }, 2500);
  };

  // Format price
  const formattedPrice = product
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(product.price)
    : '';

  const isOutOfStock = product?.stock <= 0;
  const cartQty = product ? getItemQuantity(product._id) : 0;
  const remainingStock = product ? Math.max(0, product.stock - cartQty) : 0;
  const cartBusy = product ? isCartSaving(product._id) : false;

  useEffect(() => {
    if (remainingStock > 0 && quantity > remainingStock) {
      setQuantity(remainingStock);
    }
  }, [remainingStock, quantity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Back to Products Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          to="/products"
          id="back-to-products-btn"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Products</span>
        </Link>

        {product && (
          <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Link to="/home" className="hover:text-slate-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-slate-600">Products</Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold truncate max-w-[200px]">{product.name}</span>
          </nav>
        )}
      </div>

      {/* 1. Loading State */}
      {loading && (
        <div id="product-details-loading" className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-600">Loading product details...</p>
        </div>
      )}

      {/* 2. Error State */}
      {!loading && error && (
        <div 
          id="product-details-error"
          className="p-8 sm:p-12 text-center bg-rose-50 rounded-3xl border border-rose-200 max-w-lg mx-auto space-y-4 my-12"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-900">{error}</h3>
            <p className="text-xs text-rose-700/80 mt-1">
              The product you are looking for might have been removed or does not exist.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-brand shadow-md hover:opacity-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Catalogue</span>
          </Link>
        </div>
      )}

      {/* 3. Product Details Layout */}
      {!loading && !error && product && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md shadow-slate-200/50">
          
          {/* Left Column: Large Product Image Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shadow-xs">
              <img
                src={product.image}
                alt={product.name}
                id="product-detail-image"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
                }}
              />

              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-indigo-700 shadow-md border border-white/60">
                <Tag className="w-3.5 h-3.5" />
                {product.category}
              </span>
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <Truck className="w-4 h-4 text-indigo-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800">Free Delivery</p>
                <p className="text-[10px] text-slate-500">Orders over ₹999</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800">100% Genuine</p>
                <p className="text-[10px] text-slate-500">Direct from brands</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <RotateCcw className="w-4 h-4 text-violet-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800">7-Day Return</p>
                <p className="text-[10px] text-slate-500">No questions asked</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Information & Purchase Panel */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  {product.category}
                </span>
                <h1 id="product-detail-name" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-slate-100">
                <span id="product-detail-price" className="text-3xl font-black text-slate-900 text-indigo-600">
                  {formattedPrice}
                </span>
                <span className="text-xs text-slate-500 font-medium">Inclusive of all taxes</span>
              </div>

              {/* Stock Status Badge */}
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                {isOutOfStock ? (
                  <span id="product-detail-stock" className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Out of Stock
                  </span>
                ) : (
                  <span id="product-detail-stock" className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock ({product.stock} units available)
                  </span>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-2 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Description</h2>
                <p id="product-detail-description" className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="pt-3 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Quantity
                  </label>
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(remainingStock || 1, quantity + 1))}
                      disabled={quantity >= remainingStock}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              
              {cartError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{cartError}</span>
                </div>
              )}

              {/* Success Toast */}
              {addedToCartToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Item added to cart!</span>
                </div>
              )}

              {/* Action Buttons: Add to Cart & Wishlist */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  id="add-to-cart-button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || cartBusy || remainingStock <= 0}
                  className="flex-1 w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {cartBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  <span>
                    {isOutOfStock
                      ? 'Item Currently Unavailable'
                      : remainingStock <= 0
                        ? 'Max stock already in cart'
                        : cartQty > 0
                          ? `Add ${quantity} more`
                          : 'Add to Cart'}
                  </span>
                </button>

                <button
                  id="detail-wishlist-button"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    if (isSaving(product._id)) return;
                    if (isInWishlist(product._id)) {
                      await removeFromWishlist(product._id);
                    } else {
                      await addToWishlist(product);
                    }
                  }}
                  disabled={isSaving(product._id)}
                  title={isInWishlist(product._id) ? "Remove from Wishlist" : "Save to Wishlist"}
                  className={`w-full sm:w-auto py-3.5 px-5 rounded-2xl font-bold text-sm border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                    isInWishlist(product._id)
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 border-slate-200 shadow-xs'
                  }`}
                >
                  {isSaving(product._id) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      <span>Saving...</span>
                    </>
                  ) : isInWishlist(product._id) ? (
                    <>
                      <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                      <span>In Wishlist</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Add to Wishlist</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ProductDetails;
