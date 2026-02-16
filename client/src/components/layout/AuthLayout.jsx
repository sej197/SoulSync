import React from 'react';
import { Link } from 'react-router-dom';

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`} />
);

const SoulSyncLogo = ({ size = 'lg' }) => {
  const sizes = {
    sm: { outer: 'w-10 h-10', ring: 'w-7 h-7', inner: 'w-3 h-3', dot: 'w-1.5 h-1.5' },
    lg: { outer: 'w-24 h-24', ring: 'w-16 h-16', inner: 'w-7 h-7', dot: 'w-3 h-3' },
  };
  const s = sizes[size];
  return (
    <div className={`${s.outer} relative flex items-center justify-center`}>
      {/* Outer rotating ring */}
      <div className={`absolute ${s.ring} rounded-full border-2 border-white/30 border-t-white/80 animate-[spin_8s_linear_infinite]`} />
      {/* Middle static ring */}
      <div className={`absolute ${s.ring} rounded-full border border-white/15`} style={{ transform: 'scale(1.25)' }} />
      {/* Core glow */}
      <div className={`${s.inner} rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center`}>
        <div className={`${s.dot} rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]`} />
      </div>
      {/* Orbit dots */}
      {[0, 90, 180, 270].map((deg) => (
        <div key={deg} className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${deg}deg)` }}>
          <div className={`absolute ${size === 'lg' ? 'w-1.5 h-1.5' : 'w-1 h-1'} rounded-full bg-white/50`}
            style={{ top: size === 'lg' ? '2px' : '1px' }} />
        </div>
      ))}
    </div>
  );
};

const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-bloom-cream dark:bg-gray-950 font-sans overflow-hidden">

      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #d8b4fe 0%, #c084fc 25%, #a855f7 50%, #9333ea 75%, #7e22ce 100%)',
        }}
      >
        {/* Decorative orbs */}
        <FloatingOrb className="w-72 h-72 bg-white/20 -top-20 -left-20" />
        <FloatingOrb className="w-96 h-96 bg-purple-300/20 bottom-10 -right-32 animation-delay-2000" />
        <FloatingOrb className="w-48 h-48 bg-pink-200/25 top-1/3 left-1/4 animation-delay-4000" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Logo centered */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <SoulSyncLogo size="lg" />
          <div className="text-center">
            <h1 className="text-5xl font-serif font-bold text-white tracking-tight">
              SoulSync
            </h1>
            <p className="text-sm text-white/60 tracking-widest uppercase mt-2">
              Mental Wellness
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-6 relative overflow-y-auto">
        {/* Subtle background accents for right side */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-bloom-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-bloom-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Mobile logo (shown on small screens) */}
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <Link to="/" className="flex items-center gap-2">
            <SoulSyncLogo size="sm" />
            <span className="text-lg font-serif font-bold text-bloom-primary dark:text-white">
              SoulSync
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
