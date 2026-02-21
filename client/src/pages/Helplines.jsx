import React, { useState, useEffect, useContext } from 'react';
import {
    Phone,
    Clock,
    HelpCircle,
    ShieldCheck,
    Heart,
    ExternalLink,
    MessageCircle,
    AlertCircle,
    Bell,
    Users
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Helplines() {
    const { user } = useContext(AuthContext);
    const [scrollY, setScrollY] = useState(0);
    const [loadingNotify, setLoadingNotify] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNotifyContacts = async () => {
        if (!user?.emergency_contacts || user.emergency_contacts.length === 0) {
            toast.error('No emergency contacts set. Please add them in Edit Profile.');
            return;
        }

        setLoadingNotify(true);
        try {
            const response = await axios.post('/api/notify/notify-contacts', {}, { withCredentials: true });
            toast.success(`Notifications sent to ${response.data.results?.length || 'emergency contacts'}!`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to send notifications';
            toast.error(errorMsg);
        } finally {
            setLoadingNotify(false);
        }
    };

    const helplines = [
        {
            name: "Vandrevala Foundation",
            number: "1860 266 2345",
            type: "Mental Health Support",
            hours: "24/7 Available",
            description: "Crisis intervention and emotional support for individuals in distress.",
            icon: Heart,
            color: "bg-[#E1F5FE]",
            textColor: "text-[#0277BD]"
        },
        {
            name: "NIMHANS Helpline",
            number: "080 46110007",
            type: "Govt. Institution",
            hours: "24/7 Available",
            description: "Psychosocial support and mental health services by trained professionals.",
            icon: ShieldCheck,
            color: "bg-[#E0F2F1]",
            textColor: "text-[#00695C]"
        },
        {
            name: "AASRA Helpline",
            number: "9820466726",
            type: "Crisis Intervention",
            hours: "24/7 Available",
            description: "Confidential emotional support for people who are suicidal or in despair.",
            icon: AlertCircle,
            color: "bg-[#FFF3E0]",
            textColor: "text-[#EF6C00]"
        },
        {
            name: "iCall (TISS)",
            number: "9152987821",
            type: "Counseling Service",
            hours: "Mon-Sat: 10AM-8PM",
            description: "Counseling services provided by the Tata Institute of Social Sciences.",
            icon: HelpCircle,
            color: "bg-[#F3E5F5]",
            textColor: "text-[#8E24AA]"
        },
        {
            name: "Kiran Helpline",
            number: "1800-599-0019",
            type: "Ministry of Social Justice",
            hours: "24/7 Available",
            description: "Mental health rehabilitation helpline for screening and first aid.",
            icon: Phone,
            color: "bg-[#FBE9E7]",
            textColor: "text-[#D84315]"
        },
        {
            name: "Sangath (Adveka)",
            number: "011-41192929",
            type: "Psychological Support",
            hours: "10AM-6PM Daily",
            description: "Inclusive mental health services and community-based interventions.",
            icon: MessageCircle,
            color: "bg-[#FFFDE7]",
            textColor: "text-[#FBC02D]"
        }
    ];

    return (
        <div className="min-h-screen bg-[#F3E5F5] text-slate-800 overflow-x-hidden relative font-sans pt-20">

            {/* Background Blobs (Similar to Home) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute bg-[#FFE0B2] w-[600px] h-[600px] top-[-15%] right-[-10%] rounded-full opacity-40 blur-3xl animate-pulse"
                    style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                ></div>
                <div
                    className="absolute bg-[#B2DFDB] w-[500px] h-[500px] top-[40%] left-[-15%] rounded-full opacity-30 blur-3xl"
                    style={{ transform: `translateY(${scrollY * -0.05}px)` }}
                ></div>
                <div
                    className="absolute bg-[#FFCCBC] w-[700px] h-[700px] bottom-[-10%] right-[10%] rounded-full opacity-40 blur-3xl animate-pulse"
                    style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                ></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-20">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#3E2723] leading-tight">
                        You're Not <span className="text-[#EF6C00]">Alone</span>.
                    </h1>
                    <p className="text-xl text-[#5D4037] font-medium leading-relaxed opacity-90">
                        If you're going through a tough time, these professional helplines are dedicated to listening and providing the support you need. Help is just a phone call away.
                    </p>
                    <div className="w-24 h-2 bg-[#FFCC80] rounded-full mx-auto opacity-60"></div>
                </div>

                {/* Helplines Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {helplines.map((helpline, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/60 relative overflow-hidden"
                        >
                            {/* Subtle background shape */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 ${helpline.color} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${helpline.color} ${helpline.textColor} flex items-center justify-center shadow-sm`}>
                                        <helpline.icon size={28} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-[#8D6E63]">{helpline.type}</span>
                                        <h3 className="text-2xl font-serif font-bold text-[#3E2723]">{helpline.name}</h3>
                                    </div>
                                </div>

                                <p className="text-[#5D4037] text-lg leading-relaxed mb-6 flex-grow">
                                    {helpline.description}
                                </p>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-[#5D4037]">
                                        <Clock size={18} className="text-[#8D6E63]" />
                                        <span className="font-medium">{helpline.hours}</span>
                                    </div>

                                    <a
                                        href={`tel:${helpline.number.replace(/\s/g, '')}`}
                                        className={`flex items-center justify-between gap-3 w-full px-6 py-4 rounded-2xl ${helpline.color} ${helpline.textColor} font-bold text-xl hover:shadow-md transition-all group/btn`}
                                    >
                                        <span>{helpline.number}</span>
                                        <Phone className="group-hover/btn:rotate-12 transition-transform" size={24} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Emergency Contacts Section */}
                {user && user.emergency_contacts && user.emergency_contacts.length > 0 && (
                    <div className="mt-20 max-w-3xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#FCE4EC] text-[#C2185B] flex items-center justify-center">
                                    <Users size={28} />
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-[#3E2723]">Your Support Circle</h2>
                            </div>

                            <p className="text-[#5D4037] mb-8 text-lg">
                                Your emergency contacts have been saved. When you need support, reach out to them anytime.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                {user.emergency_contacts.map((contact, idx) => (
                                    <div
                                        key={idx}
                                        className="p-5 bg-[#FFF8E1] rounded-2xl border border-[#FFE0B2] flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#FFCC80] flex items-center justify-center flex-shrink-0">
                                            <Phone className="text-[#EF6C00]" size={20} />
                                        </div>
                                        <span className="text-[#5D4037] font-semibold">{contact}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleNotifyContacts}
                                disabled={loadingNotify}
                                className="w-full py-4 px-6 rounded-2xl bg-[#D32F2F] hover:bg-[#B71C1C] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-300 transition-all transform hover:-translate-y-1"
                            >
                                <Bell size={24} />
                                {loadingNotify ? 'Notifying...' : 'Notify Emergency Contacts'}
                            </button>

                            <p className="text-xs text-[#8D6E63] text-center mt-4 italic">
                                💡 Use this to let your support circle know you need them
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer Note */}
                <div className="mt-24 text-center bg-white/40 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 max-w-4xl mx-auto">
                    <div className="inline-block p-4 rounded-2xl bg-orange-100 text-orange-600 mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-[#3E2723] mb-4">Emergency Assistance</h2>
                    <p className="text-lg text-[#5D4037] leading-relaxed mb-6">
                        In case of immediate threat to life or a medical emergency, please contact your local emergency services (e.g., dial <b>100</b> or <b>102</b> in India) or visit the nearest hospital emergency room.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="px-6 py-2 bg-white rounded-full text-sm font-bold shadow-sm">Confidential</span>
                        <span className="px-6 py-2 bg-white rounded-full text-sm font-bold shadow-sm">Professional Support</span>
                        <span className="px-6 py-2 bg-white rounded-full text-sm font-bold shadow-sm">Compassionate Care</span>
                    </div>
                </div>
            </div>
        </div>
    );
}