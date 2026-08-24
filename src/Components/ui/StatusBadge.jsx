import React from 'react';

const StatusBadge = ({ status, children, className = '' }) => {
  const statusStyles = {
    completed: 'bg-success-light text-success',
    active: 'bg-primary-light text-primary',
    pending: 'bg-warning-light text-warning',
    upcoming: 'bg-slate-100 text-slate-500',
    warning: 'bg-warning-light text-warning',
    danger: 'bg-danger-light text-danger'
  };

  const badgeStyle = statusStyles[status] || statusStyles.upcoming;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyle} ${className}`}>
      {children}
    </span>
  );
};

export default StatusBadge;
