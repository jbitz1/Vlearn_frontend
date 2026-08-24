import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const ReviewStep = ({ wizardData, setStep }) => {
  const { 
    schoolProfile, subjects, teachers, 
    formsStreams, students, teacherAssignments, examConfig 
  } = wizardData;

  const subjectsCount = subjects?.length || 0;
  const teachersCount = teachers?.length || 0;
  const formsList = formsStreams?.forms || Object.keys(formsStreams?.streams || {});
  const formsCount = formsList.length;
  const streamsMap = formsStreams?.streams || formsStreams || {};
  const streamsCount = Object.values(streamsMap).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
  const totalStudents = Object.values(students || {}).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
  const examsCount = examConfig?.names?.length || 0;

  const summary = [
    { 
      label: 'School Profile', 
      status: schoolProfile?.name ? 'complete' : 'warning', 
      detail: schoolProfile?.name ? `${schoolProfile.name} (${schoolProfile.curriculum || 'Standard'})` : 'Profile pending', 
      step: 1 
    },
    { 
      label: 'Subjects', 
      status: subjectsCount > 0 ? 'complete' : 'warning', 
      detail: subjectsCount > 0 ? `${subjectsCount} subjects selected` : 'No subjects selected yet', 
      step: 2 
    },
    { 
      label: 'Teachers', 
      status: teachersCount > 0 ? 'complete' : 'warning', 
      detail: teachersCount > 0 ? `${teachersCount} teachers added` : 'No teachers added yet', 
      step: 3 
    },
    { 
      label: 'Forms & Streams', 
      status: formsCount > 0 ? 'complete' : 'warning', 
      detail: formsCount > 0 ? `${formsCount} forms, ${streamsCount} streams` : 'No forms configured yet', 
      step: 4 
    },
    { 
      label: 'Students', 
      status: totalStudents > 0 ? 'complete' : 'complete', 
      detail: totalStudents > 0 ? `${totalStudents} students enrolled` : 'Ready for student enrollment', 
      step: 5 
    },
    { 
      label: 'Teacher Assignments', 
      status: Object.keys(teacherAssignments || {}).length > 0 ? 'complete' : 'complete', 
      detail: Object.keys(teacherAssignments || {}).length > 0 ? 'Teaching assignments configured' : 'Can be assigned later', 
      step: 6 
    },
    { 
      label: 'Exams', 
      status: examsCount > 0 ? 'complete' : 'complete', 
      detail: examsCount > 0 ? `${examsCount} exams per term configured` : 'Default exam structure', 
      step: 7 
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-heading text-navy">Review & Activate</h2>
      <p className="text-sm text-slate-500">Your school setup is nearly complete. Review and activate when ready.</p>
      
      <div className="space-y-2 pt-2">
        {summary.map(item => (
          <div 
            key={item.label} 
            className={`flex items-start justify-between p-3 rounded-xl ${
              item.status === 'warning' ? 'bg-warning-light text-warning-dark' : 'bg-success-light'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5">
                {item.status === 'warning' ? (
                  <AlertCircle size={16} className="text-warning" />
                ) : (
                  <Check size={16} className="text-success" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-navy font-heading">{item.label}</p>
                <p className="text-xs text-slate-600">{item.detail}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(item.step)}
              className="text-xs text-primary font-medium hover:underline self-center cursor-pointer"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-primary-light border border-primary/20 mt-4">
        <p className="text-sm font-semibold text-primary font-heading">Ready to go live!</p>
        <p className="text-xs text-slate-600 mt-1">You can complete or adjust details later in Settings. Your school will be active immediately.</p>
      </div>
    </div>
  );
};

export default ReviewStep;
