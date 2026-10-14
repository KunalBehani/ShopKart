import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Tag, 
  Package, 
  Heart, 
  Loader2, 
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { _id, name, price, category, image, stock } = product;
  const { isInWishlist, isSaving, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToCart, getItemQuantity, isSaving: isCartSaving } = useCart();
  const navigate = useNavigate();

  const [feedbackError, setFeedbackError] = useState(null);
  const [cartFeedback, setCartFeedback] = useState(null);

  const isSaved = isInWishlist(_id);
  const saving = isSaving(_id);
  const cartSaving = isCartSaving(_id);
  const cartQty = getItemQuantity(_id);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const atMaxStock = cartQty >= stock;

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous error
    setFeedbackError(null);

    // If unauthenticated, redirect to login page
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (saving) return;

    if (isSaved) {
      const res = await removeFromWishlist(_id);
      if (!res.success) {
        setFeedbackError(res.message);
        setTimeout(() => setFeedbackError(null), 3500);
      }
    } else {
      const res = await addToWishlist(product);
      if (!res.success) {
        setFeedbackError(res.message);
        setTimeout(() => setFeedbackError(null), 3500);
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setFeedbackError(null);
    setCartFeedback(null);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartSaving || isOutOfStock) return;

    const res = await addToCart(product, 1);
    if (!res.success) {
      setFeedbackError(res.message);
      setTimeout(() => setFeedbackError(null), 3500);
      return;
    }
    setCartFeedback('Added to cart');
    setTimeout(() => setCartFeedback(null), 2000);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Badge overlay */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-xs border border-white/60">
          <Tag className="w-3 h-3 text-indigo-500" />
          {category}
        </span>

        {/* Floating Heart Quick-Action Button */}
        <button
          id={`wishlist-icon-btn-${_id}`}
          onClick={handleWishlistClick}
          disabled={saving}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          title={isSaved ? "In Wishlist (click to remove)" : "Add to Wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer z-10 ${
            isSaved
              ? 'bg-rose-500 text-white shadow-rose-500/30'
              : 'bg-white/85 text-slate-600 hover:text-rose-500 hover:bg-white'
          } ${saving ? 'opacity-80 cursor-wait' : 'active:scale-90'}`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin text-current" />
          ) : (
            <Heart className={`w-4 h-4 transition-transform ${isSaved ? 'fill-white stroke-white scale-110' : ''}`} />
          )}
        </button>

        {/* Stock Badge overlay */}
        {isOutOfStock ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white backdrop-blur-md shadow-xs">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
            Only {stock} left
          </span>
        ) : null}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            {isOutOfStock ? (
              <span className="text-rose-600 font-semibold">Out of stock</span>
            ) : (
              <span className="text-slate-600">{stock} units left in stock</span>
            )}
          </p>
        </div>

        {/* Error notification banner if API fails */}
        {(feedbackError || cartFeedback) && (
          <div className={`p-2 rounded-lg text-xs flex items-center gap-1.5 animate-fade-in ${
            feedbackError
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{feedbackError || cartFeedback}</span>
          </div>
        )}

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Price</span>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight text-indigo-600">
              {formattedPrice}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Details Button */}
            <Link
              to={`/products/${_id}`}
              id={`view-details-${_id}`}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Wishlist Button with 3 Interaction States (Default, Saving, Added) */}
            <button
              id={`wishlist-btn-${_id}`}
              onClick={handleWishlistClick}
              disabled={saving}
              title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer disabled:cursor-wait ${
                isSaved
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-rose-600 border border-slate-200/80'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                  <span>Saving...</span>
                </>
              ) : isSaved ? (
                <>
                  <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5" />
                  <span>Wishlist</span>
                </>
              )}
            </button>
          </div>

          <button
            id={`add-to-cart-btn-${_id}`}
            onClick={handleAddToCart}
            disabled={cartSaving || isOutOfStock || atMaxStock}
            title={
              isOutOfStock
                ? 'Out of stock'
                : atMaxStock
                  ? `Only ${stock} in stock`
                  : 'Add to cart'
            }
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cartSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>
                  {isOutOfStock
                    ? 'Out of Stock'
                    : atMaxStock
                      ? 'Max stock in cart'
                      : cartQty > 0
                        ? `Add another (${cartQty} in cart)`
                        : 'Add to Cart'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
