import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, Coffee, Flower2, Droplets, Leaf } from 'lucide-react';

export default function RateLimited() {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-[#F3E5F5] flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-bloom-primary/30 to-bloom-secondary/50 flex items-center justify-center mx-auto animate-pulse">
            <ShieldAlert className="w-14 h-14 text-bloom-primary" />
          </div>
          <div className="absolute -top-2 -right-2 bg-warning text-warning-content rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg">
            429
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-serif font-semibold text-bloom-dark mb-3">
          Whoa, slow down!
        </h1>
        <p className="text-bloom-muted text-lg mb-6">
          You're sending too many requests. Your soul needs a moment to sync. 
          <Coffee className="inline w-5 h-5 ml-1 text-bloom-primary" />
        </p>

        {/* Countdown */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-bloom-primary" />
            <span className="text-sm font-medium text-bloom-muted">Try again in</span>
          </div>
          <div className="text-5xl font-bold text-bloom-primary font-serif">
            {countdown > 0 ? `${countdown}s` : 'Now!'}
          </div>
          {countdown <= 0 && (
            <p className="text-sm text-success mt-2 font-medium">
              You're good to go — refresh or navigate back!
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white/40 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-bloom-dark mb-2">While you wait:</p>
          <ul className="text-sm text-bloom-muted space-y-2">
            <li className="flex items-center gap-2"><Flower2 size={14} className="text-bloom-primary" /> Take a deep breath in… and out…</li>
            <li className="flex items-center gap-2"><Droplets size={14} className="text-blue-400" /> Drink some water — hydration is self-care</li>
            <li className="flex items-center gap-2"><Leaf size={14} className="text-emerald-500" /> Look away from the screen for 20 seconds</li>
          </ul>
        </div>

        {/* Button */}
        <Link
          to="/"
          className="btn btn-primary btn-wide rounded-full shadow-soft text-white"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
