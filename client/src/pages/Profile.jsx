import React from 'react';
import { User, Mail, MapPin, Calendar, Edit2, Camera } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/profile/Badge';
import { BADGE_DEFINITIONS } from '../utils/badgeDefinitions';
import StreakStats from '../components/StreakStats';

const Profile = () => {
    const { user } = useContext(AuthContext);

    // Fallback/Loading state if user is not yet loaded
    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-base-100 text-primary">Loading Profile...</div>;
    }

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
                <div className="blob-shape bg-[#FFE0B2] w-[500px] h-[500px] top-[-10%] right-[-5%] animate-morph opacity-60"></div>
                <div className="blob-shape bg-[#B2DFDB] w-[400px] h-[400px] bottom-[10%] left-[-10%] animate-morph opacity-50" style={{ animationDelay: '-2s' }}></div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">

                    <div className="bg-gradient-to-r from-[#FFCC80] to-[#EF6C00] h-48 relative">
                        <div className="absolute bottom-[-50px] left-8">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl flex items-center justify-center overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=EF6C00&color=fff`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg text-[#3E2723] hover:text-[#EF6C00] transition-all hover:scale-110">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                    </div>


                    <div className="pt-16 pb-10 px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <div>
                                <h1 className="text-4xl font-serif font-bold text-[#3E2723]">{user.name || 'User'}</h1>
                                <p className="text-[#5D4037] font-medium flex items-center gap-2 mt-2 opacity-80">
                                    <Mail className="w-4 h-4 text-[#EF6C00]" /> {user.email}
                                </p>
                            </div>
                            <Link
                                to="/profile/edit"
                                className="group btn bg-[#EF6C00] hover:bg-[#E65100] text-white border-none rounded-full px-8 shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 flex items-center gap-2 h-12"
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </Link>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                            <div className="md:col-span-2 space-y-10">
                                <StreakStats />

                                <section>
                                    <h2 className="text-lg font-bold mb-3 font-serif border-b border-base-300 pb-2">Risk Assessment</h2>
                                    <div className="p-4 bg-base-200 rounded-xl">
                                        <p className="text-sm opacity-70 mb-2">Current Risk Level</p>
                                        <p className={`text-2xl font-bold ${user.current_risk?.level === 'LOW' ? 'text-success' :
                                                user.current_risk?.level === 'MODERATE' ? 'text-warning' :
                                                    user.current_risk?.level === 'HIGH' ? 'text-error' : 'text-base-content'
                                            }`}>
                                            {user.current_risk?.level || 'N/A'}
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <h2 className="text-2xl font-serif font-bold text-[#3E2723]">Badges & Communities</h2>
                                        <div className="flex-1 h-[2px] bg-[#FFCC80] opacity-30 rounded-full"></div>
                                    </div>
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-sm font-bold text-[#8D6E63] uppercase tracking-wider mb-4">Badges</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                                {BADGE_DEFINITIONS.map((badgeDef) => {
                                                    const isEarned = user.badges?.includes(badgeDef.id);
                                                    return (
                                                        <Badge
                                                            key={badgeDef.id}
                                                            badge={badgeDef}
                                                            isLocked={!isEarned}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#8D6E63] uppercase tracking-wider mb-4">Communities</h3>
                                            <div className="flex flex-wrap gap-3">
                                                {user.communities && user.communities.length > 0 ? (
                                                    user.communities.map((c, i) => (
                                                        <span key={c._id || i} className="px-5 py-2 rounded-full bg-[#E0F2F1] text-[#00695C] font-bold text-sm border border-[#B2DFDB]">{c.name || c}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-[#8D6E63] italic font-medium">Join a community to share your journey</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>


                            <div className="space-y-6">
                                <div className="p-8 bg-[#FFF8E1] rounded-[2rem] border border-[#FFE0B2] shadow-sm">
                                    <h3 className="text-xl font-serif font-bold text-[#3E2723] mb-6 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-[#EF6C00] rounded-full"></div>
                                        Details
                                    </h3>
                                    <ul className="space-y-5 text-[#5D4037] font-medium">
                                        <li className="flex flex-col gap-1">
                                            <span className="text-xs text-[#8D6E63] uppercase font-bold tracking-widest flex items-center gap-2">
                                                <User className="w-3 h-3" /> Gender
                                            </span>
                                            <span className="text-lg">{user.gender || 'Not set'}</span>
                                        </li>
                                        <li className="flex flex-col gap-1">
                                            <span className="text-xs text-[#8D6E63] uppercase font-bold tracking-widest flex items-center gap-2">
                                                <Calendar className="w-3 h-3" /> Age
                                            </span>
                                            <span className="text-lg">{user.age || 'Not set'}</span>
                                        </li>
                                        <li className="flex flex-col gap-1">
                                            <span className="text-xs text-[#8D6E63] uppercase font-bold tracking-widest flex items-center gap-2">
                                                <MapPin className="w-3 h-3" /> Location
                                            </span>
                                            <span className="text-lg">{user.location || 'Not set'}</span>
                                        </li>
                                        <li className="flex flex-col gap-1">
                                            <span className="text-xs text-[#8D6E63] uppercase font-bold tracking-widest flex items-center gap-2">
                                                📞 Contact
                                            </span>
                                            <span className="text-lg">{user.contact || 'Not set'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
