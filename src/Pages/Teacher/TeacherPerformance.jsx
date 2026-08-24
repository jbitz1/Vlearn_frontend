import React, { useState, useEffect, useContext } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  ChevronLeft, 
  Building2, 
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router';
import teacherCurriculumService from '../../services/teacherCurriculumService';
import TeacherContext from '../../Context/TeacherContext';

function Bar({ value, color = '#02A0BF' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all" 
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }} 
        />
      </div>
      <span className="text-xs font-black text-navy w-9 text-right">{value}%</span>
    </div>
  );
}

function getColor(v) {
  if (v >= 70) return '#10b981';
  if (v >= 55) return '#02A0BF';
  if (v >= 40) return '#f59e0b';
  return '#ef4444';
}

export default function TeacherPerformance() {
  const navigate = useNavigate();
  const { activeSchool } = useContext(TeacherContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'supervised'

  useEffect(() => {
    let isMounted = true;
    const fetchPerf = async () => {
      try {
        setLoading(true);
        const data = await teacherCurriculumService.getTeacherPerformance();
        if (isMounted) {
          setPerfData(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load performance:', err);
        if (isMounted) setError('Failed to load performance analytics.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPerf();
    return () => { isMounted = false; };
  }, [activeSchool]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading performance analytics...</p>
        </div>
      </div>
    );
  }

  const { is_class_teacher, subjects_performance = [], supervised_streams_performance = [] } = perfData || {};

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <header className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="flex items-center text-xs font-bold text-slate-400 hover:text-navy mb-3 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-full">
                Performance Analytics
              </span>
              {activeSchool?.name && (
                <span className="text-xs font-semibold text-slate-400">
                  • {activeSchool.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-navy">Class & Subject Performance</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Assessment averages, student trends, and topic comprehension across your assigned classes.
            </p>
          </div>

          {/* Mode Switcher for Class Teachers */}
          {is_class_teacher && (
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl shrink-0 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('subjects')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'subjects'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-500 hover:text-navy'
                }`}
              >
                My Subjects ({subjects_performance.length})
              </button>
              <button
                onClick={() => setActiveTab('supervised')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'supervised'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-500 hover:text-navy'
                }`}
              >
                Supervised Class ({supervised_streams_performance.length})
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tab 1: My Subjects Performance */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {subjects_performance.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-navy">No Subject Performance Records</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No examination marks have been entered for your assigned subjects yet.
              </p>
            </div>
          ) : (
            subjects_performance.map((subj) => (
              <div key={subj.subject_id} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-navy">{subj.academic_title || subj.subject_name}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {subj.streams?.length || 0} Assigned Streams
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-black uppercase text-slate-400">Subject Average</p>
                      <p className="text-2xl font-black text-navy">{subj.average_score}%</p>
                    </div>
                    <span className="px-3 py-1.5 bg-primary/10 text-primary font-black rounded-xl text-sm">
                      {subj.grade}
                    </span>
                  </div>
                </div>

                {/* Streams Table */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                    Stream Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="p-3 pl-4">Stream</th>
                          <th className="p-3">Students</th>
                          <th className="p-3 w-1/3">Average Score</th>
                          <th className="p-3 pr-4">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {subj.streams?.map((st) => (
                          <tr key={st.stream_id} className="hover:bg-slate-50/50">
                            <td className="p-3 pl-4 font-bold text-navy">
                              {st.form_name} {st.stream_name}
                            </td>
                            <td className="p-3 text-slate-500 font-semibold">{st.student_count}</td>
                            <td className="p-3">
                              <Bar value={st.average_score} color={getColor(st.average_score)} />
                            </td>
                            <td className="p-3 pr-4">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-black rounded">
                                {st.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Topics Comprehension */}
                {subj.topics && subj.topics.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                      Topic Comprehension Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {subj.topics.map((top) => (
                        <div key={top.topic_id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs font-black text-navy truncate">{top.topic_name}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">{top.average_score}%</span>
                            <span className="px-2 py-0.5 bg-white text-navy font-black text-[10px] rounded border border-slate-200">
                              Grade {top.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Supervised Class Performance (Class Teacher) */}
      {activeTab === 'supervised' && is_class_teacher && (
        <div className="space-y-6">
          {supervised_streams_performance.map((cls) => (
            <div key={cls.stream_id} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-navy">{cls.form_name} {cls.stream_name}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    {cls.student_count} Enrolled Students • Supervised Stream Overview
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black uppercase text-slate-400">Class Mean</p>
                    <p className="text-2xl font-black text-success">{cls.overall_average}%</p>
                  </div>
                  <span className="px-3 py-1.5 bg-success/10 text-success font-black rounded-xl text-sm">
                    {cls.overall_grade}
                  </span>
                </div>
              </div>

              {/* Subject Comparison Table */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  All Subjects in Stream
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="p-3 pl-4">Subject</th>
                        <th className="p-3">Subject Teacher</th>
                        <th className="p-3 w-1/3">Assessment Mean</th>
                        <th className="p-3 pr-4">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {cls.subjects?.map((subj, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 pl-4 font-bold text-navy">{subj.academic_title || subj.subject_name}</td>
                          <td className="p-3 text-slate-500 font-semibold">{subj.teacher_name}</td>
                          <td className="p-3">
                            <Bar value={subj.average_score} color={getColor(subj.average_score)} />
                          </td>
                          <td className="p-3 pr-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-black rounded">
                              {subj.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
