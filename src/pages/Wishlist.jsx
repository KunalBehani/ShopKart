import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import WishlistCard from '../components/WishlistCard';
import { 
  Heart, 
  ShoppingBag, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';

const Wishlist = () => {
  const { wishlist, wishlistCount, loading, error, fetchWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2 border border-rose-200/60">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Saved Items</span>
          </div>
          <h1 id="wishlist-heading" className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep track of products you like and purchase them whenever you are ready.
          </p>
        </div>

        {!loading && !error && wishlistCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              <span className="font-bold text-slate-900">{wishlistCount}</span> {wishlistCount === 1 ? 'product' : 'products'} saved
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

      {/* 1. Loading State */}
      {loading && (
        <div id="wishlist-loading-state" className="space-y-6 py-6 animate-pulse">
          <div className="flex items-center justify-center gap-3 text-slate-500 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span className="text-base font-semibold text-slate-700">Loading your wishlist...</span>
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden space-y-4 p-4">
                <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-8 bg-slate-200 rounded-xl w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Error State */}
      {!loading && error && (
        <div 
          id="wishlist-error-state"
          className="p-8 sm:p-12 text-center bg-rose-50/60 rounded-3xl border border-rose-200/80 max-w-lg mx-auto space-y-4 my-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-900">Something went wrong.</h3>
            <p className="text-xs text-rose-700/80 mt-1">
              We couldn't load your wishlist. {error}
            </p>
          </div>
          <button
            id="wishlist-retry-btn"
            onClick={fetchWishlist}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!loading && !error && wishlistCount === 0 && (
        <div 
          id="wishlist-empty-state"
          className="p-10 sm:p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-xl mx-auto space-y-5 my-8 shadow-xs"
        >
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner border border-rose-100">
            <Heart className="w-10 h-10 text-rose-500 fill-rose-100" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Save products you love and find them here later.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/products"
              id="browse-products-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Success State: Wishlist Grid */}
      {!loading && !error && wishlistCount > 0 && (
        <div 
          id="wishlist-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {wishlist.map((product) => (
            <WishlistCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Wishlist;
