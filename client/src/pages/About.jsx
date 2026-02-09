import React from 'react';
import { Heart, Users, CheckCircle } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-base-100">

            {/* Hero Section */}
            <div className="hero min-h-[60vh] bg-bloom-cream relative overflow-hidden">
                <div className="absolute top-0 right-[-10%] w-[40%] h-full 
          bg-gradient-to-br from-bloom-secondary/40 to-bloom-primary/20 
          rounded-l-full blur-[120px]" />

                <div className="hero-content text-center relative z-10">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl md:text-6xl font-serif font-semibold text-bloom-dark mb-6 leading-tight">
                            Healing starts with{" "}
                            <span className="text-bloom-primary italic">understanding</span>
                        </h1>
                        <p className="py-6 text-lg text-bloom-muted leading-relaxed">
                            At SoulSync, we believe in a holistic approach to mental wellness.
                            We create a safe, nurturing space for you to bloom and grow.
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Story */}
            <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2">
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-28 h-28 
                bg-bloom-secondary rounded-full opacity-40" />

                            <img
                                src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2070&auto=format&fit=crop"
                                alt="Therapy Session"
                                className="relative z-10 rounded-3xl shadow-soft w-full h-[500px] object-cover"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-6">
                        <h2 className="text-4xl font-serif font-semibold text-bloom-dark">
                            Our Story
                        </h2>

                        <p className="text-bloom-muted text-lg leading-relaxed">
                            Founded in 2026, SoulSync emerged from a simple yet profound
                            realization: mental health care needed to be more accessible,
                            compassionate, and human-centered.
                        </p>

                        <p className="text-bloom-muted text-lg leading-relaxed">
                            Inspired by nature’s resilience, we believe every individual has
                            the capacity to heal, grow, and thrive — just like flowers after
                            the rain.
                        </p>

                        <button className="btn btn-outline border-bloom-primary 
              text-bloom-primary hover:bg-bloom-primary hover:text-white 
              rounded-full px-10 tracking-wide">
                            Read Our Philosophy
                        </button>
                    </div>
                </div>
            </section>

            {/* Mission & Values */}
            <section className="py-24 bg-bloom-cream/60">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif font-semibold text-bloom-dark mb-4">
                            Our Mission & Values
                        </h2>
                        <p className="text-bloom-muted max-w-2xl mx-auto text-lg">
                            We are guided by principles that put empathy, care,
                            and community first.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                        {/* Card 1 */}
                        <div className="bg-white rounded-3xl p-8 text-center shadow-soft
              hover:-translate-y-1 transition-all duration-300 border-t-4 border-bloom-primary">
                            <div className="flex justify-center mb-6">
                                <div className="p-5 bg-bloom-primary/10 rounded-full text-bloom-primary">
                                    <Heart size={30} />
                                </div>
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-4">
                                Compassion First
                            </h3>
                            <p className="text-bloom-muted">
                                A safe space to express emotions, track mental health,
                                and feel genuinely heard.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-3xl p-8 text-center shadow-soft
              hover:-translate-y-1 transition-all duration-300 border-t-4 border-bloom-secondary">
                            <div className="flex justify-center mb-6">
                                <div className="p-5 bg-bloom-secondary/30 rounded-full text-bloom-primary">
                                    <Users size={30} />
                                </div>
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-4">
                                Community Focused
                            </h3>
                            <p className="text-bloom-muted">
                                Building meaningful connections through shared
                                experiences and support.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white rounded-3xl p-8 text-center shadow-soft
              hover:-translate-y-1 transition-all duration-300 border-t-4 border-bloom-primary/40">
                            <div className="flex justify-center mb-6">
                                <div className="p-5 bg-bloom-primary/10 rounded-full text-bloom-primary">
                                    <CheckCircle size={30} />
                                </div>
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-4">
                                Trusted Care
                            </h3>
                            <p className="text-bloom-muted">
                                Backed by research, empathy, and a commitment
                                to your long-term wellbeing.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-28 bg-bloom-primary text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-serif font-semibold mb-6">
                        Ready to start your journey?
                    </h2>
                    <p className="mb-10 text-lg opacity-90">
                        Take the first step toward a calmer mind.
                        We’re here to listen.
                    </p>
                    <button className="btn bg-white/10 border border-white/40 
            hover:bg-white/20 text-white px-12 rounded-full backdrop-blur-md">
                        Contact Us
                    </button>
                </div>
            </section>

        </div>
    );
};

export default About;
