import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Plus,
    LogIn,
    LogOut,
    CheckCircle,
    XCircle,
    Search,
    Crown,
    Lock,
    Globe,
    Clock,
    ShieldCheck,
    Heart,
    ArrowRight,
    Loader2,
    Eye,
    SendHorizonal,
    Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    fetchCommunities,
    fetchMyCommunities,
    createCommunityApi,
    joinCommunityApi,
    leaveCommunityApi,
    approveRequestApi,
    rejectRequestApi
} from '../lib/communityApi';

export default function CommunityExplore() {
    const [scrollY, setScrollY] = useState(0);
    const [activeTab, setActiveTab] = useState('browse');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCommunity, setNewCommunity] = useState({
        name: '',
        description: '',
        is_private: false
    });
    const navigate = useNavigate();

    const [communities, setCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState('');

    const loadCommunities = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchCommunities(searchTerm);
            setCommunities(res.data.communities || []);
        } catch (err) {
            toast.error('Failed to load communities');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const loadMyCommunities = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchMyCommunities();
            const myComms = res.data.communities || [];
            setMyCommunities(myComms);

            const allRequests = [];
            myComms.forEach(comm => {
                if (comm.pending_requests && comm.pending_requests.length > 0) {
                    comm.pending_requests.forEach(user => {
                        if (typeof user === 'object' && user._id) {
                            allRequests.push({
                                _id: user._id,
                                username: user.username || user.name || user.email || 'Unknown User',
                                communityName: comm.name,
                                communityId: comm._id
                            });
                        } else {
                            allRequests.push({
                                _id: user,
                                username: 'User',
                                communityName: comm.name,
                                communityId: comm._id
                            });
                        }
                    });
                }
            });
            setPendingRequests(allRequests);
        } catch (err) {
            toast.error('Failed to load your communities');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'browse') loadCommunities();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, activeTab, loadCommunities]);

    useEffect(() => {
        if (activeTab === 'browse') {
            loadCommunities();
        } else if (activeTab === 'mine' || activeTab === 'requests') {
            loadMyCommunities();
        }
    }, [activeTab, loadCommunities, loadMyCommunities]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const colorPalettes = [
        { bg: 'bg-[#E1F5FE]', text: 'text-[#0277BD]' },
        { bg: 'bg-[#E0F2F1]', text: 'text-[#00695C]' },
        { bg: 'bg-[#F3E5F5]', text: 'text-[#8E24AA]' },
        { bg: 'bg-[#E8EAF6]', text: 'text-[#3949AB]' },
        { bg: 'bg-[#FBE9E7]', text: 'text-[#D84315]' },
        { bg: 'bg-[#E0F7FA]', text: 'text-[#00838F]' },
    ];

    const getColor = (index) => colorPalettes[index % colorPalettes.length];

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setActionLoading('create');
            const res = await createCommunityApi(newCommunity);
            toast.success(res.data.message);
            setNewCommunity({ name: '', description: '', is_private: false });
            setShowCreateModal(false);
            loadCommunities();
            loadMyCommunities();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create community');
        } finally {
            setActionLoading('');
        }
    };

    const handleJoin = async (communityId) => {
        try {
            setActionLoading(communityId);
            const res = await joinCommunityApi(communityId);
            toast.success(res.data.message);
            await loadCommunities();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join');
        } finally {
            setActionLoading('');
        }
    };

    const handleLeave = async (communityId) => {
        try {
            setActionLoading(communityId);
            const res = await leaveCommunityApi(communityId);
            toast.success(res.data.message);
            await loadCommunities();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to leave');
        } finally {
            setActionLoading('');
        }
    };

    const handleApprove = async (communityId, userId) => {
        try {
            setActionLoading(`approve-${userId}`);
            const res = await approveRequestApi(communityId, userId);
            toast.success(res.data.message);
            await loadMyCommunities();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading('');
        }
    };

    const handleReject = async (communityId, userId) => {
        try {
            setActionLoading(`reject-${userId}`);
            const res = await rejectRequestApi(communityId, userId);
            toast.success(res.data.message);
            await loadMyCommunities();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading('');
        }
    };

    const renderCommunityActions = (community) => {
        const isBusy = actionLoading === community._id;

        // ─── STATE 1: User is the CREATOR ───
        if (community.isCreator) {
            return (
                <button
                    onClick={() => navigate(`/communities/${community._id}`)}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl bg-[#7B1FA2] text-white font-bold hover:bg-[#6A1B9A] hover:shadow-md transition-all"
                >
                    <Settings size={18} />
                    Manage Community
                </button>
            );
        }

        // ─── STATE 2: User is a MEMBER (not creator) ───
        if (community.isMember) {
            return (
                <div className="space-y-2">
                    <button
                        onClick={() => navigate(`/communities/${community._id}`)}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl bg-[#7B1FA2] text-white font-bold hover:bg-[#6A1B9A] hover:shadow-md transition-all"
                    >
                        <Eye size={18} />
                        View Community
                    </button>
                    <button
                        onClick={() => handleLeave(community._id)}
                        disabled={isBusy}
                        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-2xl bg-[#FBE9E7] text-[#D84315] font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                        {isBusy ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                        Leave Community
                    </button>
                </div>
            );
        }

        // ─── STATE 3: User has REQUESTED (pending approval) ───
        if (community.pendingRequest) {
            return (
                <div className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl bg-[#E1F5FE] text-[#0277BD] font-bold border border-[#B3E5FC] cursor-default select-none">
                    <SendHorizonal size={18} />
                    Requested
                </div>
            );
        }

        // ─── STATE 4: User is NOT a member ───
        return (
            <button
                onClick={() => handleJoin(community._id)}
                disabled={isBusy}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl bg-[#7B1FA2] text-white font-bold hover:bg-[#6A1B9A] hover:shadow-md transition-all disabled:opacity-50"
            >
                {isBusy ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                {community.is_private ? 'Request to Join' : 'Join Community'}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#F3E5F5] text-slate-800 overflow-x-hidden relative font-sans pt-10">

            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute bg-[#CE93D8] w-[600px] h-[600px] top-[-15%] right-[-10%] rounded-full opacity-30 blur-3xl animate-pulse"
                    style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                />
                <div
                    className="absolute bg-[#B2DFDB] w-[500px] h-[500px] top-[40%] left-[-15%] rounded-full opacity-30 blur-3xl"
                    style={{ transform: `translateY(${scrollY * -0.05}px)` }}
                />
                <div
                    className="absolute bg-[#D1C4E9] w-[700px] h-[700px] bottom-[-10%] right-[10%] rounded-full opacity-35 blur-3xl animate-pulse"
                    style={{ transform: `translateY(${scrollY * 0.1}px)` }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-8 pb-12">

                {/* Back Button + Page Header */}
                <div className="max-w-7xl mx-auto mb-8">
                    <button
                        onClick={() => navigate('/communities')}
                        className="flex items-center gap-2 text-[#7B1FA2] font-bold mb-5 hover:underline transition-all"
                    >
                        <ArrowRight size={18} className="rotate-180" />
                        Back
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-4xl font-serif font-bold text-[#3E2723]">
                            Communities
                        </h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7B1FA2] text-white rounded-2xl font-bold hover:bg-[#6A1B9A] transition-all shadow-lg hover:shadow-xl"
                        >
                            <Plus size={20} />
                            Create Community
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-9">
                    {[
                        { key: 'browse', label: 'Browse Communities', icon: Globe },
                        { key: 'mine', label: 'My Communities', icon: Crown },
                        { key: 'requests', label: 'Pending Requests', icon: Clock },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-base transition-all ${
                                activeTab === tab.key
                                    ? 'bg-[#7B1FA2] text-white shadow-lg'
                                    : 'bg-white/60 text-[#5D4037] hover:bg-white/80 border border-white/60'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.key === 'requests' && pendingRequests.length > 0 && (
                                <span className="ml-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <Loader2 size={40} className="animate-spin text-[#7B1FA2]" />
                    </div>
                )}

                {/* Search Bar */}
                {activeTab === 'browse' && !loading && (
                    <div className="max-w-2xl mx-auto mb-9">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8D6E63]" size={22} />
                            <input
                                type="text"
                                placeholder="Search communities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 text-[#3E2723] placeholder-[#8D6E63] font-medium text-lg focus:outline-none focus:ring-2 focus:ring-[#CE93D8] shadow-md transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Browse Communities */}
                {activeTab === 'browse' && !loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {communities.length === 0 ? (
                            <div className="col-span-full text-center py-16 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60">
                                <Users className="mx-auto text-[#CE93D8] mb-4" size={48} />
                                <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-2">No Communities Found</h3>
                                <p className="text-[#5D4037]">Try a different search or create a new one!</p>
                            </div>
                        ) : (
                            communities.map((community, index) => {
                                const palette = getColor(index);
                                return (
                                    <div
                                        key={community._id}
                                        className="group bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/60 relative overflow-hidden"
                                    >
                                        <div className={`absolute -top-10 -right-10 w-32 h-32 ${palette.bg} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`} />

                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-14 h-14 rounded-2xl ${palette.bg} ${palette.text} flex items-center justify-center shadow-sm`}>
                                                    {community.is_private ? <Lock size={28} /> : <Users size={28} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-[#8D6E63]">
                                                            {community.is_private ? 'Private' : 'Public'}
                                                        </span>
                                                        {community.isCreator && (
                                                            <span className="text-xs font-bold uppercase tracking-widest text-[#8E24AA] bg-[#F3E5F5] px-2 py-0.5 rounded-full">
                                                                Creator
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-xl font-serif font-bold text-[#3E2723]">
                                                        {community.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <p className="text-[#5D4037] text-base leading-relaxed mb-6 flex-grow">
                                                {community.description}
                                            </p>

                                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                                <div className="flex items-center justify-between text-[#5D4037]">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={16} className="text-[#8D6E63]" />
                                                        <span className="font-medium text-sm">{community.member_count} members</span>
                                                    </div>
                                                </div>

                                                {renderCommunityActions(community)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* My Created Communities */}
                {activeTab === 'mine' && !loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {myCommunities.map((community, index) => {
                            const palette = getColor(index + 2);
                            return (
                                <div
                                    key={community._id}
                                    className="group bg-white rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/60 relative overflow-hidden"
                                >
                                    <div className={`absolute -top-10 -right-10 w-32 h-32 ${palette.bg} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`} />

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-14 h-14 rounded-2xl ${palette.bg} ${palette.text} flex items-center justify-center shadow-sm`}>
                                                <Crown size={28} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-widest text-[#8D6E63]">
                                                    Created by You
                                                </span>
                                                <h3 className="text-xl font-serif font-bold text-[#3E2723]">
                                                    {community.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-[#5D4037] text-base leading-relaxed mb-6 flex-grow">
                                            {community.description}
                                        </p>

                                        <div className="pt-4 border-t border-gray-100 space-y-3">
                                            <div className="flex items-center justify-between text-[#5D4037]">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-[#8D6E63]" />
                                                    <span className="font-medium text-sm">{community.member_count} members</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-[#8D6E63]">
                                                    {community.is_private ? <Lock size={14} /> : <Globe size={14} />}
                                                    {community.is_private ? 'Private' : 'Public'}
                                                </div>
                                            </div>
                                            {community.pending_requests && community.pending_requests.length > 0 && (
                                                <button
                                                    onClick={() => setActiveTab('requests')}
                                                    className="flex items-center gap-2 text-sm text-[#0277BD] font-semibold bg-[#E1F5FE] px-4 py-2 rounded-xl border border-[#B3E5FC] hover:shadow-sm transition-all w-full justify-center"
                                                >
                                                    <Clock size={14} />
                                                    {community.pending_requests.length} pending request{community.pending_requests.length > 1 ? 's' : ''} — Review
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/communities/${community._id}`)}
                                                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl bg-[#7B1FA2] text-white font-bold hover:bg-[#6A1B9A] hover:shadow-md transition-all"
                                            >
                                                <Settings size={18} />
                                                Manage Community
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Create New Card */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="group bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-dashed border-[#CE93D8] flex flex-col items-center justify-center gap-4 min-h-[320px]"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#F3E5F5] text-[#8E24AA] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus size={32} />
                            </div>
                            <span className="text-xl font-serif font-bold text-[#3E2723]">Create New Community</span>
                            <span className="text-sm text-[#8D6E63]">Start something meaningful</span>
                        </button>
                    </div>
                )}

                {/* Pending Requests */}
                {activeTab === 'requests' && !loading && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60">
                                <Heart className="mx-auto text-[#CE93D8] mb-4" size={48} />
                                <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-2">No Pending Requests</h3>
                                <p className="text-[#5D4037]">All caught up! No one is waiting to join your communities.</p>
                            </div>
                        ) : (
                            pendingRequests.map((request) => {
                                const isApproving = actionLoading === `approve-${request._id}`;
                                const isRejecting = actionLoading === `reject-${request._id}`;
                                const isBusy = isApproving || isRejecting;
                                return (
                                    <div
                                        key={`${request.communityId}-${request._id}`}
                                        className="bg-white rounded-[2rem] p-6 shadow-lg border border-white/60 flex flex-col sm:flex-row items-center gap-6"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-[#F3E5F5] text-[#8E24AA] flex items-center justify-center shadow-sm text-xl font-bold uppercase">
                                            {request.username?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h4 className="text-lg font-serif font-bold text-[#3E2723]">
                                                {request.username}
                                            </h4>
                                            <p className="text-sm text-[#8D6E63]">
                                                Wants to join <span className="font-semibold text-[#5D4037]">{request.communityName}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(request.communityId, request._id)}
                                                disabled={isBusy}
                                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#7B1FA2] text-white font-bold hover:bg-[#6A1B9A] hover:shadow-md transition-all disabled:opacity-50"
                                            >
                                                {isApproving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.communityId, request._id)}
                                                disabled={isBusy}
                                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FBE9E7] text-[#D84315] font-bold hover:shadow-md transition-all disabled:opacity-50"
                                            >
                                                {isRejecting ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-20 text-center bg-white/40 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 max-w-4xl mx-auto">
                    <div className="inline-block p-4 rounded-2xl bg-[#F3E5F5] text-[#8E24AA] mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-[#3E2723] mb-4">Community Guidelines</h2>
                    <p className="text-lg text-[#5D4037] leading-relaxed mb-6">
                        Our communities are built on trust, empathy, and respect. Please be kind, supportive,
                        and mindful of others' experiences. Together, we create a safer space for healing and growth.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="px-6 py-2 bg-white rounded-full text-sm font-bold shadow-sm">Be Kind</span>
                        <span className="px-6 py-2 bg-white rounded-full text-sm font-bold shadow-sm">Stay Respectful</span>
                        <span className="px-6 py-2 bg-white rounded-full text-sm font-bold shadow-sm">Support Each Other</span>
                    </div>
                </div>
            </div>

            {/* Create Community Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-white/60">
                        <h2 className="text-3xl font-serif font-bold text-[#3E2723] mb-6">
                            Create a Community
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-[#5D4037] mb-2 uppercase tracking-wide">
                                    Community Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newCommunity.name}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                                    placeholder="e.g., Mindful Mornings"
                                    className="w-full px-5 py-3 rounded-xl bg-[#F3E5F5]/30 border border-[#CE93D8] text-[#3E2723] placeholder-[#8D6E63] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#5D4037] mb-2 uppercase tracking-wide">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={newCommunity.description}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                                    placeholder="What's this community about?"
                                    className="w-full px-5 py-3 rounded-xl bg-[#F3E5F5]/30 border border-[#CE93D8] text-[#3E2723] placeholder-[#8D6E63] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E24AA] resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNewCommunity({ ...newCommunity, is_private: !newCommunity.is_private })}
                                    className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                                        newCommunity.is_private ? 'bg-[#7B1FA2]' : 'bg-gray-300'
                                    }`}
                                >
                                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                                        newCommunity.is_private ? 'translate-x-5' : 'translate-x-0.5'
                                    }`} />
                                </button>
                                <span className="font-medium text-[#5D4037]">
                                    {newCommunity.is_private ? (
                                        <span className="flex items-center gap-1"><Lock size={14} /> Private Community</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><Globe size={14} /> Public Community</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-[#5D4037] font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === 'create'}
                                    className="flex-1 px-6 py-3 rounded-xl bg-[#7B1FA2] text-white font-bold hover:bg-[#6A1B9A] transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading === 'create' && <Loader2 size={18} className="animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}