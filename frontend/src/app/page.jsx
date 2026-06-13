'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, TrendingUp, Flame, CalendarDays } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const catData = await api.get('/products/categories');
        setCategories(catData);
        
        const prodData = await api.get('/products?pageSize=8');
        setProducts(prodData.products || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Slider */}
      <HeroBanner />

      {/* Categories Grid/Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-brand-teal font-bold text-xs uppercase tracking-widest">Shop by</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-800 dark:text-slate-100">
              Product Categories
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-800 h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-brand-teal transition-all duration-300 shadow-sm text-center"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden mb-2 bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-brand-teal">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Promo banner section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-brand-teal-dark to-slate-900 text-white p-8 md:p-12 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="bg-brand-gold text-brand-teal-dark text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
              Limited Festive Special
            </span>
            <h3 className="text-2xl sm:text-4xl font-bold font-serif text-brand-gold">
              Grand Indian Festival Collection
            </h3>
            <p className="text-sm text-slate-300 font-light">
              Experience the magic of traditional handlooms. Get a complimentary gift on checkout for orders above ₹5000.
            </p>
          </div>
          <Link
            href="/shop"
            className="bg-brand-saffron hover:bg-brand-saffron-dark text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>Explore Festival Wear</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Trending & Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center space-x-2">
            <Flame className="text-brand-saffron" size={24} />
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-800 dark:text-slate-100">
              Trending Dresses
            </h2>
          </div>
          <Link href="/shop" className="text-brand-teal hover:underline text-sm font-semibold flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col space-y-4">
                <div className="bg-slate-200 dark:bg-slate-800 aspect-[3/4] rounded-2xl" />
                <div className="bg-slate-200 dark:bg-slate-800 h-4 w-3/4 rounded" />
                <div className="bg-slate-200 dark:bg-slate-800 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-brand-gold" size={24} />
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-800 dark:text-slate-100">
              New Arrivals
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col space-y-4">
                <div className="bg-slate-200 dark:bg-slate-800 aspect-[3/4] rounded-2xl" />
                <div className="bg-slate-200 dark:bg-slate-800 h-4 w-3/4 rounded" />
                <div className="bg-slate-200 dark:bg-slate-800 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(4, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Mini banner cards (Women's, Men's, Kids Collections) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative h-64 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800"
            alt="Women's Collection"
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-1">
            <span className="text-xs text-brand-gold uppercase font-bold tracking-widest">Handcrafted Weaves</span>
            <h4 className="text-xl font-bold font-serif">Women's Collection</h4>
            <Link href="/shop?category=Saree" className="text-xs text-slate-200 hover:text-white underline">Shop Now</Link>
          </div>
        </div>

        <div className="relative h-64 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"
            alt="Men's Collection"
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-1">
            <span className="text-xs text-brand-gold uppercase font-bold tracking-widest">Heritage Sets</span>
            <h4 className="text-xl font-bold font-serif">Men's Collection</h4>
            <Link href="/shop?category=Men%27s+Wear" className="text-xs text-slate-200 hover:text-white underline">Shop Now</Link>
          </div>
        </div>

        <div className="relative h-64 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800"
            alt="Kids Collection"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-1">
            <span className="text-xs text-brand-gold uppercase font-bold tracking-widest">Ethnic Playwear</span>
            <h4 className="text-xl font-bold font-serif">Kids Collection</h4>
            <Link href="/shop?category=Kids+Wear" className="text-xs text-slate-200 hover:text-white underline">Shop Now</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
