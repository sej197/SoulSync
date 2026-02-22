import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendOtp, verifyOtp } from '../../lib/authapi';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Smartphone, ArrowLeft, RefreshCw } from 'lucide-react';

const VerifyAccount = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const { user, getAuthStatus } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.isAccountVerified) {
            toast.success("Account is already verified");
            navigate('/profile');
        }
    }, [user, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp) {
            toast.error("Please enter the OTP code");
            return;
        }

        setLoading(true);
        try {
            await verifyOtp(otp);
            toast.success("Account verified successfully!");
            await getAuthStatus();
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await sendOtp();
            toast.success("New OTP sent to your email");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        } finally {
            setResending(false);
        }
    };

    if (!user) {
        return (
            <div className="text-center pt-20">
                <p className="text-bloom-muted mb-4">You must be logged in to verify your account.</p>
                <Link to="/login" title="Go to Login" className="text-bloom-primary font-medium hover:underline">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto pt-10 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft dark:shadow-gray-900/50 transition-colors duration-200">
                <div className="mb-6">
                    <Link to="/profile" title="Go to Profile" className="inline-flex items-center text-sm text-bloom-muted dark:text-gray-400 hover:text-bloom-primary transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Profile
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-bloom-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-bloom-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-bloom-primary dark:text-white mb-2">
                        Verify Your Account
                    </h2>
                    <p className="text-bloom-muted dark:text-gray-400">
                        We've sent a 6-digit verification code to <br />
                        <span className="font-semibold text-bloom-primary dark:text-bloom-secondary">{user.email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-bloom-primary dark:text-gray-200 mb-2 flex items-center justify-center">
                            <Smartphone size={16} className="mr-1.5" /> Verification Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-4 py-4 rounded-xl bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-bloom-primary dark:text-gray-100 tracking-[0.5em] text-center text-2xl font-bold outline-none focus:ring-2 focus:ring-bloom-primary/20"
                            placeholder="000000"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-bloom-primary hover:bg-bloom-primary/90 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-bloom-primary/30 transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-bloom-muted dark:text-gray-400 mb-2">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="inline-flex items-center text-bloom-primary hover:text-bloom-primary/80 font-medium text-sm transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={`mr-1.5 ${resending ? 'animate-spin' : ''}`} />
                        {resending ? 'Resending...' : 'Resend Code'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyAccount;
