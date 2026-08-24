import React from 'react';

const GradeBadge = ({ grade, className = '' }) => {
  const getGradeStyle = (g) => {
    const gradeUpper = g?.toUpperCase();
    if (['A', 'A-'].includes(gradeUpper)) return 'bg-success-light text-success';
    if (['B+', 'B'].includes(gradeUpper)) return 'bg-primary-light text-primary';
    if (['B-'].includes(gradeUpper)) return 'bg-slate-100 text-slate-600';
    if (['C+', 'C'].includes(gradeUpper)) return 'bg-warning-light text-warning';
    if (['C-', 'D+'].includes(gradeUpper)) return 'bg-accent-light text-accent';
    if (['D', 'D-'].includes(gradeUpper)) return 'bg-danger-light text-danger';
    if (['E'].includes(gradeUpper)) return 'bg-danger text-white';
    return 'bg-slate-100 text-slate-500'; // Default
  };

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${getGradeStyle(grade)} ${className}`}>
      {grade}
    </span>
  );
};

export default GradeBadge;
