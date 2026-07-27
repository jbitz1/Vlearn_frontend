import React from 'react';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-200 sticky top-0 bg-gray-50/90 backdrop-blur-md z-10 pt-2 gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 flex-wrap">{actions}</div>
      )}
    </header>
  );
}

export default PageHeader;
