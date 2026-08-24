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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold font-heading text-navy text-lg">VizLearn</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600" />
          </div>

          <h2 className="text-xl font-bold font-heading text-navy text-center mb-1">Create Password</h2>
          <p className="text-xs text-slate-500 text-center mb-6">
            Set a secure password to protect your school administrator account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                placeholder="Repeat your password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-600 text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-navy text-white text-sm font-semibold font-heading hover:bg-navy-700 active:scale-[0.98] transition-all mt-2 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Continue to School Setup →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
