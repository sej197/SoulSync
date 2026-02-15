import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0f0f1a] text-gray-300 border-t border-white/5 font-sans">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="text-3xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-bloom-primary to-bloom-secondary">
                            SoulSync
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Your sanctuary for mental wellness. <br />
                            Track, reflect, and grow with us.
                        </p>
                        <div className="flex gap-4 pt-2">
                            {/* Social Icons */}
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-bloom-primary hover:text-white transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-bloom-primary hover:text-white transition-all duration-300">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-bloom-primary hover:text-white transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h6 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Services</h6>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/journal" className="hover:text-bloom-primary transition-colors">Daily Journal</Link></li>
                            <li><Link to="/daily-quiz" className="hover:text-bloom-primary transition-colors">Mood Check-in</Link></li>
                            <li><Link to="/insights" className="hover:text-bloom-primary transition-colors">Analytics</Link></li>
                            <li><Link to="/chatbot" className="hover:text-bloom-primary transition-colors">AI Support</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h6 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h6>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/about" className="hover:text-bloom-primary transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-bloom-primary transition-colors">Contact</Link></li>
                            <li><Link to="/privacy" className="hover:text-bloom-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-bloom-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h6 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Stay Connected</h6>
                        <p className="text-sm text-gray-400 mb-4">Join our newsletter for wellness tips.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bloom-primary/50 focus:ring-1 focus:ring-bloom-primary/50 transition-all placeholder-gray-600"
                            />
                            <button className="absolute right-2 top-2 p-1.5 bg-bloom-primary text-white rounded-lg hover:bg-bloom-primary/80 transition-colors">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-16 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} SoulSync. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
                        <Link to="/terms" className="hover:text-gray-300">Terms</Link>
                        <Link to="/cookies" className="hover:text-gray-300">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
