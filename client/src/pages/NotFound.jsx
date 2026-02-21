import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Search, Ghost, Meh } from 'lucide-react';

const funnyMessages = [
  "This page ghosted you harder than your last situationship.",
  "Error 404: Inner peace not found at this URL.",
  "Even our AI therapist couldn't find this page.",
  "The page you're looking for is on a self-care retreat.",
  "404 — This page took a mental health day. Respect its boundaries.",
  "Looks like this page unsubscribed from existence.",
];

const funnySubtexts = [
  "Maybe the real page was the friends we made along the way.",
  "Have you tried journaling about this loss?",
  "Our chatbot says: \"Let it go.\"",
  "Deep breaths. The homepage still loves you.",
  "This is a sign to go touch grass.",
  "It's not you, it's the URL.",
];

export default function NotFound() {
  const location = useLocation();
  const [msgIndex] = useState(() => Math.floor(Math.random() * funnyMessages.length));
  const [subIndex] = useState(() => Math.floor(Math.random() * funnySubtexts.length));
  const [ghostY, setGhostY] = useState(0);

  useEffect(() => {
    let frame;
    let start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      setGhostY(Math.sin(elapsed / 800) * 12);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3E5F5] flex items-center justify-center px-4 font-sans relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-bloom-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-bloom-secondary/20 rounded-full blur-3xl" />

      <div className="max-w-lg w-full text-center relative z-10">
        {/* Floating ghost */}
        <div className="mb-6 flex justify-center">
          <div
            className="transition-transform"
            style={{ transform: `translateY(${ghostY}px)` }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-bloom-primary/20 to-bloom-secondary/40 flex items-center justify-center shadow-soft">
              <Ghost className="w-16 h-16 text-bloom-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-serif font-bold text-bloom-primary/80 mb-2 tracking-tight">
          404
        </h1>

        {/* Funny message */}
        <p className="text-xl font-serif text-bloom-dark mb-2 max-w-sm mx-auto leading-relaxed">
          {funnyMessages[msgIndex]}
        </p>
        <p className="text-bloom-muted text-sm mb-8 italic">
          {funnySubtexts[subIndex]}
        </p>

        {/* Tried to visit */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-8 inline-block">
          <code className="text-sm text-bloom-muted">
            <span className="text-bloom-primary font-medium">~</span>
            {location.pathname}
          </code>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn btn-primary rounded-full shadow-soft text-white gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-ghost rounded-full border border-bloom-primary/30 text-bloom-dark gap-2 hover:bg-bloom-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Easter egg */}
        <p className="mt-10 text-xs text-bloom-muted/50 flex items-center justify-center gap-1">
          <Meh size={12} /> If you keep ending up here, maybe the universe is telling you to take a break.
        </p>
      </div>
    </div>
  );
}
