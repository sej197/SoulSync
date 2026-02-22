import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../../lib/authapi';
import { Lock, Smartphone, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Invalid session. Please start over.");
            navigate('/forgot-password');
            return;
        }
        if (!otp || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, otp, newPassword);
            toast.success("Password reset successful! You can now log in.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="text-center pt-20">
                <p className="text-bloom-muted mb-4">No email found. Please start the recovery flow again.</p>
                <Link to="/forgot-password" title="Go to Forgot Password" className="text-bloom-primary font-medium hover:underline">Go Back</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto pt-10 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft dark:shadow-gray-900/50 transition-colors duration-200">
                <div className="mb-6">
                    <Link to="/forgot-password" title="Go to Forgot Password" className="inline-flex items-center text-sm text-bloom-muted dark:text-gray-400 hover:text-bloom-primary transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-bloom-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-bloom-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-bloom-primary dark:text-white mb-2">
                        Reset Password
                    </h2>
                    <p className="text-bloom-muted dark:text-gray-400">
                        Enter the OTP sent to <b>{email}</b> and your new password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-bloom-primary dark:text-gray-200 mb-1.5 flex items-center">
                            <Smartphone size={16} className="mr-1.5" /> OTP Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-4 py-3 rounded-xl bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-bloom-primary dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 tracking-widest text-center text-lg font-bold outline-none focus:ring-2 focus:ring-bloom-primary/20"
                            placeholder="000000"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-bloom-primary dark:text-gray-200 mb-1.5">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-bloom-primary dark:text-gray-100 outline-none focus:ring-2 focus:ring-bloom-primary/20"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-bloom-primary dark:text-gray-200 mb-1.5">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-bloom-primary dark:text-gray-100 outline-none focus:ring-2 focus:ring-bloom-primary/20"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-bloom-primary hover:bg-bloom-primary/90 text-white font-medium py-3 rounded-xl shadow-lg shadow-bloom-primary/30 transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
