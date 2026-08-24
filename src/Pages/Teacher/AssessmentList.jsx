import React from 'react';
import { Link } from 'react-router';

export default function AssessmentList() {
  const assessments = [
    { id: 1, name: 'Mid-Term Exam', status: 'Completed', stream: 'Form 3A', subject: 'Mathematics' },
    { id: 2, name: 'Mid-Term Exam', status: 'Active', stream: 'Form 3A', subject: 'Physics' },
    { id: 3, name: 'End-Term Exam', status: 'Upcoming', stream: 'Form 3A', subject: 'Mathematics' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success-light text-success';
      case 'Active': return 'bg-primary-light text-primary';
      case 'Upcoming': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-heading font-bold text-navy">Assessments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map(assessment => (
          <div key={assessment.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading font-bold text-navy">{assessment.name}</h3>
                <p className="text-sm text-slate-500">{assessment.subject} • {assessment.stream}</p>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusBadge(assessment.status)}`}>
                {assessment.status}
              </span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-100">
              <Link to={`/teacher/assessments/${assessment.id}/entry`} className="text-primary font-medium hover:text-primary-dark text-sm">
                {assessment.status === 'Completed' ? 'View Results' : 'Enter Marks'} &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
