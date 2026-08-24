import React from 'react';

const ProgressBar = ({ value = 0, size = 'md', className = '', showLabel = false }) => {
  const safeValue = Math.min(100, Math.max(0, value));
  
  let colorClass = 'bg-danger'; // < 40
  if (safeValue >= 70) colorClass = 'bg-success'; // #10b981
  else if (safeValue >= 55) colorClass = 'bg-primary'; // #02A0BF
  else if (safeValue >= 40) colorClass = 'bg-warning'; // #f59e0b

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className="text-xs font-semibold text-slate-600">{Math.round(safeValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size] || sizeClasses.md}`}>
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
