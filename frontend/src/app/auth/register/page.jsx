'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Mail, Phone, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, register, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect.startsWith('/') ? redirect : `/${redirect}`);
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMessage('');

    if (!name || !email || !mobile || !password || !confirmPassword) {
      setErrMessage('All fields are mandatory');
      return;
    }

    if (mobile.length !== 10 || isNaN(mobile)) {
      setErrMessage('Mobile number must be exactly 10 digits');
      return;
    }

    if (password.length < 6) {
      setErrMessage('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, mobile, password, confirmPassword);
    } catch (err) {
      setErrMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        
        {/* Decorative Tag */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-saffron/5 dark:bg-brand-saffron/10 rounded-bl-full flex items-center justify-center pl-6 pb-6">
          <Sparkles className="text-brand-saffron" size={20} />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold font-serif text-slate-800 dark:text-slate-100">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join Khodal Saree and start shopping
          </p>
        </div>

        {errMessage && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>{errMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="pl-10 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@domain.com"
                  className="pl-10 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone size={18} />
                </span>
                <input
                  id="mobile"
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="pl-10 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-brand-saffron hover:bg-brand-saffron-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-saffron disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? 'Creating Profile...' : 'Register Account'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-brand-teal hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
