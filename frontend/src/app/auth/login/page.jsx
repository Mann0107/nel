'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../utils/api';

export default function Login() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !password) {
      setErrMessage('Please enter all fields');
      return;
    }
    setLoading(true);
    setErrMessage('');
    try {
      await login(loginId, password);
    } catch (err) {
      setErrMessage(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotErr('Please enter your email');
      return;
    }
    setForgotLoading(true);
    setForgotErr('');
    setForgotMsg('');
    try {
      const data = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(`OTP sent successfully! Debug OTP is ${data.debugOtp}`);
      setForgotStep(2);
    } catch (err) {
      setForgotErr(err.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmNewPassword) {
      setForgotErr('All fields are required');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotErr('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    setForgotErr('');
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp,
        password: newPassword,
        confirmPassword: confirmNewPassword,
      });
      alert('Password reset successful. Please login with your new password.');
      setForgotModalOpen(false);
      setForgotStep(1);
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setForgotErr(err.message || 'OTP verification failed');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-teal/5 dark:bg-brand-teal/10 rounded-bl-full flex items-center justify-center pl-6 pb-6">
          <Sparkles className="text-brand-gold" size={20} />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold font-serif text-slate-800 dark:text-slate-100">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Welcome back to Neel India
          </p>
        </div>

        {errMessage && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>{errMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Login ID */}
            <div>
              <label htmlFor="loginId" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Email Address or Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  id="loginId"
                  name="loginId"
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="name@email.com or 10-digit mobile"
                  className="pl-10 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-bold text-brand-teal hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-sm"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-brand-teal hover:bg-brand-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? 'Verifying Credentials...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-bold text-brand-saffron hover:underline">
              Register Now
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-slate-100 dark:border-slate-700 shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-slate-100">
              Reset Password
            </h3>

            {forgotErr && (
              <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{forgotErr}</span>
              </div>
            )}
            {forgotMsg && (
              <div className="p-3 text-xs rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-semibold">
                {forgotMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-xs text-slate-500">
                  Enter your email address and we'll generate a mock 6-digit OTP code to reset your password.
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-3 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 rounded-xl text-sm bg-brand-teal text-white hover:bg-brand-teal-dark disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Get OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm tracking-widest text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-2 rounded-xl text-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 rounded-xl text-sm bg-brand-saffron text-white hover:bg-brand-saffron-dark disabled:opacity-50"
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
