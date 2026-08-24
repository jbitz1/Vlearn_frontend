import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';
import apiClient from '../../config/apiClient';
import { Button, PhoneInput } from '../../Components/ui';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import UserContext from '../../Context/UserContext';

const PhoneLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext) || {}; // Fallback in case method differs
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/auth/phone-login/', { phone, password });
      
      if (login && response.data) {
        // Assuming the context handles setting token and user
        login(response.data);
      } else {
        // Fallback standard behavior
        localStorage.setItem('token', response.data.access || response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      // Redirect based on role
      const role = response.data?.user?.role || response.data?.role;
      if (role === 'admin' || role === 'school_admin') navigate('/dashboard');
      else if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/student');
      else navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12 text-white">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">VLearn</h1>
          <p className="text-xl text-slate-300 max-w-md">Empowering Kenyan schools with digital management and e-learning solutions.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-navy-700/50 p-6 rounded-2xl backdrop-blur-sm border border-navy-700">
            <div className="text-3xl font-bold text-primary mb-1">500+</div>
            <div className="text-sm text-slate-300">Schools onboarded across Kenya</div>
          </div>
          <div className="bg-navy-700/50 p-6 rounded-2xl backdrop-blur-sm border border-navy-700">
            <div className="text-3xl font-bold text-accent mb-1">100k+</div>
            <div className="text-sm text-slate-300">Active students learning daily</div>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          © {new Date().getFullYear()} VLearn Platform. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 bg-white py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-8">
            <h1 className="text-3xl font-heading font-bold text-primary">VizLearn</h1>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8 text-sm">Sign in to your VizLearn institutional account</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 p-3 bg-danger-light text-danger rounded-xl text-sm">{error}</div>}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>

            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full mb-6" loading={loading} disabled={!phone || !password}>
              Log In
            </Button>

            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-full border-t border-slate-200"></div>
              <span className="relative bg-white px-4 text-sm text-slate-400">or</span>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Continue with Email
              </Link>
              <Link to="/school-signup" className="text-sm text-slate-500 hover:text-slate-700">
                Don't have a school account? <span className="font-medium text-primary">Register</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PhoneLogin;
