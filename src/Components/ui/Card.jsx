import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', ...rest }) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${padding} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;
