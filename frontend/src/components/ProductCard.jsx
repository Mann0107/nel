'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);

  const isWishlisted = wishlist.products?.some((p) => p._id === product._id || p === product._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to manage your wishlist');
      return;
    }
    setAddingWishlist(true);
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingWishlist(false);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to shop');
      return;
    }
    if (product.stock === 0) return;
    setAdding(true);
    try {
      // Default to M size for quick add, or check if size available
      const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
      await addToCart(product._id, defaultSize, 1);
      alert('Product added to cart!');
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all duration-300 hover-scale">
      {/* Product Image & Tags */}
      <Link href={`/product/${product._id}`} className="relative block aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Image
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 bg-brand-saffron text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Stock warning */}
        {product.stock === 0 ? (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full tracking-wider shadow">
              Out Of Stock
            </span>
          </div>
        ) : product.stock <= 3 ? (
          <span className="absolute bottom-3 left-3 bg-brand-gold text-brand-teal-dark text-[10px] font-bold px-2 py-0.5 rounded shadow">
            Only {product.stock} Left!
          </span>
        ) : null}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={addingWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm hover:scale-110 transition-transform ${
            isWishlisted
              ? 'bg-rose-550 text-white bg-rose-600'
              : 'bg-white/90 text-slate-500 dark:bg-slate-800/90 dark:text-slate-400 hover:text-rose-600'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'scale-110' : ''} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Name */}
          <Link href={`/product/${product._id}`}>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base line-clamp-1 hover:text-brand-teal transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1 mt-1.5 mb-2">
            <div className="flex text-amber-400">
              <Star size={14} fill="currentColor" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {product.averageRating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-[10px] text-slate-400">({product.numReviews || 0})</span>
          </div>
        </div>

        <div>
          {/* Price & Cart button */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base sm:text-lg font-bold text-brand-teal dark:text-brand-teal-light">
                  ₹{product.finalPrice}
                </span>
                {product.discountPercentage > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {product.stock > 0 && (
              <button
                onClick={handleQuickAdd}
                disabled={adding}
                className="p-2 bg-slate-50 dark:bg-slate-700 hover:bg-brand-teal hover:text-white dark:hover:bg-brand-teal text-brand-teal dark:text-brand-teal-light rounded-lg transition-all focus:outline-none"
                aria-label="Quick Add to Cart"
              >
                <ShoppingCart size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
