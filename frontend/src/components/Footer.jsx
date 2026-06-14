import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Badges bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="flex items-center space-x-4 justify-center md:justify-start">
          <div className="p-3 bg-slate-800 rounded-full text-brand-saffron">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-white">Express Delivery</h4>
            <p className="text-xs text-slate-400">Fast shipping to all deliverable Indian pincodes</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 justify-center md:justify-start">
          <div className="p-3 bg-slate-800 rounded-full text-brand-gold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-white">100% Secure Checkout</h4>
            <p className="text-xs text-slate-400">Integrated with Razorpay - UPI, Cards, Netbanking</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 justify-center md:justify-start">
          <div className="p-3 bg-slate-800 rounded-full text-brand-teal-light">
            <RefreshCw size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-white">Quality Guarantee</h4>
            <p className="text-xs text-slate-400">Premium fabric inspects before dispatch</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand and Description */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold font-serif text-white">
              Khodal
            </span>
            <span className="text-xs uppercase bg-brand-gold text-brand-teal-dark px-1.5 py-0.5 rounded font-bold tracking-wider font-sans">
              Saree
            </span>
          </Link>
          <p className="text-sm text-slate-400">
            India's ultimate fashion hub for elegant traditional wear, designer sarees, trendy kurtis, heavy lehengas, and children's collections.
          </p>
        </div>

        {/* Categories Link */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/shop?category=Saree" className="hover:text-brand-gold">Saree Collection</Link></li>
            <li><Link href="/shop?category=Kurti" className="hover:text-brand-gold">Designer Kurtis</Link></li>
            <li><Link href="/shop?category=Salwar+Suit" className="hover:text-brand-gold">Salwar Suits</Link></li>
            <li><Link href="/shop?category=Lehenga" className="hover:text-brand-gold">Bridal Lehengas</Link></li>
            <li><Link href="/shop?category=Western+Dress" className="hover:text-brand-gold">Western Dresses</Link></li>
          </ul>
        </div>

        {/* Customer Help */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Information</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/dashboard?tab=orders" className="hover:text-brand-gold">Track Order</Link></li>
            <li><span className="text-slate-400">Return Policy</span></li>
            <li><span className="text-slate-400">Terms of Service</span></li>
            <li><span className="text-slate-400">Privacy Policy</span></li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
          <div className="flex items-center space-x-3 text-sm text-slate-400">
            <Phone size={16} className="text-brand-saffron" />
            <span>+91 91234 56789</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-400">
            <Mail size={16} className="text-brand-teal-light" />
            <span>support@khodalsaree.com</span>
          </div>
          <div className="flex items-start space-x-3 text-sm text-slate-400">
            <MapPin size={16} className="text-brand-gold mt-1" />
            <span>Khodal Tower, Phase 2, Bandra Kurla Complex, Mumbai, MH - 400051</span>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="bg-slate-950 py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Khodal Saree. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px] text-slate-400">BHIM UPI</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px] text-slate-400">GPay</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px] text-slate-400">PhonePe</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px] text-slate-400">Cards</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px] text-slate-400">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
