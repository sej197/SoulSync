import React, { useState } from 'react';
import { User, Bell, Lock, Shield, ChevronRight, Moon, Globe } from 'lucide-react';

const Settings = () => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);


    return (
        <div className="min-h-screen bg-[#F3E5F5] text-[#3E2723] selection:bg-[#FFCC80] selection:text-[#3E2723] font-sans relative overflow-hidden">

            <style>
                {`
                    @keyframes morph {
                        0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                        50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                        100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    }
                    .animate-morph { animation: morph 10s ease-in-out infinite; }
                    .blob-shape {
                        position: absolute;
                        mix-blend-mode: multiply;
                        filter: blur(80px);
                    }
                `}
            </style>

            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="blob-shape bg-[#FFE0B2] w-[450px] h-[450px] top-[-10%] left-[-5%] animate-morph opacity-60"></div>
                <div className="blob-shape bg-[#B3E5FC] w-[400px] h-[400px] bottom-[10%] right-[-10%] animate-morph opacity-50" style={{ animationDelay: '-4s' }}></div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3E2723]">Settings</h1>
                    <div className="w-20 h-1.5 bg-[#FFCC80] rounded-full mx-auto mt-4 opacity-60"></div>
                    <p className="text-[#5D4037] font-medium mt-4 opacity-80">Manage your account preferences and settings</p>
                </div>

                <div className="space-y-8">
                    {/* Account Section */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-serif font-bold flex items-center gap-3 text-[#3E2723]">
                                <div className="p-3 bg-[#FFF3E0] rounded-2xl text-[#EF6C00]">
                                    <User className="w-6 h-6" />
                                </div>
                                Account
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {[
                                { title: 'Personal Information', desc: 'Update your name and contact details' },
                                { title: 'Password & Security', desc: 'Manage your password and 2FA' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 hover:bg-[#FAFAFA] transition-all cursor-pointer flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold text-[#3E2723] text-lg">{item.title}</p>
                                        <p className="text-[#5D4037] opacity-70 font-medium">{item.desc}</p>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-[#EF6C00] opacity-40 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-2xl font-serif font-bold flex items-center gap-3 text-[#3E2723]">
                                <div className="p-3 bg-[#E1F5FE] rounded-2xl text-[#0277BD]">
                                    <Bell className="w-6 h-6" />
                                </div>
                                Notifications
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {[
                                { title: 'Email Notifications', desc: 'Receive updates about your activity', state: emailNotifications, setter: setEmailNotifications },
                                { title: 'Push Notifications', desc: 'Get notified on your device', state: pushNotifications, setter: setPushNotifications }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-[#3E2723] text-lg">{item.title}</p>
                                        <p className="text-[#5D4037] opacity-70 font-medium">{item.desc}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-warning scale-125"
                                        checked={item.state}
                                        onChange={() => item.setter(!item.state)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* App Preferences */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-2xl font-serif font-bold flex items-center gap-3 text-[#3E2723]">
                                <div className="p-3 bg-[#F3E5F5] rounded-2xl text-[#8E24AA]">
                                    <Shield className="w-6 h-6" />
                                </div>
                                Preferences
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            <div className="p-6 hover:bg-[#FAFAFA] transition-all cursor-pointer flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-2xl text-[#3E2723] opacity-70">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#3E2723] text-lg">Language</p>
                                        <p className="text-[#5D4037] opacity-70 font-medium">English (US)</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-[#EF6C00] opacity-40 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="p-6 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-2xl text-[#3E2723] opacity-70">
                                        <Moon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#3E2723] text-lg">Dark Mode</p>
                                        <p className="text-[#5D4037] opacity-70 font-medium">Switch between light and dark themes</p>
                                    </div>
                                </div>
                                <div className="text-[#8D6E63] font-bold text-sm uppercase tracking-widest bg-gray-100 px-4 py-1 rounded-full">Coming Soon</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-12">
                    <button className="text-[#d32f2f] text-sm hover:underline font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
