import React, { useState } from 'react';
import { Heart, Users, CheckCircle, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

const About = () => {
    const [showPhilosophy, setShowPhilosophy] = useState(false);

    return (
        <div className="min-h-screen bg-[#F3E5F5] text-slate-800 selection:bg-[#FFCC80] selection:text-[#3E2723] font-sans overflow-x-hidden">

            {/* Hero Section */}
            <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
                {/* Decorative Blobs matching Homepage */}
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#FFE0B2] rounded-full blur-[100px] opacity-60 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-[#B2DFDB] rounded-full blur-[100px] opacity-50" />

                <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold font-serif text-[#3E2723] leading-tight tracking-tight">
                        Healing starts with <br />
                        <span className="text-[#EF6C00]">understanding.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[#5D4037] max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
                        At SoulSync, we believe in a holistic approach to mental wellness.
                        We create a safe, nurturing space for you to reflect and grow.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2">
                        <div className="relative group">
                            <div className="absolute -top-6 -left-6 w-28 h-28 
                                bg-[#FFCC80] rounded-full opacity-40 group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute -bottom-6 -right-6 w-40 h-40 
                                bg-[#B3E5FC] rounded-full opacity-30 group-hover:scale-110 transition-transform duration-500 delay-100" />

                            <img
                                src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2070&auto=format&fit=crop"
                                alt="Therapy Session"
                                className="relative z-10 rounded-[2.5rem] shadow-2xl w-full h-[500px] object-cover transform group-hover:-translate-y-2 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3E2723] mb-4">
                                Our Story
                            </h2>
                            <div className="w-20 h-2 bg-[#FFCC80] rounded-full opacity-60"></div>
                        </div>

                        <p className="text-[#5D4037] text-xl leading-relaxed font-medium opacity-90">
                            Founded in 2026, SoulSync emerged from a simple yet profound
                            realization: mental health care needed to be more accessible,
                            compassionate, and human-centered.
                        </p>

                        <p className="text-[#5D4037] text-xl leading-relaxed font-medium opacity-90">
                            Inspired by nature’s resilience, we believe every individual has
                            the capacity to heal, grow, and thrive — just like flowers after
                            the rain.
                        </p>

                        <button
                            onClick={() => setShowPhilosophy(!showPhilosophy)}
                            className={`group btn btn-lg h-16 px-10 rounded-full border-none text-xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 ${showPhilosophy
                                ? 'bg-[#3E2723] text-white'
                                : 'bg-[#EF6C00] hover:bg-[#E65100] text-white shadow-[#FFCCBC]'
                                }`}
                        >
                            {showPhilosophy ? 'Close Philosophy' : 'Read Our Philosophy'}
                            <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${showPhilosophy ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                        </button>

                        {/* Philosophy Content */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showPhilosophy ? 'max-h-[1000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/60 shadow-xl space-y-8">
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-3">The Challenge</h3>
                                    <p className="text-[#5D4037] text-lg leading-relaxed font-medium opacity-80">
                                        Mental health challenges often develop gradually, with early warning signs like mood fluctuations or sleep disturbances.
                                        However, stigma and limited access to resources often delay support until symptoms become severe.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-3">Our Objective</h3>
                                    <p className="text-[#5D4037] text-lg leading-relaxed font-medium mb-4 opacity-80">
                                        We are building a <strong className="text-[#00695C]">preventive, technology-driven platform</strong> that:
                                    </p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            "Early risk detection",
                                            "Non-judgmental support",
                                            "Proactive intervention",
                                            "Personalized insights",
                                            "Ethical AI usage",
                                            "Guaranteed privacy"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-[#5D4037] font-bold">
                                                <div className="w-6 h-6 rounded-full bg-[#B2DFDB] flex items-center justify-center text-[#00695C] text-xs">✓</div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Values */}
            <section className="py-32 bg-[#FFF8E1] relative overflow-hidden">
                <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-[#FFE0B2] rounded-full opacity-30 blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#3E2723] mb-6">
                            Our Mission & Values
                        </h2>
                        <div className="w-24 h-2 bg-[#FFCC80] rounded-full mx-auto opacity-60 mb-6"></div>
                        <p className="text-[#5D4037] max-w-2xl mx-auto text-xl font-medium opacity-80">
                            We are guided by principles that put empathy, care,
                            and community first.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Compassion First",
                                desc: "A safe space to express emotions, track mental health, and feel genuinely heard.",
                                icon: Heart,
                                color: "text-[#EF6C00]",
                                bg: "bg-[#FFF3E0]"
                            },
                            {
                                title: "Community Focused",
                                desc: "Building meaningful connections through shared experiences and support.",
                                icon: Users,
                                color: "text-[#6A1B9A]",
                                bg: "bg-[#F3E5F5]"
                            },
                            {
                                title: "Trusted Care",
                                desc: "Backed by research, empathy, and a commitment to your long-term wellbeing.",
                                icon: CheckCircle,
                                color: "text-[#00695C]",
                                bg: "bg-[#E0F2F1]"
                            }
                        ].map((value, i) => (
                            <div key={i} className="group bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60 hover:-translate-y-2">
                                <div className={`w-16 h-16 rounded-2xl ${value.bg} ${value.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                                    <value.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-4 text-[#3E2723]">
                                    {value.title}
                                </h3>
                                <p className="text-[#5D4037] text-lg leading-relaxed font-medium opacity-70">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-32 relative">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-serif font-bold text-[#3E2723] mb-16">
                        Contact Us
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        {/* Location 1 */}
                        <div className="group space-y-6 p-10 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 rounded-full bg-[#E1F5FE] text-[#0277 BD] flex items-center justify-center font-bold">1</div>
                            <h3 className="text-2xl font-bold text-[#3E2723]">Head Office</h3>
                            <div className="space-y-3 text-lg text-[#5D4037] font-medium opacity-80">
                                <p>Wellesly Road,Shivajinagar</p>
                                <p>Pune, Maharashtra 411001</p>
                                <div className="pt-4 space-y-2">
                                    <p className="hover:text-[#EF6C00] transition-colors cursor-pointer flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF6C00]"></span> hello@soulsync.com
                                    </p>
                                    <p className="hover:text-[#EF6C00] transition-colors cursor-pointer flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF6C00]"></span> +91 9763718180
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location 2 */}
                        <div className="group space-y-6 p-10 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 rounded-full bg-[#F3E5F5] text-[#8E24AA] flex items-center justify-center font-bold">2</div>
                            <h3 className="text-2xl font-bold text-[#3E2723]">Secondary Office</h3>
                            <div className="space-y-3 text-lg text-[#5D4037] font-medium opacity-80">
                                <p>Wellesly Road,Shivajinagar</p>
                                <p>Pune, Maharashtra 411001</p>
                                <div className="pt-4 space-y-2">
                                    <p className="hover:text-[#8E24AA] transition-colors cursor-pointer flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8E24AA]"></span> wellness@soulsync.com
                                    </p>
                                    <p className="hover:text-[#8E24AA] transition-colors cursor-pointer flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8E24AA]"></span> +91 9763718186
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-32 pt-12 border-t border-[#3E2723]/10">
                        <p className="text-[#3E2723] text-sm font-bold opacity-40 uppercase tracking-widest">
                            © {new Date().getFullYear()} SoulSync • Healing starts within.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;

