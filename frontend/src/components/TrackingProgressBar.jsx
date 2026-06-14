'use client';

import React from 'react';
import { Check, ClipboardList, CheckCircle2, ShieldCheck, Box, Truck, Compass, MapPin, Handshake } from 'lucide-react';

const STAGES = [
  { status: 'Placed', label: 'Order Placed', icon: ClipboardList },
  { status: 'Confirmed', label: 'Payment Confirmed', icon: CheckCircle2 },
  { status: 'Accepted', label: 'Order Accepted', icon: ShieldCheck },
  { status: 'Packed', label: 'Product Packed', icon: Box },
  { status: 'Shipped', label: 'Shipped', icon: Truck },
  { status: 'InTransit', label: 'In Transit', icon: Compass },
  { status: 'OutForDelivery', label: 'Out For Delivery', icon: MapPin },
  { status: 'Delivered', label: 'Delivered', icon: Handshake },
];

export default function TrackingProgressBar({ currentStatus }) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="w-full p-5 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl flex items-center space-x-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-650 dark:text-red-400 flex-shrink-0">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This order has been cancelled by the administrator.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((stage) => stage.status === currentStatus);

  return (
    <div className="w-full">
      {/* Desktop Horizontal Progress Bar */}
      <div className="hidden md:flex items-center justify-between w-full relative px-4 py-8">
        {/* Connection line */}
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
        
        {/* Filled connection line */}
        <div
          className="absolute top-1/2 left-8 h-1 bg-brand-teal -translate-y-1/2 z-0 transition-all duration-500 ease-out"
          style={{
            width: `${(currentIndex / (STAGES.length - 1)) * 92}%`,
          }}
        />

        {STAGES.map((stage, index) => {
          const IconComponent = stage.icon;
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.status} className="relative z-10 flex flex-col items-center flex-1">
              {/* Circle node */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-brand-teal border-brand-teal text-white shadow-sm'
                    : isActive
                    ? 'bg-white dark:bg-slate-800 border-brand-saffron text-brand-saffron scale-110 shadow-md ring-4 ring-brand-saffron/10'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}
              >
                {isCompleted ? <Check size={18} /> : <IconComponent size={18} />}
              </div>

              {/* Label */}
              <div className="text-center mt-3 max-w-[90px]">
                <p
                  className={`text-[10px] sm:text-xs font-semibold leading-tight transition-colors duration-200 ${
                    isActive
                      ? 'text-brand-saffron font-bold'
                      : isCompleted
                      ? 'text-brand-teal'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {stage.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Progress Bar */}
      <div className="flex md:hidden flex-col space-y-6 pl-4 py-4 relative">
        {/* Connection line */}
        <div className="absolute top-6 bottom-6 left-8 w-1 bg-slate-200 dark:bg-slate-700 z-0" />

        {/* Filled connection line */}
        <div
          className="absolute top-6 left-8 w-1 bg-brand-teal z-0 transition-all duration-500 ease-out"
          style={{
            height: `${(currentIndex / (STAGES.length - 1)) * 90}%`,
          }}
        />

        {STAGES.map((stage, index) => {
          const IconComponent = stage.icon;
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={stage.status} className="relative z-10 flex items-center space-x-4">
              {/* Circle node */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-brand-teal border-brand-teal text-white'
                    : isActive
                    ? 'bg-white dark:bg-slate-800 border-brand-saffron text-brand-saffron scale-105 shadow ring-4 ring-brand-saffron/10'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}
              >
                {isCompleted ? <Check size={16} /> : <IconComponent size={16} />}
              </div>

              {/* Label */}
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isActive
                      ? 'text-brand-saffron font-bold'
                      : isCompleted
                      ? 'text-brand-teal'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {stage.label}
                </p>
                {isActive && (
                  <p className="text-[10px] text-slate-400">Current Status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
