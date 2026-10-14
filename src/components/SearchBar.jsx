import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

const SearchBar = ({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  onReset
}) => {
  const isFiltered = search.trim() !== '' || (category !== '' && category.toLowerCase() !== 'all') || sort !== '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="product-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name... (e.g. keyboard, headphones)"
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown (Mobile & Alternative) */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <select
              id="category-dropdown"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-2.5 text-sm font-medium bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === 'All' ? '' : cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              id="sort-dropdown"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-3.5 pr-8 py-2.5 text-sm font-medium bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer transition-colors"
            >
              <option value="">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar (Quick Filter) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Quick Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = (cat === 'All' && !category) || category.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchBar;
