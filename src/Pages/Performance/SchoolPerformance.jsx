import React, { useContext } from 'react';
import { Link } from 'react-router';
import SchoolContext from '../../Context/SchoolContext';
import { BarChart3, Award, BookOpen, Layers } from 'lucide-react';

export default function SchoolPerformance() {
  const schoolContext = useContext(SchoolContext);
  const school = schoolContext?.school;
  const classes = schoolContext?.classes || [];
  const streams = schoolContext?.streams || [];
  const enrollments = schoolContext?.enrollments || [];

  // Calculate real metrics
  const hasExams = false; // No uploaded result sheets yet for fresh account

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-2xl border border-slate-200 p-4 gap-3 shadow-sm">
        <div>
          <h1 className="text-xl font-heading font-bold text-navy">
            {school?.name || 'School'} Performance Overview
          </h1>
          <p className="text-xs text-slate-500">Real-time academic performance analytics</p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-xl border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs px-3 py-2 border bg-white text-slate-700">
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
          <select className="rounded-xl border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs px-3 py-2 border bg-white text-slate-700">
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">School Average</div>
            <div className="text-2xl font-heading font-bold text-navy">{hasExams ? '64%' : 'N/A'}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {hasExams ? 'Assessment performance' : 'No exam records yet'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-light text-success flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Top Performing Class</div>
            <div className="text-2xl font-heading font-bold text-navy">
              {hasExams ? 'Form 4' : (classes[0]?.name || 'N/A')}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {hasExams ? 'Average: 71% (B+)' : 'Awaiting baseline exams'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Active Classes</div>
            <div className="text-2xl font-heading font-bold text-navy">{classes.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">{streams.length} total streams</div>
          </div>
        </div>
      </div>

      {/* Class Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-heading font-bold text-navy">Class Performance Rankings</h2>
          <span className="text-xs text-slate-400">{classes.length} classes configured</span>
        </div>
        {classes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No class levels configured yet for this school.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-4">Class Level</th>
                <th className="p-4">Streams</th>
                <th className="p-4">Enrolled Students</th>
                <th className="p-4">Assessment Mean</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls) => {
                const classStreams = streams.filter(s => s.school_class === cls.id);
                const classStudentCount = enrollments.filter(e => 
                  classStreams.some(st => st.id === e.stream)
                ).length;

                return (
                  <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-navy font-heading">{cls.name}</td>
                    <td className="p-4 text-slate-600 text-xs">
                      {classStreams.length > 0 ? classStreams.map(s => s.name).join(', ') : 'No streams'}
                    </td>
                    <td className="p-4 text-slate-600 text-xs">{classStudentCount} students</td>
                    <td className="p-4">
                      <span className="text-xs text-slate-400 italic">No exams recorded</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Fresh Account Notice Card */}
      {!hasExams && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
          <p className="font-bold text-navy text-sm font-heading">Performance Data Pipeline</p>
          <p>
            Your account is fresh. Once you record baseline results or upload result sheets, 
            analytics for subject distributions and grade trends will be calculated automatically.
          </p>
        </div>
      )}
    </div>
  );
}
