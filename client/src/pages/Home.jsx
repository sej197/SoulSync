import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  MessageCircle,
  Activity,
  ArrowRight,
  Brain,
  Heart,
  ShieldCheck,
  Info
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('journal');
  const [journalEntry, setJournalEntry] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-gray-100 overflow-x-hidden selection:bg-bloom-primary selection:text-white relative">
      {/* CSS for animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translate(0px, 0px); }
            33% { transform: translate(30px, -50px); }
            66% { transform: translate(-20px, 20px); }
            100% { transform: translate(0px, 0px); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
           @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-float {
            animation: float 20s ease-in-out infinite;
          }
          .animate-pulse-glow {
            animation: pulse-glow 4s ease-in-out infinite;
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .glass-panel-hover:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(200, 150, 244, 0.3);
          }
        `}
      </style>

      {/* Mouse Follower Spotlight */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(200, 150, 244, 0.15), transparent 80%)`
        }}
      ></div>

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-bloom-primary/20 rounded-full blur-[100px] animate-float animate-pulse-glow opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[120px] animate-float animate-pulse-glow opacity-60" style={{ animationDelay: '-5s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-blue-900/20 rounded-full blur-[80px] animate-float animate-pulse-glow opacity-50" style={{ animationDelay: '-10s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="hero min-h-[85vh] relative text-center px-4">
        <div className="hero-content max-w-3xl">
          <div>

            <h1 className="text-5xl md:text-7xl font-bold font-serif mb-8 bg-clip-text text-transparent bg-gradient-to-r from-bloom-secondary via-bloom-primary to-white drop-shadow-sm leading-tight">
              SoulSync
            </h1>
            <p className="py-6 text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
              Discover a sanctuary for your mind. <br className="hidden md:block" />
              <span className="text-bloom-primary font-medium">Reflect</span> deeply, <span className="text-bloom-primary font-medium">connect</span> authentically, and <span className="text-bloom-primary font-medium">thrive</span> daily.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link to="/signup" className="btn btn-lg bg-bloom-primary hover:bg-bloom-primary/80 text-white border-none rounded-full px-10 text-lg shadow-[0_0_20px_rgba(200,150,244,0.3)] transition-all hover:scale-105">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50">
          <ArrowRight className="w-6 h-6 rotate-90 text-bloom-secondary" />
        </div>
      </div>

      {/* Dynamic Tabs Section */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 max-w-5xl mx-auto shadow-2xl">

          {/* Tabs Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-black/20 p-1.5 rounded-2xl inline-flex flex-wrap justify-center gap-2">
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'journal' ? 'bg-bloom-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveTab('journal')}
              >
                <BookOpen className="w-5 h-5" /> Journal
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'quiz' ? 'bg-bloom-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveTab('quiz')}
              >
                <Activity className="w-5 h-5" /> Check-in
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'chatbot' ? 'bg-bloom-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => setActiveTab('chatbot')}
              >
                <MessageCircle className="w-5 h-5" /> SyncAI
              </button>
            </div>
          </div>

          <div className="min-h-[400px] flex items-center justify-center">
            {activeTab === 'journal' && (
              <div className="w-full animate-fade-in max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-serif text-white mb-2">Clear Your Mind</h3>
                  <p className="text-gray-400">Write down your thoughts. Private, secure, and just for you.</p>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-bloom-primary/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <textarea
                    className="relative textarea w-full h-64 text-lg p-6 rounded-2xl bg-[#1a1a2e] border border-white/10 text-gray-200 focus:border-bloom-primary/50 focus:ring-1 focus:ring-bloom-primary/50 transition-all resize-none leading-relaxed placeholder-gray-600"
                    placeholder="How are you feeling right now? Let it all out..."
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                  ></textarea>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost text-gray-500 hover:text-red-400"
                      onClick={() => setJournalEntry('')}
                    >
                      Clear
                    </button>
                    <button className="btn btn-sm bg-bloom-primary/20 hover:bg-bloom-primary text-bloom-secondary hover:text-white border-none px-6 rounded-lg transition-all">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="w-full max-w-2xl mx-auto text-center animate-fade-in py-6">
                <div className="mb-8 relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-bloom-primary/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-28 h-28 bg-[#1a1a2e] border border-white/10 rounded-full flex items-center justify-center text-6xl shadow-2xl">
                    🌸
                  </div>
                </div>
                <h3 className="text-4xl font-serif text-white mb-4">Daily Wellness Check</h3>
                <p className="text-xl text-gray-400 mb-10 leading-relaxed font-light">
                  Track your mood and mental state in just 2 minutes. <br />
                  <span className="text-bloom-secondary">Small steps lead to big changes.</span>
                </p>
                <Link
                  to="/daily-quiz"
                  className="btn btn-xl h-16 px-12 text-xl bg-gradient-to-r from-bloom-primary to-purple-600 hover:from-bloom-primary/80 hover:to-purple-600/80 border-none text-white rounded-full shadow-lg hover:shadow-bloom-primary/25 hover:-translate-y-1 transition-all"
                >
                  Start Check-in <ArrowRight className="ml-2 w-6 h-6" />
                </Link>
              </div>
            )}

            {activeTab === 'chatbot' && (
              <div className="w-full max-w-4xl mx-auto animate-fade-in grid md:grid-cols-2 gap-12 items-center">
                <div className="text-left space-y-8">
                  <div>
                    <h3 className="text-4xl font-serif text-white mb-4">Meet SyncAI</h3>
                    <div className="h-1 w-20 bg-bloom-primary rounded mb-6"></div>
                  </div>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Your empathetic AI companion is here 24/7. No judgment, just support.
                    Whether you're feeling anxious, stressed, or just need to vent, SyncAI is ready to listen to you.
                  </p>
                  <Link
                    to="/chatbot"
                    className="btn btn-lg bg-white/10 hover:bg-bloom-primary border border-white/10 hover:border-bloom-primary text-white rounded-xl shadow-lg px-8 transition-all group"
                  >
                    Start Chatting <MessageCircle className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Chat Preview */}
                <div className="bg-[#151525] p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="chat chat-start mb-6">
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full bg-bloom-primary flex items-center justify-center text-white font-bold">
                        AI
                      </div>
                    </div>
                    <div className="chat-bubble bg-gray-800 text-gray-200 border border-gray-700">
                      Hello! I'm here to listen. How can I support you today? 🌿
                    </div>
                  </div>
                  <div className="chat chat-end mb-2">
                    <div className="chat-bubble bg-bloom-primary/20 text-bloom-secondary border border-bloom-primary/20">
                      I've been feeling a bit overwhelmed...
                    </div>
                  </div>
                  <div className="chat chat-start">
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full bg-bloom-primary flex items-center justify-center text-white font-bold">
                        AI
                      </div>
                    </div>
                    <div className="chat-bubble bg-gray-800 text-gray-200 border border-gray-700 flex gap-2 items-center">
                      <span className="loading loading-dots loading-xs"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <span className="text-bloom-primary font-bold tracking-wider uppercase text-sm">Knowledge is Power</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mt-3 mb-6">Mental Health Awareness</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-bloom-primary to-transparent mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Card 1: Early Intervention */}
          <div className="group glass-panel glass-panel-hover rounded-3xl overflow-hidden transition-all duration-500 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-bloom-primary to-purple-900 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="card-body p-10">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-bloom-primary group-hover:scale-110 transition-transform duration-300 border border-white/10">
                  <Brain className="w-8 h-8" />
                </div>
                <h2 className="card-title text-3xl font-serif text-white">
                  Early Intervention
                </h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 font-light">
                Identifying recurring negative thoughts and behavioral patterns early can prevent them from spiraling.
                Regular self-reflection and tracking can significantly improve long-term mental resilience.
              </p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <span className="text-bloom-secondary font-medium text-sm uppercase tracking-wide">Take Action</span>
                <Link to="/insights" className="btn btn-circle btn-ghost text-bloom-primary hover:bg-bloom-primary/20 hover:text-white transition-all">
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: WHO Standards */}
          <div className="group glass-panel glass-panel-hover rounded-3xl overflow-hidden transition-all duration-500 relative">
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-900 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="card-body p-10">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300 border border-white/10">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="card-title text-3xl font-serif text-white">
                  WHO Standards
                </h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 font-light">
                According to the World Health Organization, mental health is "a state of well-being in which an individual realizes his or her own abilities, can cope with the normal stresses of life, and can work productively."
              </p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <span className="text-emerald-400 font-medium text-sm uppercase tracking-wide">Read Guidelines</span>
                <a href="https://www.who.int/health-topics/mental-health" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-ghost text-emerald-400 hover:bg-emerald-500/20 hover:text-white transition-all">
                  <ArrowRight className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Quote */}
        <div className="text-center mt-32 opacity-60 hover:opacity-100 transition-opacity">
          <Heart className="w-12 h-12 mx-auto text-rose-400 mb-6 animate-pulse" />
          <p className="font-serif text-2xl italic text-gray-400">"You are not alone in this journey."</p>
        </div>
      </div>
    </div>
  );
}