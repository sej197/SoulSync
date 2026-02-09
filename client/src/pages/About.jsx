import React from 'react';
import { Heart, Users, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
const About = () => {
    const [showPhilosophy, setShowPhilosophy] = React.useState(false);

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
                        <h2 className="text-4xl font-serif font-semibold text-bloom-secondary">
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

                        <button
                            onClick={() => setShowPhilosophy(!showPhilosophy)}
                            className={`btn btn-outline border-bloom-primary 
              text-bloom-secondary hover:bg-bloom-primary hover:text-white 
              rounded-full px-10 tracking-wide transition-all duration-300 ${showPhilosophy ? 'bg-bloom-primary text-white' : ''}`}>
                            {showPhilosophy ? 'Close Philosophy' : 'Read Our Philosophy'}
                        </button>

                        {/* Philosophy Content */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showPhilosophy ? 'max-h-[1000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-bloom-secondary/20 shadow-sm space-y-6">
                                <div>
                                    <h3 className="text-xl font-serif font-semibold text-bloom-dark mb-2">The Challenge</h3>
                                    <p className="text-bloom-muted leading-relaxed">
                                        Mental health challenges often develop gradually, with early warning signs like mood fluctuations or sleep disturbances.
                                        However, stigma and limited access to resources often delay support until symptoms become severe.
                                        Existing solutions are largely reactive, intervening only when it's too late.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-serif font-semibold text-bloom-dark mb-2">Our Objective</h3>
                                    <p className="text-bloom-muted leading-relaxed mb-4">
                                        We are building a <strong>preventive, technology-driven platform</strong> that:
                                    </p>
                                    <ul className="space-y-2 text-bloom-muted list-disc pl-5">
                                        <li>Detects early risk signals using AI-driven analysis</li>
                                        <li>Provides accessible, non-judgmental support</li>
                                        <li>Enables early intervention before conditions escalate</li>
                                        <li>Offers personalized insights and coping strategies</li>
                                        <li>Ensures privacy, transparency, and ethical AI usage</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Values */}
            <section className="py-24 bg-bloom-cream/90">
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
                            <h3 className="text-xl font-serif font-semibold mb-4 text-bloom-secondary">
                                Compassion First
                            </h3>
                            <p className="text-bloom-muted">
                                A safe space to express emotions, track mental health,
                                and feel genuinely heard.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-3xl p-8 text-center shadow-soft
              hover:-translate-y-1 transition-all duration-300 border-t-4 border-bloom-primary">
                            <div className="flex justify-center mb-6">
                                <div className="p-5 bg-bloom-primary/10 rounded-full text-bloom-primary">
                                    <Users size={30} />
                                </div>
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-4 text-bloom-secondary">
                                Community Focused
                            </h3>
                            <p className="text-bloom-muted">
                                Building meaningful connections through shared
                                experiences and support.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white rounded-3xl p-8 text-center shadow-soft
              hover:-translate-y-1 transition-all duration-300 border-t-4 border-bloom-primary">
                            <div className="flex justify-center mb-6">
                                <div className="p-5 bg-bloom-primary/10 rounded-full text-bloom-primary">
                                    <CheckCircle size={30} />
                                </div>
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-4 text-bloom-secondary">
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

            {/* Contact Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif font-medium text-bloom-secondary mb-12">
                        Contact Us
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        {/* Location 1 */}
                        <div className="space-y-4 p-6 rounded-2xl bg-white/50 backdrop-blur-sm">
                            <h3 className="text-xl font-medium text-bloom-primary">Main Clinic</h3>
                            <div className="space-y-2 text-bloom-muted">
                                <p>123 Serenity Avenue, Suite 100</p>
                                <p>New York, NY 10012</p>
                                <p className="pt-2 hover:text-bloom-primary transition-colors cursor-pointer">hello@soulsync.com</p>
                                <p className="hover:text-bloom-primary transition-colors cursor-pointer">+1 (555) 123-4567</p>
                            </div>
                        </div>

                        {/* Location 2 */}
                        <div className="space-y-4 p-6 rounded-2xl bg-white/50 backdrop-blur-sm">
                            <h3 className="text-xl font-medium text-bloom-primary">Wellness Center</h3>
                            <div className="space-y-2 text-bloom-muted">
                                <p>456 Blossom Lane, Floor 2</p>
                                <p>Brooklyn, NY 11201</p>
                                <p className="pt-2 hover:text-bloom-primary transition-colors cursor-pointer">wellness@soulsync.com</p>
                                <p className="hover:text-bloom-primary transition-colors cursor-pointer">+1 (555) 987-6543</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-bloom-muted/20">
                        <p className="text-bloom-muted text-sm font-medium">
                            © {new Date().getFullYear()} SoulSync. All rights reserved.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
