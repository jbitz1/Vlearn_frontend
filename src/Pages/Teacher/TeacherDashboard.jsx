import { useState, useEffect, useContext } from 'react';
import { 
  BookOpen, 
  Users, 
  AlertTriangle, 
  Play, 
  ChevronRight, 
  Clock, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  FileText,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router';
import UserContext from '../../Context/UserContext';
import TeacherContext from '../../Context/TeacherContext';
import teacherCurriculumService from '../../services/teacherCurriculumService';

export default function TeacherDashboard() {
  const { user } = useContext(UserContext);
  const { activeSchool } = useContext(TeacherContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      streams_count: 0,
      subjects_count: 0,
      students_count: 0,
      pending_assessments_count: 0
    },
    continue_teaching: null,
    my_teaching_today: [],
    recently_taught: [],
    my_class: null
  });

  const teacherDisplayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'Teacher';

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await teacherCurriculumService.getTeacherDashboard();
        if (isMounted) {
          setDashboardData(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching teacher dashboard:', err);
        if (isMounted) {
          setError('Failed to load teaching dashboard. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => { isMounted = false; };
  }, [activeSchool]);

  const { metrics, continue_teaching, my_teaching_today, recently_taught, my_class } = dashboardData;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading teaching workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-full">
                Dashboard
              </span>
              {activeSchool?.name && (
                <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                  • <Building2 className="w-3.5 h-3.5" /> {activeSchool.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-navy">Welcome back, {teacherDisplayName}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Here are your teaching assignments, active lessons, and classroom performance for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/my-teaching')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-navy font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              My Teaching
            </button>
            <button
              onClick={() => navigate('/teacher/assessments')}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              Assessments
            </button>
          </div>
        </div>
      </header>

      {/* Hero: Continue Teaching */}
      {continue_teaching && (
        <section className="bg-white border-2 border-primary/20 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Continue Teaching
                </span>
                <span className="text-slate-500 text-xs font-bold">
                  {continue_teaching.form_name} · {continue_teaching.stream_name}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight">
                {continue_teaching.topic_name}
              </h2>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Subject: <span className="text-navy font-bold">{continue_teaching.subject_name}</span>
                {continue_teaching.last_position && (
                  <> • Stopped at: <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-navy font-bold">{continue_teaching.last_position}</span></>
                )}
              </p>
              {continue_teaching.notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium italic">
                  "{continue_teaching.notes}"
                </div>
              )}
            </div>
            <button
              onClick={() => navigate(`/teacher/topic-workspace/${continue_teaching.stream_id}/${continue_teaching.subject_id}/${continue_teaching.topic_id}`)}
              className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white font-black rounded-xl text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> Resume Teaching
            </button>
          </div>
        </section>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Streams I Teach</p>
            <h2 className="text-3xl font-black text-navy mt-1">{metrics.streams_count}</h2>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Subjects</p>
            <h2 className="text-3xl font-black text-navy mt-1">{metrics.subjects_count}</h2>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Students</p>
            <h2 className="text-3xl font-black text-navy mt-1">{metrics.students_count}</h2>
          </div>
          <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Open Exams</p>
            <h2 className="text-3xl font-black text-navy mt-1">{metrics.pending_assessments_count}</h2>
          </div>
          <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center text-warning">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Supervised Class Pulse (if class teacher) */}
      {my_class && (
        <section className="bg-white rounded-3xl border-2 border-primary/30 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-primary text-white text-[11px] font-black uppercase tracking-wider rounded-md">
                  Supervised Class
                </span>
                <span className="text-xs font-bold text-slate-400">Class Teacher Responsibilities</span>
              </div>
              <h2 className="text-2xl font-black text-navy">
                {my_class.form_name} {my_class.name}
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-0.5">
                {my_class.student_count} Enrolled Students • {my_class.overall_assessment_average}% Overall Average (Grade {my_class.overall_grade})
              </p>
            </div>
            <button
              onClick={() => navigate('/teacher/my-class')}
              className="px-5 py-2.5 bg-navy hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shrink-0"
            >
              Class Roster & Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Subject Performance Overview
              </h3>
              <div className="space-y-3">
                {my_class.subject_performances && my_class.subject_performances.length > 0 ? (
                  my_class.subject_performances.slice(0, 4).map((subj, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-bold text-navy">{subj.subject_name}</p>
                        <p className="text-xs text-slate-400">Teacher: {subj.teacher_name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-28 hidden sm:block h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${subj.assessment_average >= 60 ? 'bg-success' : 'bg-warning'}`}
                            style={{ width: `${Math.min(100, Math.max(0, subj.assessment_average))}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-navy w-12 text-right">
                          {subj.assessment_average}%
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-black rounded">
                          {subj.grade}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No subject assessment records yet.</p>
                )}
              </div>
            </div>

            <div className="bg-danger/5 border border-danger/20 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-danger mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-xs font-black uppercase tracking-wider">Student Attention</h3>
                </div>
                <h4 className="text-3xl font-black text-danger">
                  {my_class.students_requiring_attention_count}
                </h4>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  Students performing below 50% or needing academic intervention.
                </p>
              </div>
              <button
                onClick={() => navigate('/teacher/my-class')}
                className="mt-4 w-full py-2 bg-danger text-white rounded-xl text-xs font-bold hover:bg-danger-dark transition-colors"
              >
                Review Struggling Students
              </button>
            </div>
          </div>
        </section>
      )}

      {/* My Teaching Today */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-navy">My Teaching Streams</h2>
            <p className="text-sm text-slate-500 font-medium">Assigned subjects and streams for facilitation</p>
          </div>
          <button
            onClick={() => navigate('/teacher/my-teaching')}
            className="text-primary hover:text-primary-dark font-bold text-sm flex items-center gap-1"
          >
            All Subjects <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {my_teaching_today.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-navy">No Teaching Assignments Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              You do not have any active subject or stream assignments in {activeSchool?.name || 'your school'}. Contact your school administrator to assign streams.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {my_teaching_today.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-lg">
                      {item.subject_name}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {item.student_count} Students
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-navy group-hover:text-primary transition-colors">
                    {item.form_name} {item.stream_name}
                  </h3>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Current Topic</p>
                    <p className="text-sm font-bold text-navy line-clamp-1">{item.current_topic}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      Last Taught: <span className="font-bold text-slate-700">{item.last_taught}</span>
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Topic Completion</span>
                      <span className="text-primary">{item.learning_progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.learning_progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 font-semibold">Class Avg: </span>
                    <span className="font-black text-navy">{item.assessment_average}%</span>
                  </div>
                  {item.topic_id ? (
                    <button
                      onClick={() => navigate(`/teacher/topic-workspace/${item.stream_id}/${item.subject_id}/${item.topic_id}`)}
                      className="px-4 py-2 bg-navy hover:bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Teach Topic <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/teacher/my-teaching')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      View Topics
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently Taught Timeline */}
      {recently_taught.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-navy">Recently Taught Lessons</h2>
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {recently_taught.map((log) => (
              <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-navy text-base">{log.topic_name}</span>
                      <span className="text-xs font-bold text-slate-400">• {log.subject_name}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {log.form_name} {log.stream_name} {log.last_position && `• Stopped at: ${log.last_position}`}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-slate-600 italic mt-1 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                        Note: {log.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 sm:self-center">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {log.time_ago}
                  </span>
                  <button
                    onClick={() => navigate(`/teacher/topic-workspace/${log.stream_id}/${log.subject_id}/${log.topic_id}`)}
                    className="px-4 py-2 bg-slate-100 hover:bg-navy hover:text-white text-navy font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Continue Lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

