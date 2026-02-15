import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../../lib/authapi';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAuthStatus } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if(!email || !password){
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }
    try{
      await loginUser(email, password);
      toast.success("Login successful");
      await getAuthStatus();
      navigate("/");
    }catch(error){
      const errorMessage = error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
      console.error(error);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bloom-cream dark:bg-gray-900 text-bloom-primary dark:text-gray-100 font-sans px-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft dark:shadow-gray-900/50 transition-colors duration-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-bloom-primary dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-bloom-muted dark:text-gray-400">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-bloom-primary dark:text-gray-200 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-bloom-primary dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-bloom-primary dark:focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 dark:focus:ring-bloom-primary/30 outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bloom-primary dark:text-gray-200 mb-1.5">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-bloom-cream dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-bloom-primary dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-bloom-primary dark:focus:border-bloom-primary focus:ring-2 focus:ring-bloom-secondary/40 dark:focus:ring-bloom-primary/30 outline-none transition-all"
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-bloom-primary dark:hover:text-bloom-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bloom-primary hover:bg-bloom-primary/90 dark:bg-bloom-primary dark:hover:bg-bloom-primary/80 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-bloom-primary/30 dark:shadow-bloom-primary/20 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-bloom-muted dark:text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="text-bloom-primary dark:text-bloom-primary font-medium hover:text-bloom-primary/80 dark:hover:text-bloom-primary/80 transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

