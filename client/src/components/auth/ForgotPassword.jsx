import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendResetOtp } from '../../lib/authapi';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setLoading(true);
        try {
            await sendResetOtp(email);
            toast.success("Password reset OTP sent to your email");
            navigate('/reset-password', { state: { email } });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto pt-10 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft dark:shadow-gray-900/50 transition-colors duration-200">
                <div className="mb-6">
                    <Link to="/login" className="inline-flex items-center text-sm text-bloom-muted dark:text-gray-400 hover:text-bloom-primary transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Login
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-bloom-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="text-bloom-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-bloom-primary dark:text-white mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-bloom-muted dark:text-gray-400">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-bloom-primary dark:text-gray-200 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-bloom-primary dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-bloom-primary dark:focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 dark:focus:ring-bloom-primary/30 outline-none transition-all"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-bloom-primary hover:bg-bloom-primary/90 text-white font-medium py-3 rounded-xl shadow-lg shadow-bloom-primary/30 transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
