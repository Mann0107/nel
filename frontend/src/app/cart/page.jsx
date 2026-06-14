'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const {
    cart,
    subtotal,
    gst,
    shippingCharge,
    grandTotal,
    updateCartItem,
    removeFromCart,
    clearCart,
    loading,
  } = useCart();

  const handleQtyChange = async (productId, size, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    try {
      await updateCartItem(productId, size, newQty);
    } catch (err) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId, size) => {
    try {
      await removeFromCart(productId, size);
    } catch (err) {
      alert(err.message || 'Failed to remove item');
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-serif text-slate-800 dark:text-slate-100 mb-8">Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-250 p-8">
          <ShoppingBag size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-6" />
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Your Cart is Empty</h2>
          <p className="text-sm text-slate-400 mt-2">Looks like you haven't added any dresses to your cart yet.</p>
          <Link
            href="/shop"
            className="mt-8 bg-brand-teal text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow hover:bg-brand-teal-dark inline-flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <span>Start Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-150 dark:border-slate-800">
              <span className="text-sm text-slate-400 font-semibold uppercase tracking-wider">{cart.items.length} Items</span>
              <button
                onClick={clearCart}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center space-x-1"
              >
                <Trash2 size={14} />
                <span>Empty Cart</span>
              </button>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => {
                const prod = item.product;
                if (!prod) return null;

                return (
                  <div
                    key={`${item._id}-${item.size}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm space-y-4 sm:space-y-0"
                  >
                    {/* Product info */}
                    <div className="flex space-x-4">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <Image
                          src={prod.images && prod.images.length > 0 ? prod.images[0] : ''}
                          alt={prod.name}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <div>
                        <Link href={`/product/${prod._id}`}>
                          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 hover:text-brand-teal transition-colors">
                            {prod.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">Brand: {prod.brand}</p>
                        <p className="text-xs text-slate-400">Size: <span className="font-bold text-brand-teal">{item.size}</span></p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">₹{prod.finalPrice}</p>
                      </div>
                    </div>

                    {/* Quantity Selector and Subtotal */}
                    <div className="flex items-center justify-between w-full sm:w-auto space-x-6 sm:space-x-12 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                        <button
                          onClick={() => handleQtyChange(prod._id, item.size, item.quantity, -1)}
                          disabled={loading}
                          className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 font-semibold text-xs text-slate-800 dark:text-slate-100">{item.quantity}</span>
                        <button
                          onClick={() => handleQtyChange(prod._id, item.size, item.quantity, 1)}
                          disabled={loading || item.quantity >= prod.stock}
                          className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-sm font-bold text-brand-teal dark:text-brand-teal-light">
                          ₹{prod.finalPrice * item.quantity}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(prod._id, item.size)}
                        disabled={loading}
                        className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing calculations details sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b pb-3 border-slate-100 dark:border-slate-700">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm text-slate-650 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-150">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GST (18%)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-150">₹{gst}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Shipping</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-150">₹{shippingCharge}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-slate-850 dark:text-slate-100">Grand Total</span>
                  <span className="text-2xl font-extrabold text-brand-teal dark:text-brand-teal-light">₹{grandTotal}</span>
                </div>
              </div>

              {user ? (
                <Link
                  href="/checkout"
                  className="w-full block py-4 text-center bg-brand-saffron hover:bg-brand-saffron-dark text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all hover:scale-[1.01]"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <Link
                  href="/auth/login?redirect=checkout"
                  className="w-full block py-4 text-center bg-brand-saffron hover:bg-brand-saffron-dark text-white rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all hover:scale-[1.01]"
                >
                  Login to Checkout & Buy
                </Link>
              )}
            </div>

            {/* Trust Badges */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border flex items-center space-x-3 text-xs text-slate-500">
              <ShieldCheck size={20} className="text-brand-teal flex-shrink-0" />
              <span>By clicking Proceed, you agree to our Terms of Sale and Razorpay payment policies.</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
