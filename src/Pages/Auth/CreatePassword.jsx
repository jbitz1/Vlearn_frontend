import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router';
import apiClient from '../../config/apiClient';
import UserContext from '../../Context/UserContext';
import { GraduationCap, Check } from 'lucide-react';

const CreatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(UserContext);
  const { signupData, phone_number, verification_token } = location.state || {};
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function getStrength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  const strength = getStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    const targetPhone = phone_number || signupData?.adminPhone || signupData?.phone;
    if (!targetPhone || !verification_token) {
      setError('Missing verification session. Please start registration from the beginning.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        phone_number: targetPhone,
        verification_token,
        password,
        school_name: signupData?.schoolName || '',
        school_type: signupData?.schoolType || 'County School',
        curriculum: signupData?.curriculum || 'KNEC (8-4-4)',
        county: signupData?.county || '',
        sub_county: signupData?.subCounty || '',
        school_phone: signupData?.phone || targetPhone,
        admin_name: signupData?.adminName || '',
        admin_email: signupData?.email || '',
        role: 'school_admin'
      };

      const response = await apiClient.post('/api/auth/phone-register/', payload);

      if (response.data?.access) {
        // Authenticate user session
        if (login) {
          login(response.data);
        } else {
          localStorage.setItem('token', JSON.stringify(response.data));
        }

        if (signupData) {
          localStorage.setItem('vlearn_registered_school', JSON.stringify(response.data.school || signupData));
        }

        // Navigate to school onboarding setup wizard
        navigate('/school-onboarding', { state: { signupData: response.data.school || signupData } });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please check your information and try again.';
      setError(typeof msg === 'string' ? msg : (msg.school_name ? msg.school_name[0] : JSON.stringify(msg)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-lg lg:max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black font-heading text-navy text-2xl tracking-tight block">VizLearn</span>
            <span className="text-xs text-slate-400 font-semibold">Administrator Account Security</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 lg:p-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <h2 className="text-2xl font-black font-heading text-navy text-center mb-1">Create Admin Password</h2>
          <p className="text-xs sm:text-sm text-slate-500 text-center mb-8">
            Set a secure password for your administrator account to access and manage your school.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">New Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/30 focus:bg-white transition-all text-navy font-medium"
              />
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-slate-100'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Password Strength:</span>
                    <span className="font-bold text-navy">{strengthLabels[strength]}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                placeholder="Repeat your password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/30 focus:bg-white transition-all text-navy font-medium"
              />
            </div>

            {/* Password Criteria Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-slate-500">
              <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-600 font-bold' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-emerald-600 font-bold' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-600 font-bold' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>At least one number</span>
              </div>
              <div className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-600 font-bold' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Special character</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm border border-red-200 font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-navy text-white text-sm font-bold font-heading hover:bg-navy-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-navy/10 mt-2"
            >
              {loading ? 'Finalizing Setup...' : 'Complete Registration & Go to School Setup →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
