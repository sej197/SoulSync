import React, { useState } from 'react';
import { User, Bell, Lock, Shield, ChevronRight, Moon, Globe } from 'lucide-react';

const Settings = () => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    

    return (
        <div className="bg-base-100 font-sans min-h-full text-base-content transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold">Settings</h1>
                    <p className="opacity-70 mt-2">Manage your account preferences and settings</p>
                </div>

                <div className="space-y-6">
                    {/* Account Section */}
                    <div className="bg-base-200/50 rounded-2xl shadow-soft overflow-hidden">
                        <div className="p-6 border-b border-base-300">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" /> Account
                            </h2>
                        </div>
                        <div className="divide-y divide-base-300">
                            <div className="p-4 hover:bg-base-200 transition-colors cursor-pointer flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Personal Information</p>
                                    <p className="text-sm opacity-70">Update your name and contact details</p>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-50" />
                            </div>
                            <div className="p-4 hover:bg-base-200 transition-colors cursor-pointer flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Password & Security</p>
                                    <p className="text-sm opacity-70">Manage your password and 2FA</p>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-50" />
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-base-200/50 rounded-2xl shadow-soft overflow-hidden">
                        <div className="p-6 border-b border-base-300">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" /> Notifications
                            </h2>
                        </div>
                        <div className="divide-y divide-base-300">
                            <div className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm opacity-70">Receive updates about your activity</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={emailNotifications}
                                    onChange={() => setEmailNotifications(!emailNotifications)}
                                />
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Push Notifications</p>
                                    <p className="text-sm opacity-70">Get notified on your device</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={pushNotifications}
                                    onChange={() => setPushNotifications(!pushNotifications)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* App Preferences */}
                    <div className="bg-base-200/50 rounded-2xl shadow-soft overflow-hidden">
                        <div className="p-6 border-b border-base-300">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" /> Preferences
                            </h2>
                        </div>
                        <div className="divide-y divide-base-300">
                            <div className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-base-300 rounded-lg opacity-80">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Language</p>
                                        <p className="text-sm opacity-70">English (US)</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-50" />
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-base-300 rounded-lg opacity-80">
                                        <Moon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Dark Mode</p>
                                        <p className="text-sm opacity-70">Switch between light and dark themes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center pt-8">
                    <button className="text-error text-sm hover:underline font-medium">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
