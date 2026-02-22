import React, { useState, useEffect } from 'react';
import { Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommunityLanding() {
    const [scrollY, setScrollY] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#F3E5F5] text-slate-800 overflow-x-hidden relative font-sans pt-20">

            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute bg-[#CE93D8] w-[600px] h-[600px] top-[-15%] right-[-10%] rounded-full opacity-30 blur-3xl animate-pulse"
                    style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                />
                <div
                    className="absolute bg-[#B2DFDB] w-[500px] h-[500px] top-[40%] left-[-15%] rounded-full opacity-30 blur-3xl"
                    style={{ transform: `translateY(${scrollY * -0.05}px)` }}
                />
                <div
                    className="absolute bg-[#D1C4E9] w-[700px] h-[700px] bottom-[-10%] right-[10%] rounded-full opacity-35 blur-3xl animate-pulse"
                    style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-5rem)]">
                <div className="flex flex-col lg:flex-row items-center gap-14 max-w-6xl w-full">

                    {/* Left — Text + Button */}
                    <div className="flex-1 text-center lg:text-left space-y-7">
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#3E2723] leading-tight">
                            Find Your <span className="text-[#7B1FA2]">Tribe</span>.
                        </h1>
                        <p className="text-xl text-[#5D4037] font-medium leading-relaxed opacity-90 max-w-xl">
                            Connect with people who understand you. Join supportive communities,
                            share your journey, and grow together in a safe, compassionate space.
                        </p>
                        <div className="w-24 h-2 bg-[#CE93D8] rounded-full mx-auto lg:mx-0 opacity-60" />
                        <button
                            onClick={() => navigate('/communities/explore')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-[#7B1FA2] text-white rounded-2xl font-bold text-lg hover:bg-[#6A1B9A] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <Users size={22} />
                            Explore Communities
                        </button>
                    </div>

                    {/* Right — Image + Quote */}
                    <div className="flex-1 max-w-md w-full">
                        <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/60 shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop&crop=faces"
                                alt="Community togetherness"
                                className="w-full h-64 object-cover rounded-[2rem] mb-6 shadow-md"
                            />
                            <div className="text-center space-y-3 px-4">
                                <Sparkles className="mx-auto text-[#8E24AA]" size={28} />
                                <blockquote className="text-xl font-serif italic text-[#3E2723] leading-relaxed">
                                    "Alone we can do so little; together we can do so much."
                                </blockquote>
                                <p className="text-[#8D6E63] font-semibold text-sm tracking-wide uppercase">
                                    — Helen Keller
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}