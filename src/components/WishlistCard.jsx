import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Trash2, Package, Loader2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const WishlistCard = ({ product }) => {
  const { _id, name, price, category, image, stock } = product;
  const { removeFromWishlist, isSaving } = useWishlist();

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const saving = isSaving(_id);

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromWishlist(_id);
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

        {/* Stock Badge overlay */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white backdrop-blur-md shadow-xs">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
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

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Price</span>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight text-indigo-600">
              {formattedPrice}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              to={`/products/${_id}`}
              id={`wishlist-view-details-${_id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <button
              id={`wishlist-remove-btn-${_id}`}
              onClick={handleRemove}
              disabled={saving}
              title="Remove from Wishlist"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
