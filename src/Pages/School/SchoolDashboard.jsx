import React, { useContext } from 'react';
import { useNavigate } from 'react-router';
import UserContext from '../../Context/UserContext';
import SchoolContext from '../../Context/SchoolContext';
import { Users, GraduationCap, Layers, BarChart3, TrendingUp, UserCheck, Plus, Settings } from 'lucide-react';

function StatCard({ label, value, sub, color = 'primary', icon }) {
  const colors = {
    primary: 'bg-primary-light text-primary',
    accent: 'bg-accent-light text-accent',
    navy: 'bg-navy/10 text-navy',
    success: 'bg-success-light text-success',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold font-heading text-navy">{value}</p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value, color = '#02A0BF' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-8 text-right">{value}%</span>
    </div>
  );
}

function getPerformanceColor(val) {
  if (val >= 70) return '#10b981';
  if (val >= 55) return '#02A0BF';
  if (val >= 40) return '#f59e0b';
  return '#ef4444';
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const schoolContext = useContext(SchoolContext);
  const school = schoolContext?.school;

  const schoolName = school?.name || 'School Dashboard';
  const academicYear = schoolContext?.activeAcademicYear?.year || '2026';
  const currentTerm = 'Term 1';
  const curriculum = school?.curricula_offered || school?.curriculum || '';

  const formsData = (schoolContext?.classes || []).map((cls, idx) => ({
    id: cls.id,
    level: String(idx + 1),
    name: cls.name,
    assessment: 0
  }));

  const streamsData = (schoolContext?.streams || []).map(st => ({
    id: st.id,
    name: st.name,
    studentCount: 0,
    assessment: 0,
    progress: 0,
    teacher: st.class_teacher_detail?.first_name || null
  }));

  const totalStudents = schoolContext?.enrollments?.length || 0;
  const teacherCount = schoolContext?.teachers?.length || 0;
  const formCount = schoolContext?.classes?.length || 0;
  const streamCount = schoolContext?.streams?.length || 0;

  const schoolAssessment = 0;
  const schoolProgress = 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-navy">{schoolName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Academic Year {academicYear} · {currentTerm} · {curriculum}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-success-light text-success text-xs font-semibold self-start sm:self-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Active
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={totalStudents} sub={`${streamCount} streams`} icon={<Users size={20} />} color="primary" />
        <StatCard label="Teachers" value={teacherCount} sub="Active staff" icon={<UserCheck size={20} />} color="accent" />
        <StatCard label="Forms" value={formCount} sub={`${streamCount} streams`} icon={<Layers size={20} />} color="navy" />
        <StatCard label="School Average" value={schoolAssessment > 0 ? `${schoolAssessment}%` : 'N/A'} sub="Assessment performance" icon={<BarChart3 size={20} />} color="success" />
      </div>

      {/* Performance overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* School performance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold font-heading text-navy">School Performance</h2>
            <span className="text-xs text-slate-400">{currentTerm} · {academicYear}</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Assessment Average</span>
                <span className="text-navy font-bold">{schoolAssessment > 0 ? `${schoolAssessment}%` : 'N/A'}</span>
              </div>
              <ProgressBar value={schoolAssessment} color={getPerformanceColor(schoolAssessment)} />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Learning Progress</span>
                <span className="text-navy font-bold">{schoolProgress > 0 ? `${schoolProgress}%` : 'N/A'}</span>
              </div>
              <ProgressBar value={schoolProgress} color="#ff8400" />
            </div>
          </div>
          {schoolAssessment > 0 ? (
            <div className="flex items-center gap-1.5 mt-4 p-3 rounded-xl bg-success-light">
              <TrendingUp size={14} className="text-success" />
              <span className="text-xs text-success font-semibold">Performance on track</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">No assessment performance recorded yet for this school.</span>
            </div>
          )}
        </div>

        {/* Form performance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold font-heading text-navy">Performance by Form</h2>
            <button
              onClick={() => navigate('/school/performance')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {formsData.map(form => (
              <button
                key={form.id}
                onClick={() => navigate('/school/performance')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-navy font-heading">{form.level}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-navy font-heading">{form.name}</span>
                    <span className="text-xs font-semibold text-slate-600">{form.assessment}%</span>
                  </div>
                  <ProgressBar value={form.assessment} color={getPerformanceColor(form.assessment)} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stream overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold font-heading text-navy">Stream Performance Overview</h2>
          <button onClick={() => navigate('/school/academic-structure')} className="text-xs text-primary font-semibold hover:underline">
            Manage classes →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-semibold text-slate-500">Stream</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500">Students</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 w-44">Assessment</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 w-44">Progress</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500">Class Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {streamsData.map(stream => (
                <tr key={stream.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <button
                      onClick={() => navigate('/school/academic-structure')}
                      className="font-semibold text-navy font-heading hover:text-primary transition-colors"
                    >
                      {stream.name}
                    </button>
                  </td>
                  <td className="py-3 text-slate-600">{stream.studentCount}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-24 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${stream.assessment}%`, backgroundColor: getPerformanceColor(stream.assessment) }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{stream.assessment}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-24 overflow-hidden">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${stream.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{stream.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600 text-xs">
                    {stream.teacher ? stream.teacher : <span className="text-slate-400 italic">Not assigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Students', icon: <Plus size={20} className="text-primary" />, action: () => navigate('/school/students') },
          { label: 'Assign Teacher', icon: <UserCheck size={20} className="text-accent" />, action: () => navigate('/school/teachers') },
          { label: 'View KCSE History', icon: <GraduationCap size={20} className="text-navy" />, action: () => navigate('/school/final-exams') },
          { label: 'New Academic Year', icon: <Settings size={20} className="text-success" />, action: () => navigate('/school/year-transition') },
        ].map(({ label, icon, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary hover:shadow-sm transition-all text-sm font-semibold text-navy font-heading"
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
