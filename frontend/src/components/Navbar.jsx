'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Heart, User, Menu, X, ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cart, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartItemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistItemsCount = wishlist.products?.length || 0;

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-teal to-brand-saffron bg-clip-text text-transparent font-serif">
                Neel
              </span>
              <span className="text-xs uppercase bg-brand-gold text-brand-teal-dark px-1.5 py-0.5 rounded font-bold tracking-wider font-sans">
                India
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors duration-200 py-2 ${
                isActive('/') 
                  ? 'text-brand-teal font-semibold border-b-2 border-brand-teal' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-teal'
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`transition-colors duration-200 py-2 ${
                isActive('/shop') 
                  ? 'text-brand-teal font-semibold border-b-2 border-brand-teal' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-teal'
              }`}
            >
              Shop Collection
            </Link>
            <Link
              href="/#categories"
              className="text-slate-600 dark:text-slate-300 hover:text-brand-teal py-2 transition-colors duration-200"
            >
              Categories
            </Link>
          </div>

          {/* Actions (Cart, Wishlist, DarkMode, Profile) */}
          <div className="hidden md:flex items-center space-x-6">
            <DarkModeToggle />

            {/* Wishlist */}
            <Link href="/dashboard?tab=wishlist" className="relative text-slate-600 dark:text-slate-300 hover:text-brand-saffron transition-colors">
              <Heart size={22} />
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-saffron text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistItemsCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-slate-600 dark:text-slate-300 hover:text-brand-teal transition-colors">
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-teal text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 focus:outline-none py-2 text-slate-700 dark:text-slate-200 hover:text-brand-teal font-medium"
                >
                  <User size={20} className="text-brand-teal" />
                  <span className="text-sm max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-100 dark:border-slate-700">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <User size={16} className="mr-2 text-slate-400" />
                      My Dashboard
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-brand-teal font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <ShieldAlert size={16} className="mr-2 text-brand-teal" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut size={16} className="mr-2 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-brand-teal text-white hover:bg-brand-teal-dark px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <DarkModeToggle />
            
            <Link href="/cart" className="relative text-slate-600 dark:text-slate-300">
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-teal text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-slate-100 dark:border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-base">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${
                isActive('/') ? 'bg-brand-teal/10 text-brand-teal font-semibold' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${
                isActive('/shop') ? 'bg-brand-teal/10 text-brand-teal font-semibold' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Shop Collection
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-slate-700 dark:text-slate-200"
                >
                  My Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-brand-teal font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-center bg-brand-teal text-white font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
