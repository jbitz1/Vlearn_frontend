import React from 'react';
import Card from './Card';

const StatCard = ({ label, value, icon: Icon, iconBg = 'bg-primary-light text-primary', trend, trendUp, className = '' }) => {
  return (
    <Card className={`flex items-center space-x-4 ${className}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
        <div className="flex items-baseline space-x-2">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <span className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-danger'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
