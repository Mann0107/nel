'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Star, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { api } from '../../utils/api';

const CATEGORIES = ['All', 'Saree', 'Kurti', 'Salwar Suit', 'Lehenga', 'Western Dress', 'Party Wear', 'Men\'s Wear', 'Kids Wear'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const RATINGS = [4, 3, 2, 1];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search/Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [size, setSize] = useState(searchParams.get('size') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state with url params if they change
  useEffect(() => {
    setCategory(searchParams.get('category') || 'All');
    setKeyword(searchParams.get('keyword') || '');
  }, [searchParams]);

  // Fetch products when query filters change
  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        let query = `/products?pageNumber=${page}&pageSize=9`;
        
        if (keyword) query += `&keyword=${encodeURIComponent(keyword)}`;
        if (category && category !== 'All') query += `&category=${encodeURIComponent(category)}`;
        if (size) query += `&size=${size}`;
        if (minPrice) query += `&minPrice=${minPrice}`;
        if (maxPrice) query += `&maxPrice=${maxPrice}`;
        if (rating) query += `&rating=${rating}`;
        if (sort) query += `&sort=${sort}`;

        const data = await api.get(query);
        setProducts(data.products || []);
        setPages(data.pages || 1);
        setCount(data.count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [keyword, category, size, minPrice, maxPrice, rating, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // reset to page 1
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('All');
    setSize('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('newest');
    setPage(1);
    router.push('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner/Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-800 dark:text-slate-100">Shop Dresses</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Showing {products.length} of {count} products</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full flex">
          <input
            type="text"
            placeholder="Search products, brands, saree..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar Toggle (Mobile) */}
        <div className="flex lg:hidden justify-between items-center mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 text-sm"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
          
          <button
            onClick={handleResetFilters}
            className="text-slate-500 hover:text-red-500 flex items-center space-x-1 text-xs"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>

        {/* Sidebar Filter Panel (Desktop & Mobile drawer) */}
        <div
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block w-full lg:w-64 flex-shrink-0 space-y-6 bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-fit`}
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-750">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2 text-sm uppercase tracking-wider">
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-slate-400 hover:text-red-500 text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Clear All</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-3">Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`block w-full text-left text-sm py-1 transition-colors ${
                    category === cat
                      ? 'text-brand-teal font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-brand-teal'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-3">Filter by Size</h4>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => { setSize(size === sz ? '' : sz); setPage(1); }}
                  className={`w-9 h-9 text-xs rounded-lg font-bold border transition-all ${
                    size === sz
                      ? 'bg-brand-teal border-brand-teal text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-3">Price Range (₹)</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Ratings */}
          <div>
            <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              {RATINGS.map((rat) => (
                <button
                  key={rat}
                  onClick={() => { setRating(rating === rat.toString() ? '' : rat.toString()); setPage(1); }}
                  className={`flex items-center space-x-2 text-sm w-full py-1 text-left ${
                    rating === rat.toString() ? 'text-brand-teal font-semibold' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex text-amber-400">
                    {Array(rat).fill(0).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                    {Array(5 - rat).fill(0).map((_, i) => (
                      <Star key={i} size={14} />
                    ))}
                  </span>
                  <span>& Up</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid & Sorting */}
        <div className="flex-grow space-y-6">
          {/* Sorting controls */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Sort Products By</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col space-y-4">
                  <div className="bg-slate-200 dark:bg-slate-800 aspect-[3/4] rounded-2xl" />
                  <div className="bg-slate-200 dark:bg-slate-800 h-4 w-3/4 rounded" />
                  <div className="bg-slate-200 dark:bg-slate-800 h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-750">
              <SlidersHorizontal size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Products Found</h3>
              <p className="text-sm text-slate-400 mt-1">Try resetting the filters or modifying your search.</p>
              <button
                onClick={handleResetFilters}
                className="mt-6 bg-brand-teal text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg font-bold text-sm border transition-all ${
                    page === p
                      ? 'bg-brand-teal border-brand-teal text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-400 bg-white'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    }>
      <ShopContent />
    </React.Suspense>
  );
}
