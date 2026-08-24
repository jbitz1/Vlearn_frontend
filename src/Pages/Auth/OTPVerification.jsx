import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import apiClient from '../../config/apiClient';
import { GraduationCap, Smartphone, Check } from 'lucide-react';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state?.signupData || {};
  const devCode = location.state?.devCode || '';
  const targetPhone = signupData.adminPhone?.trim() || signupData.phone?.trim() || '';

  const [digits, setDigits] = useState(devCode && devCode.length === 6 ? devCode.split('') : ['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const refs = useRef([]);

  useEffect(() => {
    if (!targetPhone) {
      navigate('/school-signup');
      return;
    }
    const timer = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetPhone, navigate]);

  const handleDigit = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const maskPhone = (ph) => {
    if (!ph || ph.length < 5) return ph;
    return ph.substring(0, 4) + ' *** ' + ph.substring(ph.length - 3);
  };

  const handleResend = async () => {
    setCountdown(60);
    setError('');
    setResent(false);
    try {
      const res = await apiClient.post('/api/auth/request-otp/', {
        phone_number: targetPhone,
        purpose: 'registration'
      });
      if (res.data?.code) {
        setDigits(res.data.code.split(''));
      }
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to resend code';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await apiClient.post('/api/auth/verify-otp/', {
        phone_number: targetPhone,
        otp_code: code,
        purpose: 'registration'
      });

      const verificationToken = res.data?.verification_token;
      navigate('/create-password', {
        state: {
          signupData,
          phone_number: targetPhone,
          verification_token: verificationToken
        }
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid or expired OTP code. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-7 h-7 text-custom-blue" />
          </div>

          <h2 className="text-xl font-bold font-heading text-navy text-center mb-1">Verify Phone Number</h2>
          <p className="text-xs text-slate-500 text-center mb-6">
            Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{maskPhone(targetPhone)}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { refs.current[i] = el; }}
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold font-heading rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              ))}
            </div>

            {error && <p className="text-xs text-red-600 text-center font-medium">{error}</p>}
            {resent && (
              <p className="text-xs text-green-600 text-center font-medium flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> Code resent successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold font-heading hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0}
                className="text-xs text-primary hover:underline disabled:text-slate-400 disabled:no-underline font-medium"
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate('/school-signup')}
                className="text-xs text-slate-500 hover:underline"
              >
                Change number
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
