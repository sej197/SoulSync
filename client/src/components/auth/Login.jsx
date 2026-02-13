import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authapi from '../../lib/authapi';
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
  
  const handleGoogleLogin = () => {
    // TODO: Connection to backend OAuth
    console.log('Google login clicked');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if(!email || !password){
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }
    try{
      await authapi.post("/login", { email, password });
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
    console.log('Login submitted:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bloom-cream text-bloom-dark font-sans px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-soft">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-bloom-primary mb-2">Welcome Back</h2>
          <p className="text-bloom-muted">Sign in to continue your journey</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-bloom-dark py-3 px-4 rounded-xl transition-all duration-200 mb-6 font-medium"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-gray-400 text-sm">or email</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-bloom-dark mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>

          <label className="block text-sm font-medium mb-1.5">
          Password
          </label>

          <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all"
            placeholder="••••••••"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-bloom-primary"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
  </div>
</div>

          <button
            type="submit"
            className="w-full bg-bloom-primary hover:bg-bloom-primary/90 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-bloom-primary/30 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-bloom-muted text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-bloom-primary font-medium hover:text-bloom-dark transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
