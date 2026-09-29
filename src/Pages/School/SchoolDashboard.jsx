import React, { useContext } from 'react';
import { useNavigate } from 'react-router';
import UserContext from '../../Context/UserContext';
import SchoolContext from '../../Context/SchoolContext';
import { Users, GraduationCap, Layers, BarChart3, UserCheck, Plus, Settings } from 'lucide-react';

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

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const schoolContext = useContext(SchoolContext);
  const school = schoolContext?.school;

  const schoolName = school?.name || 'School Dashboard';
  const academicYear = schoolContext?.activeAcademicYear?.name || schoolContext?.activeAcademicYear?.year || '2026';
  const currentTerm = 'Term 1';
  const curriculum = school?.curricula_offered || school?.curriculum || '';

  const streamsData = (schoolContext?.streams || []).map(st => {
    const studentCount = (schoolContext?.enrollments || []).filter(
      e => {
        const streamId = typeof e.stream === 'object' ? e.stream?.id : (e.stream || e.stream_id);
        const isActive = e.status ? e.status === 'active' : true;
        return streamId === st.id && isActive;
      }
    ).length;
    return {
      id: st.id,
      name: st.name,
      studentCount,
      teacher: st.class_teacher_detail?.first_name || null
    };
  });

  const totalStudents = schoolContext?.enrollments?.length || 0;
  const teacherCount = schoolContext?.teachers?.length || 0;
  const formCount = schoolContext?.classes?.length || 0;
  const streamCount = schoolContext?.streams?.length || 0;

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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        <StatCard label="Total Students" value={totalStudents} sub={`${streamCount} streams`} icon={<Users size={20} />} color="primary" />
        <StatCard label="Teachers" value={teacherCount} sub="Active staff" icon={<UserCheck size={20} />} color="accent" />
        <StatCard label="Forms & Classes" value={formCount} sub="Active class levels" icon={<Layers size={20} />} color="navy" />
        <StatCard label="Total Streams" value={streamCount} sub="Class groups" icon={<GraduationCap size={20} />} color="success" />
      </div>

      {/* Dedicated Performance Hub Callout Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-bold font-heading text-navy text-base">Academic Performance & Examination Hub</h2>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Consolidated analytics for Form and Stream comprehension, KCSE 4-year examination history, and automated student report cards.
          </p>
        </div>
        <button
          onClick={() => navigate('/school/performance')}
          className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span>View Performance Hub</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* Class & Stream Structure Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold font-heading text-navy text-base">Class & Stream Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">Overview of active streams and enrolled students</p>
          </div>
          <button 
            onClick={() => navigate('/school/classes')} 
            className="text-xs text-primary font-bold hover:underline"
          >
            Manage Structure →
          </button>
        </div>

        {streamsData.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No streams or classes registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Stream Name</th>
                  <th className="pb-3">Form / Class</th>
                  <th className="pb-3">Assigned Teacher</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {streamsData.map((stream) => {
                  const rawStream = (schoolContext?.streams || []).find(s => s.id === stream.id);
                  const parentClass = (schoolContext?.classes || []).find(c => c.id === rawStream?.school_class);
                  return (
                    <tr key={stream.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-semibold text-navy font-heading">
                        {stream.name}
                      </td>
                      <td className="py-3 text-slate-600 text-xs font-medium">
                        {parentClass?.name || 'Class'}
                      </td>
                      <td className="py-3 text-slate-600 text-xs">
                        {stream.teacher ? stream.teacher : <span className="text-slate-400 italic">Not assigned</span>}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/school/performance?tab=analytics`)}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          View Analytics →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {[
          { label: 'Add Students', icon: <Plus size={20} className="text-primary" />, action: () => navigate('/school/students') },
          { label: 'Assign Teacher', icon: <UserCheck size={20} className="text-accent" />, action: () => navigate('/school/teachers') },
          { label: 'KCSE History', icon: <GraduationCap size={20} className="text-navy" />, action: () => navigate('/school/performance?tab=kcse') },
          { label: 'Academic Settings', icon: <Settings size={20} className="text-success" />, action: () => navigate('/school/settings') },
        ].map(({ label, icon, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary hover:shadow-sm transition-all text-sm font-semibold text-navy font-heading cursor-pointer"
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
