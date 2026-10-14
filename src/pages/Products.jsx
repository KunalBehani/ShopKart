import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { 
  ShoppingBag, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  PackageOpen,
  FilterX
} from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter state from URL search params if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state to URL search params
  useEffect(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category.trim()) params.category = category.trim();
    if (sort) params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [search, category, sort, setSearchParams]);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim() && category.toLowerCase() !== 'all') {
        params.category = category.trim();
      }
      if (sort) params.sort = sort;

      const data = await getProductsApi(params);
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError('Something went wrong while loading products.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  // Debounced fetch on search or immediate on category/sort change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 border border-indigo-200/60">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Product Discovery</span>
          </div>
          <h1 id="products-heading" className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Catalogue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our wide selection of hand-picked electronics, fashion, books, and home essentials.
          </p>
        </div>

        {!loading && !error && (
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full self-start sm:self-auto border border-slate-200">
            Showing <span className="font-bold text-slate-800">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
          </div>
        )}
      </div>

      {/* Search, Filter & Sort Bar */}
      <SearchBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        onReset={handleResetFilters}
      />

      {/* CONTENT AREA: 3 Core States */}

      {/* 1. Loading State */}
      {loading && (
        <div id="products-loading-state" className="space-y-6 py-6 animate-pulse">
          <div className="flex items-center justify-center gap-3 text-slate-500 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Loading products...</span>
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
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
          id="products-error-state"
          className="p-8 sm:p-12 text-center bg-rose-50/60 rounded-3xl border border-rose-200/80 max-w-lg mx-auto space-y-4 my-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-900">Something went wrong while loading products.</h3>
            <p className="text-xs text-rose-700/80 mt-1">
              Could not communicate with the product catalogue API. Please ensure the backend is running.
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!loading && !error && products.length === 0 && (
        <div 
          id="products-empty-state"
          className="p-10 sm:p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-xl mx-auto space-y-4 my-8"
        >
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PackageOpen className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">No products found.</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {search || category 
                ? `No products match your current filters "${search || category}". Try adjusting or resetting them.`
                : 'The product catalogue is currently empty.'}
            </p>
          </div>
          {(search || category || sort) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <FilterX className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Success State: Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div 
          id="products-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Products;
