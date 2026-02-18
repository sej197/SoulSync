import React from 'react';
import { User, Mail, MapPin, Calendar, Edit2, Camera } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import StreakStats from '../components/StreakStats';

const Profile = () => {
    const { user } = useContext(AuthContext);

    // Fallback/Loading state if user is not yet loaded
    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-base-100 text-primary">Loading Profile...</div>;
    }

    return (
        <div className="bg-base-100 font-sans min-h-full text-base-content transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-base-200/50 rounded-2xl shadow-soft overflow-hidden">
                    
                    <div className="bg-bloom-primary h-40 relative">
                        <div className="absolute bottom-[-50px] left-8">
                            <div className="w-32 h-32 rounded-full border-4 border-base-100 bg-base-100 shadow-md flex items-center justify-center overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=d17cf5&color=fff`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-base-100 rounded-full shadow-md text-base-content hover:text-primary transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    
                    <div className="pt-16 pb-8 px-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-serif font-bold">{user.name || 'User'}</h1>
                                <p className="opacity-70 flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4" /> {user.email}
                                </p>
                            </div>
                            <Link 
                                to="/profile/edit"
                                className="btn btn-outline btn-sm gap-2 border-base-300 hover:bg-primary hover:text-white hover:border-primary"
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </Link>
                        </div>

                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            <div className="md:col-span-2 space-y-6">
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
                                    <h2 className="text-lg font-bold mb-3 font-serif border-b border-base-300 pb-2">Communities & Badges</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-semibold opacity-70 mb-2">Communities</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {user.communities && user.communities.length > 0 ? (
                                                    user.communities.map((c, i) => (
                                                        <span key={i} className="badge badge-primary badge-outline p-3">{c}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm opacity-50 italic">{user.communities || 'No communities joined yet'}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold opacity-70 mb-2">Badges</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {user.badges && user.badges.length > 0 ? (
                                                    user.badges.map((b, i) => (
                                                        <span key={i} className="badge badge-secondary p-3">{b}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm opacity-50 italic">{user.badges || 'No badges earned yet'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            
                            <div className="space-y-6">
                                <div className="p-6 bg-base-200 rounded-xl border border-base-300">
                                    <h3 className="font-bold mb-4 font-serif">Personal Details</h3>
                                    <ul className="space-y-3 text-sm opacity-80">
                                        <li className="flex items-center gap-3 justify-between">
                                            <span className="flex items-center gap-2"><User className="w-4 h-4" /> Gender</span>
                                            <span className="font-medium">{user.gender || 'Not set'}</span>
                                        </li>
                                        <li className="flex items-center gap-3 justify-between">
                                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Age</span>
                                            <span className="font-medium">{user.age || 'Not set'}</span>
                                        </li>
                                        <li className="flex items-center gap-3 justify-between">
                                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                                            <span className="font-medium">{user.location || 'Not set'}</span>
                                        </li>
                                        <li className="flex items-center gap-3 justify-between">
                                            <span className="flex items-center gap-2">📞 Contact</span>
                                            <span className="font-medium">{user.contact || 'Not set'}</span>
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
