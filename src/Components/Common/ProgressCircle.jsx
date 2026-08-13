import React from 'react';

/**
 * ProgressCircle - A flexible, animated SVG circular progress indicator.
 *
 * @param {number} percentage - Completion value between 0 and 100
 * @param {number} size - Outer diameter in pixels (default: 48)
 * @param {number} strokeWidth - Width of the circle stroke (default: 4)
 * @param {string} color - Theme color variant: 'blue' | 'orange' | 'emerald' | 'purple' | 'auto'
 * @param {boolean} showLabel - Whether to display percentage text in the center
 * @param {React.ReactNode} icon - Optional icon to display in the center instead of text
 * @param {string} className - Additional container styling
 * @param {string} labelClassName - Custom styles for the percentage text
 */
export const ProgressCircle = ({
  percentage = 0,
  size = 48,
  strokeWidth = 4,
  color = 'auto',
  showLabel = true,
  icon = null,
  className = '',
  labelClassName = '',
}) => {
  const cleanPct = Math.min(100, Math.max(0, Math.round(Number(percentage) || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cleanPct / 100) * circumference;

  // Resolve color dynamically if set to 'auto'
  const resolveColor = () => {
    if (color === 'auto') {
      if (cleanPct === 100) return { stroke: 'text-emerald-500', text: 'text-emerald-600', fill: 'bg-emerald-50' };
      if (cleanPct > 0) return { stroke: 'text-custom-blue', text: 'text-custom-blue', fill: 'bg-blue-50' };
      return { stroke: 'text-gray-300', text: 'text-gray-400', fill: 'bg-gray-50' };
    }

    switch (color) {
      case 'orange':
        return { stroke: 'text-custom-orange', text: 'text-custom-orange', fill: 'bg-orange-50' };
      case 'emerald':
        return { stroke: 'text-emerald-500', text: 'text-emerald-600', fill: 'bg-emerald-50' };
      case 'purple':
        return { stroke: 'text-purple-600', text: 'text-purple-600', fill: 'bg-purple-50' };
      case 'blue':
      default:
        return { stroke: 'text-custom-blue', text: 'text-custom-blue', fill: 'bg-blue-50' };
    }
  };

  const theme = resolveColor();
  const fontSize = Math.max(9, Math.floor(size * 0.26));

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={cleanPct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${cleanPct}% complete`}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ width: size, height: size }}
      >
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100"
          fill="transparent"
        />

        {/* Dynamic Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${theme.stroke} transition-all duration-700 ease-out`}
          fill="transparent"
        />
      </svg>

      {/* Center Label or Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {icon ? (
          icon
        ) : showLabel ? (
          <span
            className={`font-black tracking-tight leading-none ${theme.text} ${labelClassName}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {cleanPct}%
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default ProgressCircle;
