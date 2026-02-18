import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Camera, User, Phone, Calendar, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { updateProfile } from '../lib/authapi';
import toast from 'react-hot-toast';


const EditProfile = () => {
  const { user, getAuthStatus } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: '',
    contact: '',
    emergencyContact1: '',
    emergencyContact2: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.name || '',
        age: user.age || '',
        gender: user.gender || '',
        contact: user.contact || '',
        emergencyContact1: user.emergency_contacts?.[0] || '',
        emergencyContact2: user.emergency_contacts?.[1] || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const updateData = {};
      const newErrors = {};
      if (formData.username && formData.username !== user.name) {
        updateData.username = formData.username.trim();
      }

      if (formData.age && Number(formData.age) !== user.age) {
        updateData.age = Number(formData.age);
      }

      if (formData.gender && formData.gender !== user.gender) {
        updateData.gender = formData.gender;
      }

      if (formData.contact && formData.contact !== user.contact) {
        updateData.contact = formData.contact.trim();
      }

      const emergencyContacts = [formData.emergencyContact1, formData.emergencyContact2];

      if (
        emergencyContacts[0] !== user.emergency_contacts?.[0] ||
        emergencyContacts[1] !== user.emergency_contacts?.[1]
      ) {
        updateData.emergency_contacts = emergencyContacts.filter(Boolean);
      }


      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      if (Object.keys(updateData).length === 0) {
        setErrors({ general: 'Please provide at least one field to update' });
        setLoading(false);
        return;
      }

      await updateProfile(updateData);
      await getAuthStatus();
      toast.success("Profile updated successfully");
      setLoading(false);
      navigate('/profile');

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while updating profile';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
      console.error("Error updating profile", error);
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-bloom-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-bloom-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bloom-cream font-sans">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-bloom-primary hover:text-bloom-dark transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
          <h1 className="text-4xl font-serif font-bold text-bloom-primary">Edit Profile</h1>
          <p className="text-bloom-muted mt-2">Update your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-bloom-secondary/20 overflow-hidden">

          {/* Profile Picture Section */}
          <div className="bg-gradient-to-r from-bloom-primary/20 to-bloom-secondary/20 p-8 border-b border-bloom-secondary/20">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border-4 border-white">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=d17cf5&color=fff&size=200`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-bloom-primary text-white rounded-full shadow-lg hover:bg-bloom-primary/90 transition-all"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-bloom-dark">{user.name || 'User'}</h2>
                <p className="text-bloom-muted text-sm mt-1">Click the camera icon to change your profile picture</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-bloom-dark mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-bloom-primary" />
                Basic Information
              </h3>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Update only the fields you want to change. Leave fields empty to keep current values.
                </p>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-bloom-dark mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg bg-white/70 border ${errors.username ? 'border-red-400' : 'border-bloom-secondary/30'} text-bloom-dark placeholder-gray-400 focus:bg-white focus:border-bloom-primary focus:ring-3 focus:ring-bloom-primary/20 outline-none transition-all duration-200`}
                    placeholder="Leave empty to keep current username"
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1.5">{errors.username}</p>}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bloom-dark mb-2">Age <span className="text-gray-400 text-xs">(optional)</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="age"
                        value={formData.age || ''}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/70 border border-bloom-secondary/30 text-bloom-dark placeholder-gray-400 focus:bg-white focus:border-bloom-primary focus:ring-3 focus:ring-bloom-primary/20 outline-none transition-all duration-200"
                        placeholder=""
                        min="13"
                        max="100"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Leave empty to keep current value</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bloom-dark mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white/70 border ${errors.gender ? 'border-red-400' : 'border-bloom-secondary/30'} text-bloom-dark focus:bg-white focus:border-bloom-primary focus:ring-3 focus:ring-bloom-primary/20 outline-none transition-all duration-200`}
                    >
                      <option value="">Leave empty to keep current gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1.5">{errors.gender}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-6 border-t border-bloom-secondary/20">
              <h3 className="text-lg font-serif font-semibold text-bloom-dark mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-bloom-primary" />
                Contact Information
              </h3>

              <div className="space-y-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-bloom-dark mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 rounded-lg bg-white/70 border ${errors.contact ? 'border-red-400' : 'border-bloom-secondary/30'} text-bloom-dark placeholder-gray-400 focus:bg-white focus:border-bloom-primary focus:ring-3 focus:ring-bloom-primary/20 outline-none transition-all duration-200`}
                      maxLength="10"
                      pattern="\d{10}"
                    />
                  </div>
                  {errors.contact ? (
                    <p className="text-red-500 text-xs mt-1.5">{errors.contact}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1.5">Leave empty to keep current. If updating, use 10 digits format.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="pt-6 border-t border-bloom-secondary/20">
              <h3 className="text-lg font-serif font-semibold text-bloom-dark mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-bloom-primary" />
                Emergency Contacts
              </h3>

              <div className="bg-bloom-secondary/15 p-5 rounded-lg border border-bloom-secondary/30 space-y-4">
                <p className="text-xs text-blue-600 mb-3 font-medium">💡 Leave empty to keep existing emergency contacts</p>
                <div>
                  <label className="block text-sm font-medium text-bloom-dark mb-2">Emergency Contact 1</label>
                  <input
                    type="tel"
                    name="emergencyContact1"
                    value={formData.emergencyContact1 || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/75 border border-bloom-secondary/30 text-bloom-dark placeholder-gray-400 focus:bg-white focus:border-bloom-primary focus:ring-3 focus:ring-bloom-primary/20 outline-none transition-all duration-200"

                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bloom-dark mb-2">
                    Emergency Contact 2
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact2"
                    value={formData.emergencyContact2 || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/75 border border-bloom-secondary/30 text-bloom-dark placeholder-gray-400 focus:bg-white focus:border-bloom-primary focus:ring-3 focus:ring-bloom-primary/20 outline-none transition-all duration-200"

                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-bloom-primary hover:bg-bloom-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-bloom-primary/30 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>

              <Link
                to="/profile"
                className="px-6 py-3 rounded-lg border-2 border-bloom-secondary/40 text-bloom-dark hover:bg-bloom-secondary/10 font-medium transition-all duration-200 flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
