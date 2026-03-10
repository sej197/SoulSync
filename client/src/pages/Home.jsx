import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  MessageCircle,
  Activity,
  ArrowRight,
  Brain,
  ShieldCheck,
  Heart,
  Smile,
  Sun,
  Cloud,
  Wind,
  CloudSun,
  Frown,
  Meh,
  SmilePlus,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('journal');
  const [journalEntry, setJournalEntry] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3E5F5] text-slate-800 overflow-x-hidden selection:bg-[#FFCC80] selection:text-[#3E2723] relative font-sans">

      <style>
        {`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(-2deg); }
          }
          @keyframes morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          }
          @keyframes gentle-rise {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes soft-pulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
          .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
          .animate-morph { animation: morph 10s ease-in-out infinite; }
          .animate-gentle-rise { animation: gentle-rise 0.9s ease-out both; }
          .animate-gentle-rise-delay-1 { animation: gentle-rise 0.9s 0.15s ease-out both; }
          .animate-gentle-rise-delay-2 { animation: gentle-rise 0.9s 0.3s ease-out both; }
          .animate-gentle-rise-delay-3 { animation: gentle-rise 0.9s 0.45s ease-out both; }
          .animate-soft-pulse { animation: soft-pulse 4s ease-in-out infinite; }
          
          .blob-shape {
            position: absolute;
            transition: transform 0.1s linear;
            mix-blend-mode: multiply;
          }
          
          .card-hover-pop {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .card-hover-pop:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px -5px rgba(0,0,0,0.05);
          }
        `}
      </style>

      {/* Parallax Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Right - Sunny Yellow */}
        <div
          className="blob-shape bg-[#FFE0B2] w-[600px] h-[600px] top-[-15%] right-[-10%] animate-morph opacity-60"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        ></div>

        {/* Middle Left - Calm Teal */}
        <div
          className="blob-shape bg-[#B2DFDB] w-[500px] h-[500px] top-[30%] left-[-15%] animate-morph opacity-60"
          style={{ transform: `translateY(${scrollY * -0.1}px)`, animationDelay: '-2s' }}
        ></div>

        {/* Bottom Right - Warm Orange */}
        <div
          className="blob-shape bg-[#FFCCBC] w-[700px] h-[700px] bottom-[-20%] right-[-5%] animate-morph opacity-60"
          style={{ transform: `translateY(${scrollY * 0.15}px)`, animationDelay: '-4s' }}
        ></div>

        {/* Floating Icons */}
        <div className="absolute top-[20%] right-[20%] text-[#FFB74D] animate-float-slow opacity-80" style={{ transform: `translateY(${scrollY * -0.3}px)` }}>
          <Sun size={48} />
        </div>
        <div className="absolute top-[50%] left-[10%] text-[#80CBC4] animate-float-medium opacity-60" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
          <Wind size={56} />
        </div>
        <div className="absolute bottom-[20%] left-[25%] text-[#9EA7AA] animate-float-slow opacity-40 delay-1000" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>
          <Cloud size={64} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">

          {/* Main heading */}
          <h1 className="animate-gentle-rise-delay-1 text-5xl md:text-7xl lg:text-[5.25rem] font-bold font-serif text-[#3E2723] leading-[1.08] tracking-tight mb-8">
            A calmer mind,{' '}
            <br className="hidden sm:block" />
            a <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#EF6C00] via-[#FF8F00] to-[#FFB300]">happier</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[#FFE0B2] rounded-full -z-0 opacity-60"></span>
            </span> you.
          </h1>

          {/* Subtitle */}
          <p className="animate-gentle-rise-delay-2 text-lg md:text-xl text-[#6D4C41] max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Gentle tools to help you breathe, reflect, and grow — at your own
            pace. Science-backed support that feels like a warm conversation.
          </p>

          {/* CTA */}
          <div className="animate-gentle-rise-delay-3 flex flex-col items-center">
            <Link
              to="/signup"
              className="group btn btn-lg h-[3.75rem] px-12 rounded-full bg-gradient-to-r from-[#EF6C00] to-[#FF8F00] hover:from-[#E65100] hover:to-[#EF6C00] text-white border-none text-lg font-bold shadow-lg shadow-orange-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust line */}
          <p className="animate-gentle-rise-delay-3 mt-6 text-sm text-[#8D6E63] font-medium flex items-center justify-center gap-2">
            <ShieldCheck size={15} className="text-emerald-500" />
            Free forever • No credit card needed • Your data stays private
          </p>

          {/* Learn more link */}
          <Link
            to="/about"
            className="animate-gentle-rise-delay-3 inline-flex items-center gap-2 mt-4 text-[#7B1FA2] font-bold hover:text-[#4A148C] transition-colors text-base group"
          >
            Learn more about SoulSync
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>
      </div>

      {/* Feature Tabs Section */}
      <div className="relative z-10 container mx-auto px-4 pb-32 -mt-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-14 shadow-xl border border-white/60 max-w-6xl mx-auto">

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {[
              { id: 'journal', label: 'Journal', icon: BookOpen, color: 'text-[#0277BD]' },
              { id: 'quiz', label: 'Check-in', icon: Activity, color: 'text-[#EF6C00]' },
              { id: 'chatbot', label: 'SyncAI', icon: MessageCircle, color: 'text-[#6A1B9A]' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-[#3E2723] text-white shadow-lg scale-105'
                  : 'bg-[#F5F5F5] text-[#757575] hover:bg-[#EEEEEE] hover:text-[#424242]'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab !== tab.id ? tab.color : ''}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="min-h-[450px]">
            {activeTab === 'journal' && (
              <div className="grid md:grid-cols-2 gap-16 items-center animate-fade-in">
                <div className="space-y-8 text-left order-2 md:order-1">
                  <div className="inline-block p-4 rounded-3xl bg-[#E1F5FE] text-[#0277BD] mb-2">
                    <BookOpen size={40} />
                  </div>
                  <div>
                    <h3 className="text-4xl font-serif font-bold text-[#3E2723] mb-4">Clear your mind.</h3>
                    <p className="text-xl text-[#5D4037] leading-relaxed">
                      Journaling is more than just writing—it's a conversation with yourself.
                      Unload your thoughts in a safe, private space designed for clarity.
                    </p>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 text-[#5D4037] font-medium text-lg">
                      <div className="w-8 h-8 rounded-full bg-[#B3E5FC] flex items-center justify-center text-[#0277BD]">✓</div>
                      Private & Secure
                    </li>
                    <li className="flex items-center gap-4 text-[#5D4037] font-medium text-lg">
                      <div className="w-8 h-8 rounded-full bg-[#B3E5FC] flex items-center justify-center text-[#0277BD]">✓</div>
                      Mood Tracking Integration
                    </li>
                  </ul>
                </div>
                <div className="relative order-1 md:order-2 perspective-[1000px]">
                  <div className="absolute -inset-4 bg-[#B3E5FC] rounded-[2.5rem] transform rotate-6 opacity-40"></div>
                  <div className="relative bg-white rounded-[2rem] p-8 shadow-2xl border border-[#E1F5FE] transform transition-transform hover:rotate-1">
                    <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
                      <div className="w-4 h-4 rounded-full bg-[#FFAB91]"></div>
                      <div className="w-4 h-4 rounded-full bg-[#FFCC80]"></div>
                      <div className="w-4 h-4 rounded-full bg-[#A5D6A7]"></div>
                    </div>
                    <textarea
                      className="w-full h-56 p-4 text-xl text-[#3E2723] placeholder-[#BCAAA4] bg-[#FAFAFA] rounded-xl border-none focus:ring-2 focus:ring-[#B3E5FC] resize-none font-medium leading-relaxed"
                      placeholder="Today I am feeling..."
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                    ></textarea>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-sm text-[#8D6E63] font-bold uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      <button className="btn bg-[#0288D1] hover:bg-[#0277BD] text-white border-none rounded-xl px-6">Save Entry</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="grid md:grid-cols-2 gap-16 items-center animate-fade-in">
                <div className="relative order-1">
                  <div className="absolute -inset-4 bg-[#FFE082] rounded-[2.5rem] transform -rotate-3 opacity-40"></div>
                  <div className="relative bg-white rounded-[2rem] p-10 shadow-2xl border border-[#FFF8E1] text-center">
                    <div className="w-28 h-28 mx-auto bg-[#FFF3E0] rounded-full flex items-center justify-center mb-8 shadow-inner">
                      <CloudSun size={48} className="text-[#EF6C00]" />
                    </div>
                    <h4 className="text-2xl font-bold text-[#3E2723] mb-2">Morning Check-in</h4>
                    <p className="text-[#8D6E63] mb-8">How are you feeling right now?</p>

                    <div className="flex justify-center gap-6 mb-10">
                      {[Frown, Meh, Smile, SmilePlus].map((Icon, i) => (
                        <button key={i} className="hover:scale-125 transition-transform cursor-pointer p-3 bg-[#FAFAFA] rounded-2xl hover:bg-[#FFF3E0] shadow-sm"><Icon size={36} className="text-[#8D6E63]" /></button>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2">
                      <span>Progress</span>
                      <span>3/4</span>
                    </div>
                    <div className="w-full bg-[#ECEFF1] h-4 rounded-full overflow-hidden">
                      <div className="bg-[#EF6C00] w-3/4 h-full rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8 text-left order-2">
                  <div className="inline-block p-4 rounded-3xl bg-[#FFF3E0] text-[#EF6C00] mb-2">
                    <Activity size={40} />
                  </div>
                  <div>
                    <h3 className="text-4xl font-serif font-bold text-[#3E2723] mb-4">Track your wellness.</h3>
                    <p className="text-xl text-[#5D4037] leading-relaxed">
                      Understanding your patterns is the first step to feeling better.
                      Take our quick daily assessments to visualize your journey.
                    </p>
                  </div>
                  <Link to="/daily-quiz" className="btn btn-xl h-14 rounded-2xl px-8 bg-[#EF6C00] border-none text-white hover:bg-[#E65100] text-lg shadow-lg shadow-orange-200">
                    Start Daily Check-in
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'chatbot' && (
              <div className="grid md:grid-cols-2 gap-16 items-center animate-fade-in">
                <div className="space-y-8 text-left">
                  <div className="inline-block p-4 rounded-3xl bg-[#F3E5F5] text-[#8E24AA] mb-2">
                    <MessageCircle size={40} />
                  </div>
                  <div>
                    <h3 className="text-4xl font-serif font-bold text-[#3E2723] mb-4">Always here to listen.</h3>
                    <p className="text-xl text-[#5D4037] leading-relaxed">
                      SyncAI is your supportive companion available 24/7.
                      Whether you need to vent, seek advice, or just chat, we're here.
                    </p>
                  </div>
                  <Link to="/chatbot" className="btn btn-xl h-14 rounded-2xl px-8 bg-[#8E24AA] border-none text-white hover:bg-[#7B1FA2] text-lg shadow-lg shadow-purple-200">
                    Chat with SyncAI
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute -inset-4 bg-[#E1BEE7] rounded-[2.5rem] transform rotate-2 opacity-40"></div>
                  <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-[#F3E5F5]">
                    <div className="bg-[#FAFAFA] p-6 border-b border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#8E24AA] flex items-center justify-center text-white font-bold text-lg shadow-md">AI</div>
                      <div>
                        <div className="font-bold text-[#3E2723]">SyncAI Companion</div>
                        <div className="text-xs text-[#4CAF50] font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#4CAF50]"></span> Online Now
                        </div>
                      </div>
                    </div>
                    <div className="p-8 space-y-6 bg-[#FAFAFA]/50">
                      <div className="flex gap-4">
                        <div className="bg-[#F3E5F5] text-[#4A148C] p-4 rounded-3xl rounded-tl-none text-lg max-w-[85%] shadow-sm">
                          Hello! I'm here to support you. How are you feeling today? 🌿
                        </div>
                      </div>
                      <div className="flex gap-4 justify-end">
                        <div className="bg-[#B3E5FC] text-[#01579B] p-4 rounded-3xl rounded-tr-none text-lg max-w-[85%] shadow-sm">
                          I've been feeling a bit anxious about work lately...
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-[#F3E5F5] text-[#4A148C] p-4 rounded-3xl rounded-tl-none text-lg max-w-[85%] shadow-sm flex gap-2 items-center">
                          <span className="w-2 h-2 bg-[#8E24AA] rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-[#8E24AA] rounded-full animate-bounce delay-75"></span>
                          <span className="w-2 h-2 bg-[#8E24AA] rounded-full animate-bounce delay-150"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#3E2723] mb-4">Why choose SoulSync?</h2>
          <div className="w-24 h-2 bg-[#FFCC80] rounded-full mx-auto opacity-60"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover-pop border border-[#FFF3E0] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E0F2F1] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center mb-6 shadow-sm">
                <Brain size={32} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#3E2723] mb-4">Early Intervention</h3>
              <p className="text-[#5D4037] text-lg leading-relaxed mb-8">
                Identifying recurring negative thoughts and behavioral patterns early can prevent them from spiraling.
                Regular self-reflection and tracking can significantly improve long-term mental resilience.
              </p>
              <Link to="/insights" className="text-[#00695C] font-bold text-lg flex items-center gap-2 group-hover:gap-3 transition-all">
                Take Action<ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover-pop border border-[#FFF3E0] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F3E5F5] rounded-bl-[100%] opacity-60 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#F3E5F5] text-[#8E24AA] flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#3E2723] mb-4">WHO Standards</h3>
              <p className="text-[#5D4037] text-lg leading-relaxed mb-8">
                According to the World Health Organization, mental health is "a state of well-being in which an individual realizes his or her own abilities, can cope with the normal stresses of life, and can work productively.
              </p>
              <Link to="/about" className="text-[#8E24AA] font-bold text-lg flex items-center gap-2 group-hover:gap-3 transition-all">
                Read Guidelines <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="bg-[#FFF8E1] py-24 mt-10 relative overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-80 h-80 bg-[#FFE0B2] rounded-full opacity-40 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-[#FFCC80] rounded-full opacity-30 blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Heart className="w-16 h-16 text-[#FF7043] mx-auto mb-8 animate-bounce" />
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#3E2723] max-w-5xl mx-auto leading-tight italic">
            "You don't have to control your thoughts. <br /> You just have to stop letting them control you."
          </h2>
          <div className="mt-10 inline-block">
            <span className="text-[#5D4037] font-bold tracking-widest uppercase border-b-2 border-[#FF7043] pb-1">
              Dan Millman
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}