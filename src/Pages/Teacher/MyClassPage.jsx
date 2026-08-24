import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  BookOpen, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  Mail, 
  Phone, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router';
import teacherCurriculumService from '../../services/teacherCurriculumService';
import TeacherContext from '../../Context/TeacherContext';

function Bar({ value, color = '#02A0BF' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }} />
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

export default function MyClassPage() {
  const navigate = useNavigate();
  const { activeSchool } = useContext(TeacherContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);
  const [selectedStreamId, setSelectedStreamId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'teachers' | 'topics' | 'attention'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const data = await teacherCurriculumService.getMyClassDetails(selectedStreamId);
        if (isMounted) {
          setClassData(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load class details:', err);
        if (isMounted) setError('Failed to load class management data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClassDetails();
    return () => { isMounted = false; };
  }, [activeSchool, selectedStreamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading supervised class workspace...</p>
        </div>
      </div>
    );
  }

  if (!classData?.is_class_teacher && (!classData?.supervised_streams || classData.supervised_streams.length === 0)) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4">
        <Users className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-black text-navy">No Supervised Class Assigned</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          You are currently not assigned as a Class Teacher for any stream in {activeSchool?.name || 'your school'}. 
          Class teachers are designated by the school administration to supervise student rosters and track overall stream performance.
        </p>
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="px-6 py-2.5 bg-navy hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { selected_stream, students = [], subject_teachers = [], topic_performance = [], attention_students = [], supervised_streams = [] } = classData;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.admission_number && s.admission_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <span className="px-3 py-1 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-lg">
                Supervised Class
              </span>
              {activeSchool?.name && (
                <span className="text-xs font-semibold text-slate-400">
                  • {activeSchool.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-navy">
              {selected_stream?.form_name} {selected_stream?.name}
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Class Teacher Management Center • Academic Year 2026
            </p>
          </div>

          {/* Supervised Stream Selector if supervising multiple streams */}
          {supervised_streams.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Switch Stream:</span>
              <select
                value={selected_stream?.id || ''}
                onChange={(e) => setSelectedStreamId(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-navy focus:outline-none focus:border-primary"
              >
                {supervised_streams.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.form_name} {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Enrolled Students</p>
            <h3 className="text-3xl font-black text-navy mt-1">{selected_stream?.student_count || students.length}</h3>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Class Average</p>
            <h3 className="text-3xl font-black text-success mt-1">
              {selected_stream?.overall_assessment_average || 0}%
            </h3>
          </div>
          <div className="w-12 h-12 bg-success/10 text-success rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Class Grade</p>
            <h3 className="text-3xl font-black text-navy mt-1">
              {selected_stream?.overall_grade || 'B'}
            </h3>
          </div>
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-danger/20 p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-danger">Need Attention</p>
            <h3 className="text-3xl font-black text-danger mt-1">
              {selected_stream?.students_requiring_attention_count || attention_students.length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Subject Performance ({subject_teachers.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'students'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <Users className="w-4 h-4" /> Students Roster ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'teachers'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Subject Teachers ({subject_teachers.length})
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'topics'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Topic Breakdown
        </button>

        <button
          onClick={() => setActiveTab('attention')}
          className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'attention'
              ? 'border-danger text-danger'
              : 'border-transparent text-slate-500 hover:text-danger'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Academic Intervention ({attention_students.length})
        </button>
      </div>

      {/* Tab 1: Subject Performance Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-navy">Subject Breakdown</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Calculated from subject examinations administered across {selected_stream?.form_name} {selected_stream?.name}.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {subject_teachers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No subject assessment entries recorded for this stream.</p>
              ) : (
                subject_teachers.map((subj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="md:w-1/3">
                      <h4 className="font-black text-navy text-base">{subj.subject_name}</h4>
                      <p className="text-xs font-semibold text-slate-400">Teacher: {subj.teacher_name}</p>
                    </div>

                    <div className="flex-1">
                      <Bar value={subj.assessment_average} color={getColor(subj.assessment_average)} />
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                        subj.assessment_average >= 60
                          ? 'bg-success/10 text-success'
                          : subj.assessment_average >= 50
                          ? 'bg-warning/10 text-warning'
                          : 'bg-danger/10 text-danger'
                      }`}>
                        Grade {subj.grade}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Students Roster */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name or admission number..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-navy placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Showing {filteredStudents.length} of {students.length} Students
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Admission No.</th>
                    <th className="px-6 py-4">Parent Phone</th>
                    <th className="px-6 py-4">Assessment Avg</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const isStruggling = st.average_score < 50 && st.average_score > 0;
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-navy">
                            {st.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                            {st.admission_number}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {st.phone_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-36">
                              <Bar value={st.average_score} color={getColor(st.average_score)} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                              st.average_score >= 60 ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {st.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isStruggling ? (
                              <span className="px-2.5 py-1 bg-danger/10 text-danger text-xs font-bold rounded-lg flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-success/10 text-success text-xs font-bold rounded-lg flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Good Standing
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Subject Teachers */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subject_teachers.map((teacher, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-lg">
                  {teacher.subject_name}
                </span>
                <h3 className="text-xl font-black text-navy mt-3">{teacher.teacher_name}</h3>
                <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                  <p className="flex items-center gap-2 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {teacher.email}
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {teacher.phone_number}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Class Average:</span>
                <span className="text-sm font-black text-navy">{teacher.assessment_average}% (Grade {teacher.grade})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Topic-Level Breakdown */}
      {activeTab === 'topics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
          <h3 className="text-xl font-black text-navy">Class Topic Comprehension</h3>
          <p className="text-xs text-slate-500 font-medium">
            Topic-level score breakdown for {selected_stream?.form_name} {selected_stream?.name}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {topic_performance.map((top, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">{top.subject_name}</span>
                  <h4 className="font-bold text-navy text-sm">{top.topic_name}</h4>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-navy">{top.average_score}%</p>
                  <span className="text-xs font-bold text-slate-400">Grade {top.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Academic Intervention (Attention Students) */}
      {activeTab === 'attention' && (
        <div className="space-y-4">
          <div className="bg-danger/5 border border-danger/20 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-black text-danger flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Students Requiring Academic Attention
            </h3>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              The following students are performing below the 50% benchmark across their class examinations and require teacher support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attention_students.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
                <h4 className="font-bold text-navy">No Struggling Students</h4>
                <p className="text-xs text-slate-500">All students currently meet or exceed expected performance targets.</p>
              </div>
            ) : (
              attention_students.map((st) => (
                <div key={st.id} className="bg-white border border-danger/20 rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-black text-navy">{st.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">ADM: {st.admission_number}</p>
                    </div>
                    <span className="px-3 py-1 bg-danger/10 text-danger text-xs font-black rounded-lg">
                      {st.average_score}% (Grade {st.grade})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl font-medium">
                    Reason: {st.reason || 'Underperforming across recent assessment entries.'}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Parent: {st.phone_number}</span>
                    <span className="font-bold text-primary">{st.assessments_taken} Assessments logged</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

