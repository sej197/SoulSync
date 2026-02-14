import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authapi from '../../lib/authapi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    age: '',
    contact: '',
    emergencyContact1: '',
    emergencyContact2: '',
    username: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {getAuthStatus, isLoggedIn} = useContext(AuthContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try{
      if(!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.gender || !formData.contact || !formData.emergencyContact1 ){
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }
      if(formData.password !== formData.confirmPassword){
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      await authapi.post('/register', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      contact: formData.contact,
      age: formData.age,
      emergency_contacts: [
      formData.emergencyContact1,
      formData.emergencyContact2
      ].filter(Boolean)
    });

      toast.success("Signup successful!");
      await getAuthStatus();
      navigate('/');
    }catch(error){
      const errorMessage = error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
      console.error(error);
    }finally{
      setLoading(false);
    }
    console.log('Signup submitted:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bloom-cream text-bloom-dark font-sans px-4 py-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-soft">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-bloom-primary mb-2">Create Account</h2>
          <p className="text-bloom-muted">Start your mindfulness journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-bloom-cream/10 p-6 rounded-xl border border-slate-400/20">
          
          
          <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl shadow-bloom-primary/10 border border-white/40">

            <div>
              <label className="block text-sm font-medium text-bloom-dark mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-bloom-cream/40 border border-bloom-primary/10 focus:bg-white focus:border-bloom-primary focus:ring-4 focus:ring-bloom-primary/15 outline-none transition-all duration-200"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bloom-dark mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-bloom-cream/40 border border-bloom-primary/10 focus:bg-white focus:border-bloom-primary focus:ring-4 focus:ring-bloom-primary/15 outline-none transition-all duration-200"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bloom-dark mb-1.5">Age <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all"
                placeholder="18"
                min="13"
                max="100"
              />
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bloom-dark mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all bg-white"
                required
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-bloom-dark mb-1.5">Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all"
                placeholder="10-digit phone number"
                maxLength="10"
                pattern="\d{10}"
                required
              />
              <p className="text-xs text-bloom-muted mt-1">Format: 10 digits only</p>
            </div>
          </div>

          
          <div className="bg-bloom-secondary/10 p-4 rounded-xl border border-bloom-secondary/20">
            <h3 className="text-sm font-semibold text-bloom-dark mb-3">Emergency Contacts</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-bloom-dark mb-1.5">Emergency Contact 1</label>
                <input
                  type="tel"
                  name="emergencyContact1"
                  value={formData.emergencyContact1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all text-sm"
                  placeholder="Contact number or name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-bloom-dark mb-1.5">Emergency Contact 2 <span className="text-gray-400 text-xs">(optional)</span></label>
                <input
                  type="tel"
                  name="emergencyContact2"
                  value={formData.emergencyContact2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all text-sm"
                  placeholder="Contact number or name"
                />
              </div>
            </div>
          </div>

          
          <div>
            <label className="block text-sm font-medium text-bloom-dark mb-1.5">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all"
              placeholder="Create a password"
              required
            />
            <p className="text-xs text-bloom-muted mt-1">At least 8 characters</p>
          </div>

          
          <div>
            <label className="block text-sm font-medium text-bloom-dark mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-primary focus:ring-2 focus:ring-bloom-primary/20 outline-none transition-all"
              placeholder="Confirm your password"
              required
            />
          </div>

          
          <label className="flex items-center gap-2 text-sm text-bloom-muted cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            Show password
          </label>

          
          <button
            type="submit"
            className="w-full bg-bloom-primary hover:bg-bloom-primary/90 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-bloom-primary/30 transition-all duration-200 transform hover:-translate-y-0.5 mt-6"
          >
            Create Account
          </button>
        </form>

        
        <p className="text-center mt-8 text-bloom-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-bloom-primary font-medium hover:text-bloom-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
