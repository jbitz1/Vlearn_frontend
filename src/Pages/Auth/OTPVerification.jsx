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
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-lg lg:max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black font-heading text-navy text-2xl tracking-tight block">VizLearn</span>
            <span className="text-xs text-slate-400 font-semibold">Security Verification</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 lg:p-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 text-primary">
            <Smartphone className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black font-heading text-navy text-center mb-1">Verify Administrator Phone</h2>
          <p className="text-xs sm:text-sm text-slate-500 text-center mb-8">
            Enter the 6-digit security code sent via SMS to <span className="font-bold text-navy font-mono">{maskPhone(targetPhone)}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { refs.current[i] = el; }}
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 sm:w-14 h-14 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border-2 border-slate-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-navy"
                />
              ))}
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs sm:text-sm border border-red-200 font-medium text-center">
                {error}
              </div>
            )}
            {resent && (
              <p className="text-xs sm:text-sm text-emerald-600 text-center font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Code resent successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-navy text-white text-sm font-bold font-heading hover:bg-navy-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-navy/10"
            >
              {loading ? 'Verifying Code...' : 'Verify & Set Up Password →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className="text-primary hover:underline disabled:text-slate-400 disabled:no-underline font-bold cursor-pointer"
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend SMS Code'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/school-signup')}
              className="text-slate-500 hover:text-navy font-semibold cursor-pointer"
            >
              ← Edit phone number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
