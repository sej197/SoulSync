import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    ArrowRight,
    Loader2,
    Plus,
    Send,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    Trash2,
    Pencil,
    X,
    ChevronDown,
    ChevronUp,
    Users,
    MoreVertical,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import {
    fetchPosts,
    createPostApi,
    updatePostApi,
    deletePostApi,
    reactToPostApi,
    fetchComments,
    addCommentApi,
    updateCommentApi,
    deleteCommentApi
} from '../lib/postApi';

export default function CommunityPage() {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [posts, setPosts] = useState([]);
    const [communityName, setCommunityName] = useState('');
    const [communityDesc, setCommunityDesc] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // New post form
    const [showNewPost, setShowNewPost] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newText, setNewText] = useState('');
    const [creating, setCreating] = useState(false);

    // Edit post
    const [editingPostId, setEditingPostId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editText, setEditText] = useState('');

    // Comments state — keyed by postId
    const [openComments, setOpenComments] = useState({});
    const [commentsData, setCommentsData] = useState({});
    const [commentText, setCommentText] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const [editingComment, setEditingComment] = useState(null); // { postId, commentId }
    const [editCommentText, setEditCommentText] = useState('');
    const [openMenu, setOpenMenu] = useState(null); // postId of open menu

    // Delete confirmation modal
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'post'|'comment', postId, commentId? }

    // Filter state
    const [filterFlagged, setFilterFlagged] = useState(false);

    // Hate speech / warning state
    const [userWarnings, setUserWarnings] = useState(0);
    const [userBanned, setUserBanned] = useState(false);

    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load posts
    const loadPosts = useCallback(async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const res = await fetchPosts(communityId, pageNum);
            const { formattedPosts, name, description, userWarnings: uw, userBanned: ub } = res.data;
            setCommunityName(name);
            setCommunityDesc(description);
            if (uw !== undefined) setUserWarnings(uw);
            if (ub !== undefined) setUserBanned(ub);
            if (append) {
                setPosts(prev => [...prev, ...formattedPosts]);
            } else {
                setPosts(formattedPosts);
            }
            setHasMore(formattedPosts.length === 10);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    }, [communityId]);

    useEffect(() => {
        loadPosts(1);
        setPage(1);
    }, [communityId, loadPosts]);

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        loadPosts(next, true);
    };

    // Create post
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return toast.error('Post text is required');
        try {
            setCreating(true);
            const res = await createPostApi(communityId, { title: newTitle.trim(), text: newText.trim() });
            if (res.data.hate_speech_warning) {
                toast.error(res.data.message, { duration: 6000, icon: '⚠️' });
                setUserWarnings(prev => prev + 1);
            } else {
                toast.success('Post created!');
            }
            setNewTitle('');
            setNewText('');
            setShowNewPost(false);
            loadPosts(1);
            setPage(1);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally {
            setCreating(false);
        }
    };

    // Edit post
    const startEdit = (post) => {
        setEditingPostId(post._id);
        setEditTitle(post.title || '');
        setEditText(post.text);
        setOpenMenu(null);
    };

    const handleUpdate = async (postId) => {
        if (!editText.trim()) return toast.error('Post text is required');
        try {
            const res = await updatePostApi(communityId, postId, { title: editTitle.trim(), text: editText.trim() });
            if (res.data.hate_speech_warning) {
                toast.error(res.data.message, { duration: 6000, icon: '⚠️' });
                setUserWarnings(prev => prev + 1);
            } else {
                toast.success('Post updated!');
            }
            setEditingPostId(null);
            loadPosts(1);
            setPage(1);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

    // Delete post
    const handleDelete = async (postId) => {
        try {
            const res = await deletePostApi(communityId, postId);
            toast.success('Post deleted');
            setPosts(prev => prev.filter(p => p._id !== postId));
            if (res.data.userWarnings !== undefined) setUserWarnings(res.data.userWarnings);
            if (res.data.userBanned !== undefined) setUserBanned(res.data.userBanned);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        } finally {
            setDeleteConfirm(null);
        }
    };

    // React to post
    const handleReact = async (postId, type) => {
        try {
            const res = await reactToPostApi(communityId, postId, type);
            setPosts(prev => prev.map(p =>
                p._id === postId
                    ? {
                        ...p,
                        upvotesCount: res.data.upvotesCount,
                        downvotesCount: res.data.downvotesCount,
                        isUpvoted: res.data.isUpvoted,
                        isDownvoted: res.data.isDownvoted
                    }
                    : p
            ));
        } catch (err) {
            toast.error('Failed to react');
        }
    };

    // Toggle comments
    const toggleComments = async (postId) => {
        const isOpen = openComments[postId];
        setOpenComments(prev => ({ ...prev, [postId]: !isOpen }));
        if (!isOpen && !commentsData[postId]) {
            await loadComments(postId);
        }
    };

    const loadComments = async (postId, pg = 1) => {
        try {
            setCommentLoading(prev => ({ ...prev, [postId]: true }));
            const res = await fetchComments(postId, pg);
            setCommentsData(prev => ({ ...prev, [postId]: res.data }));
        } catch (err) {
            toast.error('Failed to load comments');
        } finally {
            setCommentLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    // Add comment
    const handleAddComment = async (postId) => {
        const text = commentText[postId]?.trim();
        if (!text) return;
        try {
            setCommentLoading(prev => ({ ...prev, [postId]: true }));
            const res = await addCommentApi(postId, text);
            if (res.data.hate_speech_warning) {
                toast.error(res.data.message, { duration: 6000, icon: '⚠️' });
                setUserWarnings(prev => prev + 1);
            }
            setCommentText(prev => ({ ...prev, [postId]: '' }));
            await loadComments(postId);
            // Update comment count in posts list
            setPosts(prev => prev.map(p =>
                p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
            ));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add comment');
        } finally {
            setCommentLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    // Edit comment
    const startEditComment = (postId, comment) => {
        setEditingComment({ postId, commentId: comment._id });
        setEditCommentText(comment.text);
    };

    const handleUpdateComment = async () => {
        if (!editCommentText.trim() || !editingComment) return;
        try {
            const res = await updateCommentApi(editingComment.postId, editingComment.commentId, editCommentText.trim());
            if (res.data.flag_removed) {
                toast.success('Comment updated — flag removed!', { duration: 4000, icon: '✅' });
                if (res.data.userWarnings !== undefined) setUserWarnings(res.data.userWarnings);
                if (res.data.userBanned !== undefined) setUserBanned(res.data.userBanned);
            } else if (res.data.hate_speech_warning) {
                toast.error(res.data.message, { duration: 6000, icon: '⚠️' });
                setUserWarnings(prev => prev + 1);
            } else {
                toast.success('Comment updated');
            }
            const postId = editingComment.postId;
            setEditingComment(null);
            setEditCommentText('');
            await loadComments(postId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update comment');
        }
    };

    // Delete comment
    const handleDeleteComment = async (postId, commentId) => {
        try {
            await deleteCommentApi(postId, commentId);
            toast.success('Comment deleted');
            await loadComments(postId);
            setPosts(prev => prev.map(p =>
                p._id === postId ? { ...p, commentsCount: Math.max((p.commentsCount || 1) - 1, 0) } : p
            ));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete comment');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
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

            <div className="relative z-10 container mx-auto px-4 pt-8 pb-12 max-w-3xl">

                {/* Back + Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/communities/explore')}
                        className="flex items-center gap-2 text-[#7B1FA2] font-bold mb-5 hover:underline transition-all"
                    >
                        <ArrowRight size={18} className="rotate-180" />
                        Back to Communities
                    </button>
                    <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 shadow-lg">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-14 h-14 rounded-2xl bg-[#F3E5F5] text-[#8E24AA] flex items-center justify-center shadow-sm">
                                <Users size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-[#3E2723]">
                                    {communityName || 'Community'}
                                </h1>
                                {communityDesc && (
                                    <p className="text-[#5D4037] text-base mt-1">{communityDesc}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banned User Banner */}
                {userBanned && (
                    <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex items-start gap-4">
                        <ShieldAlert size={28} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-800 text-lg">Account Suspended</h3>
                            <p className="text-red-700 text-sm mt-1">
                                Your account has been suspended due to repeated community guideline violations. 
                                You can still browse posts but cannot create new posts or comments. 
                                Please check your email for details.
                            </p>
                        </div>
                    </div>
                )}

                {/* Warning Banner */}
                {!userBanned && userWarnings > 0 && (
                    <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-4">
                        <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-amber-800">
                                Community Guidelines Warning ({userWarnings}/3)
                            </h3>
                            <p className="text-amber-700 text-sm mt-1">
                                {userWarnings >= 2 
                                    ? "This is your final warning. One more violation will result in account suspension."
                                    : "Some of your content has been flagged for violating community guidelines. Please be respectful and supportive."
                                }
                            </p>
                            <div className="flex gap-1 mt-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`w-16 h-2 rounded-full ${i <= userWarnings ? 'bg-amber-500' : 'bg-amber-200'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* New Post Toggle */}
                <div className="mb-6">
                    {userBanned ? (
                        <div className="w-full flex items-center gap-3 px-6 py-4 bg-gray-100 rounded-2xl border border-gray-200 text-gray-400 font-medium text-lg cursor-not-allowed">
                            <ShieldAlert size={22} />
                            Posting is disabled for suspended accounts
                        </div>
                    ) : !showNewPost ? (
                        <button
                            onClick={() => setShowNewPost(true)}
                            className="w-full flex items-center gap-3 px-6 py-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-md text-[#8D6E63] font-medium text-lg hover:shadow-lg transition-all"
                        >
                            <Plus size={22} className="text-[#7B1FA2]" />
                            Share something with the community...
                        </button>
                    ) : (
                        <form
                            onSubmit={handleCreate}
                            className="bg-white rounded-[2rem] p-6 shadow-lg border border-white/60 space-y-4"
                        >
                            <input
                                type="text"
                                placeholder="Title (optional)"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full px-5 py-3 rounded-xl bg-[#F3E5F5]/30 border border-[#CE93D8] text-[#3E2723] placeholder-[#8D6E63] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
                            />
                            <textarea
                                rows={4}
                                placeholder="What's on your mind? *"
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                required
                                className="w-full px-5 py-3 rounded-xl bg-[#F3E5F5]/30 border border-[#CE93D8] text-[#3E2723] placeholder-[#8D6E63] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E24AA] resize-none"
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowNewPost(false); setNewTitle(''); setNewText(''); }}
                                    className="px-5 py-2.5 rounded-xl bg-gray-100 text-[#5D4037] font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-6 py-2.5 rounded-xl bg-[#7B1FA2] text-white font-bold hover:bg-[#6A1B9A] transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                                >
                                    {creating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    Post
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-3 mb-5">
                    <button
                        onClick={() => setFilterFlagged(false)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            !filterFlagged
                                ? 'bg-[#7B1FA2] text-white shadow-md'
                                : 'bg-white/70 text-[#5D4037] border border-white/60 hover:bg-white'
                        }`}
                    >
                        All Posts
                    </button>
                    <button
                        onClick={() => setFilterFlagged(true)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            filterFlagged
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-white/70 text-red-600 border border-red-200 hover:bg-red-50'
                        }`}
                    >
                        <AlertTriangle size={14} />
                        Flagged
                        {posts.filter(p => p.hateSpeechFlag).length > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                                filterFlagged ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                            }`}>
                                {posts.filter(p => p.hateSpeechFlag).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Posts List */}
                {loading && posts.length === 0 ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={40} className="animate-spin text-[#7B1FA2]" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60">
                        <MessageCircle className="mx-auto text-[#CE93D8] mb-4" size={48} />
                        <h3 className="text-2xl font-serif font-bold text-[#3E2723] mb-2">No Posts Yet</h3>
                        <p className="text-[#5D4037]">Be the first to share something!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {(filterFlagged ? posts.filter(p => p.hateSpeechFlag) : posts).length === 0 && filterFlagged ? (
                            <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60">
                                <AlertTriangle className="mx-auto text-[#CE93D8] mb-4" size={40} />
                                <h3 className="text-xl font-serif font-bold text-[#3E2723] mb-2">No Flagged Posts</h3>
                                <p className="text-[#5D4037] text-sm">No posts have been flagged for community guideline violations.</p>
                            </div>
                        ) : null}
                        {(filterFlagged ? posts.filter(p => p.hateSpeechFlag) : posts).map((post) => {
                            const isAuthor = post.author?._id === user?.id || post.author === user?.id;
                            const isEditing = editingPostId === post._id;
                            const commentsOpen = openComments[post._id];
                            const cData = commentsData[post._id];
                            const cLoading = commentLoading[post._id];

                            return (
                                <div
                                    key={post._id}
                                    className={`bg-white rounded-[2rem] shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                                        post.hateSpeechFlag 
                                            ? 'border-2 border-red-300' 
                                            : 'border border-white/60'
                                    }`}
                                >
                                    {/* Hate speech flag banner on post */}
                                    {post.hateSpeechFlag && (
                                        <div className="bg-red-50 px-6 py-2.5 flex items-center gap-2 border-b border-red-200">
                                            <AlertTriangle size={16} className="text-red-500" />
                                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                                                Flagged for Community Guidelines Violation
                                            </span>
                                        </div>
                                    )}
                                    {/* Post header */}
                                    <div className="p-6 pb-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#F3E5F5] text-[#8E24AA] flex items-center justify-center font-bold text-sm uppercase">
                                                    {(post.author?.username || 'U').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#3E2723] text-sm">
                                                        {post.author?.username || 'Anonymous'}
                                                    </p>
                                                    <p className="text-xs text-[#8D6E63]">{timeAgo(post.createdAt)}</p>
                                                </div>
                                            </div>
                                            {isAuthor && !isEditing && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenMenu(openMenu === post._id ? null : post._id)}
                                                        className="p-2 rounded-full hover:bg-[#F3E5F5] transition-all"
                                                    >
                                                        <MoreVertical size={18} className="text-[#8D6E63]" />
                                                    </button>
                                                    {openMenu === post._id && (
                                                        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 min-w-[140px]">
                                                            <button
                                                                onClick={() => startEdit(post)}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#3E2723] hover:bg-[#F3E5F5] transition-all"
                                                            >
                                                                <Pencil size={14} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => { setOpenMenu(null); setDeleteConfirm({ type: 'post', postId: post._id }); }}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Post content */}
                                        {isEditing ? (
                                            <div className="space-y-3 mb-4">
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={e => setEditTitle(e.target.value)}
                                                    placeholder="Title (optional)"
                                                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3E5F5]/30 border border-[#CE93D8] text-[#3E2723] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
                                                />
                                                <textarea
                                                    rows={3}
                                                    value={editText}
                                                    onChange={e => setEditText(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3E5F5]/30 border border-[#CE93D8] text-[#3E2723] font-medium focus:outline-none focus:ring-2 focus:ring-[#8E24AA] resize-none"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setEditingPostId(null)}
                                                        className="px-4 py-2 rounded-lg bg-gray-100 text-[#5D4037] font-bold text-sm hover:bg-gray-200 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate(post._id)}
                                                        className="px-4 py-2 rounded-lg bg-[#7B1FA2] text-white font-bold text-sm hover:bg-[#6A1B9A] transition-all"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-4">
                                                {post.title && (
                                                    <h3 className="text-xl font-serif font-bold text-[#3E2723] mb-2">{post.title}</h3>
                                                )}
                                                <p className="text-[#5D4037] leading-relaxed whitespace-pre-wrap">{post.text}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reactions bar */}
                                    <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-1">
                                        <button
                                            onClick={() => handleReact(post._id, 'upvote')}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                                post.isUpvoted
                                                    ? 'bg-[#7B1FA2] text-white shadow-md'
                                                    : 'bg-[#F3E5F5] text-[#8E24AA] hover:bg-[#E1BEE7]'
                                            }`}
                                        >
                                            <ThumbsUp size={16} />
                                            {post.upvotesCount || 0}
                                        </button>
                                        <button
                                            onClick={() => handleReact(post._id, 'downvote')}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                                post.isDownvoted
                                                    ? 'bg-[#D84315] text-white shadow-md'
                                                    : 'bg-[#FBE9E7] text-[#D84315] hover:bg-[#FFCCBC]'
                                            }`}
                                        >
                                            <ThumbsDown size={16} />
                                            {post.downvotesCount || 0}
                                        </button>
                                        <button
                                            onClick={() => toggleComments(post._id)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#E1F5FE] text-[#0277BD] hover:bg-[#B3E5FC] transition-all ml-auto"
                                        >
                                            <MessageCircle size={16} />
                                            {post.commentsCount || 0}
                                            {commentsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>

                                    {/* Comments section */}
                                    {commentsOpen && (
                                        <div className="px-6 py-4 border-t border-gray-100 bg-[#FAFAFA]">
                                            {/* Add comment */}
                                            {userBanned ? (
                                                <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-gray-100 rounded-xl text-gray-400 text-sm font-medium">
                                                    <ShieldAlert size={16} />
                                                    Commenting is disabled for suspended accounts
                                                </div>
                                            ) : (
                                            <div className="flex gap-3 mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Write a comment..."
                                                    value={commentText[post._id] || ''}
                                                    onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAddComment(post._id);
                                                        }
                                                    }}
                                                    className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#3E2723] placeholder-[#8D6E63] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CE93D8]"
                                                />
                                                <button
                                                    onClick={() => handleAddComment(post._id)}
                                                    disabled={cLoading}
                                                    className="px-4 py-2.5 rounded-xl bg-[#7B1FA2] text-white font-bold text-sm hover:bg-[#6A1B9A] transition-all disabled:opacity-50"
                                                >
                                                    {cLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                </button>
                                            </div>
                                            )}

                                            {/* Comments list */}
                                            {cLoading && !cData ? (
                                                <div className="flex justify-center py-4">
                                                    <Loader2 size={24} className="animate-spin text-[#7B1FA2]" />
                                                </div>
                                            ) : cData?.comments?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {cData.comments.map((comment) => {
                                                        const isCommentAuthor = comment.author?._id === user?.id || comment.author === user?.id;
                                                        const isEditingThis = editingComment?.commentId === comment._id;

                                                        return (
                                                            <div key={comment._id} className="flex gap-3 group">
                                                                <div className="w-8 h-8 rounded-full bg-[#E1F5FE] text-[#0277BD] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 mt-0.5">
                                                                    {(comment.author?.username || 'U').charAt(0)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={`bg-white rounded-xl px-4 py-2.5 ${comment.hate_speech_flag ? 'border-2 border-red-300' : 'border border-gray-100'}`}>
                                                                        {comment.hate_speech_flag && (
                                                                            <div className="flex items-center gap-1.5 mb-1.5 -mt-0.5">
                                                                                <AlertTriangle size={12} className="text-red-500" />
                                                                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                                                                                    Flagged — edit to remove
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="font-bold text-xs text-[#3E2723]">
                                                                                {comment.author?.username || 'User'}
                                                                            </span>
                                                                            <span className="text-xs text-[#8D6E63]">
                                                                                {timeAgo(comment.createdAt)}
                                                                            </span>
                                                                        </div>
                                                                        {isEditingThis ? (
                                                                            <div className="flex gap-2 mt-1">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editCommentText}
                                                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateComment(); }}
                                                                                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#F3E5F5]/30 border border-[#CE93D8] text-sm focus:outline-none focus:ring-1 focus:ring-[#8E24AA]"
                                                                                    autoFocus
                                                                                />
                                                                                <button
                                                                                    onClick={handleUpdateComment}
                                                                                    className="px-3 py-1.5 rounded-lg bg-[#7B1FA2] text-white text-xs font-bold"
                                                                                >
                                                                                    Save
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setEditingComment(null)}
                                                                                    className="px-2 py-1.5 rounded-lg bg-gray-100 text-xs font-bold"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-[#5D4037]">{comment.text}</p>
                                                                        )}
                                                                    </div>
                                                                    {isCommentAuthor && !isEditingThis && (
                                                                        <div className="flex gap-2 mt-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button
                                                                                onClick={() => startEditComment(post._id, comment)}
                                                                                className="text-xs text-[#8D6E63] hover:text-[#7B1FA2] font-medium"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setDeleteConfirm({ type: 'comment', postId: post._id, commentId: comment._id })}
                                                                                className="text-xs text-[#8D6E63] hover:text-red-600 font-medium"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {cData.currentPage < cData.totalPages && (
                                                        <button
                                                            onClick={() => loadComments(post._id, cData.currentPage + 1)}
                                                            className="text-sm font-semibold text-[#7B1FA2] hover:underline ml-11"
                                                        >
                                                            Load more comments...
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-[#8D6E63] text-center py-2">No comments yet. Be the first!</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Load more posts */}
                        {hasMore && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="px-8 py-3 rounded-2xl bg-white/70 backdrop-blur-md text-[#7B1FA2] font-bold border border-[#CE93D8] hover:bg-white hover:shadow-md transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin inline mr-2" /> : null}
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#3E2723]">
                                    Delete {deleteConfirm.type === 'post' ? 'Post' : 'Comment'}?
                                </h3>
                                <p className="text-sm text-[#8D6E63]">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 text-[#5D4037] font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirm.type === 'post') {
                                        handleDelete(deleteConfirm.postId);
                                    } else {
                                        handleDeleteComment(deleteConfirm.postId, deleteConfirm.commentId);
                                    }
                                }}
                                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
