'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ShieldCheck, Truck, Calendar, FileText } from 'lucide-react';
import { api } from '../../../utils/api';
import TrackingProgressBar from '../../../components/TrackingProgressBar';

export default function OrderTracking({ params }) {
  const orderId = params.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(localStorage.getItem('adminInfo'));
      const token = userInfo?.token;
      
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Invoice file download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${order.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.message || 'Failed to download PDF invoice');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-slate-500">{error || 'Order not found'}</p>
        <Link href="/dashboard" className="inline-flex items-center space-x-2 text-brand-teal hover:underline text-sm font-semibold">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Back button */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard?tab=orders" className="inline-flex items-center space-x-2 text-slate-500 hover:text-brand-teal text-sm font-semibold">
          <ArrowLeft size={16} />
          <span>Back to My Orders</span>
        </Link>
        
        <button
          onClick={handleDownloadInvoice}
          className="inline-flex items-center space-x-2 bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl text-xs font-semibold shadow"
        >
          <Download size={14} />
          <span>Download Invoice</span>
        </button>
      </div>

      {/* Main Order Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
        
        {/* Title Details info */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 dark:border-slate-700 gap-4">
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-850 dark:text-slate-100">Order #{order.invoiceNumber}</h1>
            <p className="text-xs text-slate-400 mt-1">Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="bg-brand-teal/15 text-brand-teal font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              {order.status}
            </span>
          </div>
        </div>

        {/* Live status timeline progress */}
        <div className="py-4 border-b border-slate-50 dark:border-slate-700/30">
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wider">Delivery Timeline</h3>
          <TrackingProgressBar currentStatus={order.status} />
        </div>

        {/* Courier dispatch information */}
        {order.courierPartner && order.trackingId && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 text-sm">
              <Truck size={18} className="text-brand-teal" />
              <div>
                <p className="text-xs text-slate-400">Courier Partner</p>
                <p className="font-semibold text-slate-800 dark:text-slate-150">{order.courierPartner}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <FileText size={18} className="text-brand-teal" />
              <div>
                <p className="text-xs text-slate-400">Tracking ID</p>
                <p className="font-semibold text-slate-800 dark:text-slate-150">{order.trackingId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Addresses & Estimates grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase text-slate-450 tracking-wider">Expected Delivery</h4>
            <div className="flex items-center space-x-2 text-sm text-slate-650 dark:text-slate-300">
              <Calendar size={16} className="text-brand-teal" />
              <span className="font-semibold">{new Date(order.expectedDeliveryDate).toDateString()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase text-slate-450 tracking-wider">Payment Method</h4>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Payment ID: {order.paymentId}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase text-slate-450 tracking-wider">Shipping Destination</h4>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{order.shippingAddress?.fullName}</p>
            <p className="text-xs text-slate-400">
              {order.shippingAddress?.houseNo}, {order.shippingAddress?.streetAddress}, {order.shippingAddress?.area}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>

        {/* Items summary */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wider">Items Details</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-2">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-150">{item.name}</p>
                  <p className="text-xs text-slate-400">Size: {item.size} | Quantity: {item.quantity}</p>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-100">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary pricing calculations */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex flex-col items-end space-y-2 text-sm text-slate-500">
          <div className="flex justify-between w-64">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between w-64">
            <span>GST (18%):</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">₹{order.gst}</span>
          </div>
          <div className="flex justify-between w-64">
            <span>Shipping:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">₹{order.shippingCharge}</span>
          </div>
          <div className="flex justify-between w-64 font-bold text-slate-800 dark:text-slate-100 border-t pt-2 mt-2">
            <span>{order.paymentMethod === 'COD' ? 'Amount to Pay (COD):' : 'Amount Paid:'}</span>
            <span className="text-lg font-extrabold text-brand-teal">₹{order.grandTotal}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
