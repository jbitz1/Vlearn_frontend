import React from 'react';

const Button = ({
  variant = 'primary',
  children,
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...rest
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl px-6 py-2.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-navy text-white hover:bg-navy-700 focus:ring-navy',
    ghost: 'text-primary hover:bg-primary-light focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger'
  };

  const variantClasses = variants[variant] || variants.primary;
  
  const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
