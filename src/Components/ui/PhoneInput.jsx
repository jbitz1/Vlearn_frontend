import React from 'react';

const PhoneInput = ({ value, onChange, placeholder = '07XX XXX XXX', error, className = '' }) => {
  const formatPhone = (val) => {
    if (!val) return '';
    // Strip all non-digits except plus
    const digits = val.replace(/[^\d+]/g, '');
    
    // Formatting logic (simplified for UI, basic spacing)
    // You can enhance this based on exact requirement
    if (digits.startsWith('07') || digits.startsWith('01')) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})/, '$1$2 $3').trim();
    } else if (digits.startsWith('+254')) {
      return digits.replace(/(\+254)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4').trim();
    }
    return digits;
  };

  const handleChange = (e) => {
    // Pass raw or formatted value based on preference, here we let parent handle raw typically 
    // but update local display
    onChange(e.target.value);
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} focus:outline-none focus:ring-2 transition-all ${className}`}
    />
  );
};

export default PhoneInput;
