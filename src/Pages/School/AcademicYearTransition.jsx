import { useState, useContext } from 'react';
import { ArrowRight, AlertTriangle, Users, CheckCircle, Layers } from 'lucide-react';
import SchoolContext from '../../Context/SchoolContext';

export default function AcademicYearTransition() {
  const schoolContext = useContext(SchoolContext);
  const school = schoolContext?.school;
  const classes = schoolContext?.classes || [];
  const streams = schoolContext?.streams || [];
  const enrollments = schoolContext?.enrollments || [];

  return (
    <div className="space-y-8 min-h-screen pb-10 max-w-7xl mx-auto font-sans">
      <header className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black text-navy mb-1">Academic Year Transition</h1>
        <p className="text-slate-500 font-medium text-sm">
          Review and confirm student progression for {school?.name || 'your school'}.
        </p>
      </header>

      {/* Cohort progression pipeline */}
      <div className="bg-[#002040] rounded-2xl p-6 text-white overflow-hidden relative shadow-sm">
        <h3 className="font-bold mb-6 text-xl">Cohort Progression Pipeline</h3>
        
        {classes.length === 0 ? (
          <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-white/70 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-60" />
            No academic classes configured yet. Configure class levels in School Setup to initialize progression pipelines.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 overflow-x-auto py-2">
            {classes.map((cls, idx) => {
              const classStreams = streams.filter(s => s.school_class === cls.id);
              const studentCount = enrollments.filter(e => 
                classStreams.some(st => st.id === e.stream)
              ).length;

              return (
                <div key={cls.id} className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex-1 min-w-[130px] bg-white/10 p-4 rounded-xl text-center relative border border-white/20">
                    <h4 className="font-bold text-lg">{cls.name}</h4>
                    <p className="text-white/70 text-xs">{studentCount} Students</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary shrink-0 hidden md:block" />
                </div>
              );
            })}
            <div className="flex-1 min-w-[130px] bg-accent/20 p-4 rounded-xl text-center relative border border-accent/40 text-accent">
              <h4 className="font-bold text-lg">Graduated</h4>
              <p className="text-accent/80 text-xs">Alumni</p>
            </div>
          </div>
        )}
      </div>

      {/* Review Changes section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Repeaters</p>
          <h2 className="text-2xl font-black text-warning mt-1">0</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Transfers</p>
          <h2 className="text-2xl font-black text-navy mt-1">0</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Left</p>
          <h2 className="text-2xl font-black text-danger mt-1">0</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">New Intake</p>
          <h2 className="text-2xl font-black text-success mt-1">{enrollments.length}</h2>
        </div>
      </div>

      {/* Exception handling interface */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-navy">Exception Handling</h3>
            <p className="text-sm text-slate-500">Manage status overrides for individual students before confirming transition.</p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No enrolled students recorded yet. Enrolled students will appear here for transition review.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Admission No</th>
                <th className="p-4">Status Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.slice(0, 10).map((enr) => {
                const sDetail = enr.student_detail || {};
                return (
                  <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-navy">
                      {[sDetail.first_name, sDetail.last_name].filter(Boolean).join(' ') || sDetail.username}
                    </td>
                    <td className="p-4 text-xs text-slate-600 font-mono">{sDetail.admission_number || '-'}</td>
                    <td className="p-4">
                      <select className="rounded-xl border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs px-2.5 py-1.5 border bg-white text-slate-700">
                        <option>Promote (Default)</option>
                        <option>Repeat Class</option>
                        <option>Transfer</option>
                        <option>Left</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Action */}
      <div className="flex justify-end pt-4">
        <button 
          type="button"
          onClick={() => alert("Academic year transition initialized successfully.")}
          className="px-8 py-4 bg-accent text-white font-black rounded-xl hover:bg-accent-dark transition-colors shadow-lg shadow-accent/20 flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-6 h-6" />
          Confirm New Academic Year
        </button>
      </div>
    </div>
  );
}
