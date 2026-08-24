import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ChevronLeft, 
  BookOpen, 
  Users, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  Play,
  Layers,
  Sparkles,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import teacherCurriculumService from '../../services/teacherCurriculumService';
import TeacherContext from '../../Context/TeacherContext';

export default function TeacherSubjectWorkspace() {
  const { subjectId, streamId } = useParams();
  const navigate = useNavigate();
  const { activeSchool } = useContext(TeacherContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('subject'); // 'subject' | 'class'
  const [workspaceData, setWorkspaceData] = useState({ by_subject: [], by_class: [] });
  
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId ? Number(subjectId) : null);
  const [selectedStreamId, setSelectedStreamId] = useState(streamId ? Number(streamId) : null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const data = await teacherCurriculumService.getTeachingWorkspace();
        if (isMounted) {
          setWorkspaceData(data);
          setError(null);

          if (subjectId && streamId) {
            setSelectedSubjectId(Number(subjectId));
            setSelectedStreamId(Number(streamId));
          }
        }
      } catch (err) {
        console.error('Failed to load teaching workspace:', err);
        if (isMounted) setError('Failed to load teaching materials. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWorkspace();
    return () => { isMounted = false; };
  }, [activeSchool, subjectId, streamId]);

  const activeSubject = workspaceData.by_subject?.find(s => s.id === selectedSubjectId);
  const activeStream = activeSubject?.streams?.find(st => st.stream_id === selectedStreamId) 
    || workspaceData.by_class?.find(c => c.stream_id === selectedStreamId);

  // Filter topics by search query
  const filteredTopics = (activeSubject?.topics || []).filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const taughtTopicsCount = (activeSubject?.topics || []).filter(t => t.status === 'TAUGHT').length;
  const totalTopicsCount = activeSubject?.topics?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading teaching curriculum...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // LEVEL 2: STREAM TEACHING WORKSPACE
  // ==========================================
  if (activeSubject && selectedStreamId) {
    return (
      <div className="space-y-8 pb-12 max-w-7xl mx-auto">
        {/* Stream Workspace Header */}
        <header className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <button
            onClick={() => {
              setSelectedStreamId(null);
              setSelectedSubjectId(null);
            }}
            className="flex items-center text-xs font-bold text-slate-400 hover:text-navy mb-4 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Teaching Overview
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-full">
                  Stream Teaching Workspace
                </span>
                <span className="text-slate-400 text-xs font-semibold">
                  • {activeStream?.form_name} {activeStream?.stream_name}
                </span>
              </div>
              <h1 className="text-3xl font-black text-navy">
                {activeSubject.academic_title || activeSubject.name} · {activeStream?.stream_name}
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                {activeStream?.student_count || 0} Enrolled Students • {totalTopicsCount} Topics • Teaching progress: {taughtTopicsCount}/{totalTopicsCount} taught
              </p>
            </div>

            {/* Topic Search */}
            <div className="relative md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics in this subject..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-navy placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Progress Bar */}
          {totalTopicsCount > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Curriculum Progress</span>
                <span className="text-primary">{Math.round((taughtTopicsCount / totalTopicsCount) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(taughtTopicsCount / totalTopicsCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-semibold text-sm">No topics found matching your search.</p>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider rounded-lg">
                      Topic {topic.order || 1}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${
                      topic.status === 'TAUGHT'
                        ? 'bg-success/10 text-success'
                        : topic.status === 'IN_PROGRESS'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {topic.status === 'TAUGHT' ? 'Taught' : topic.status === 'IN_PROGRESS' ? 'In Progress' : 'Available'}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-navy group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                    {topic.description || 'Comprehensive curriculum learning modules, simulations, and lab demonstrations.'}
                  </p>

                  {/* Resource Badges */}
                  <div className="grid grid-cols-4 gap-2 mt-5 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <p className="text-xs font-black text-navy">{topic.lessons_count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lessons</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-accent">{topic.simulations_count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Sims</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-purple-600">{topic.experiments_count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Labs</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-600">{topic.resources_count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Docs</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    {activeStream?.form_name} {activeStream?.stream_name}
                  </span>
                  <button
                    onClick={() => navigate(`/teacher/topic-workspace/${selectedStreamId}/${activeSubject.id}/${topic.id}`)}
                    className="px-4 py-2 bg-navy hover:bg-primary text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    Teach Topic <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // LEVEL 1: ASSIGNMENT OVERVIEW (LANDING)
  // ==========================================
  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
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
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-full">
              My Teaching
            </span>
            <h1 className="text-3xl font-black text-navy mt-1">Teaching Assignments Overview</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Select a stream under your assigned subjects or browse by your taught classes.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('subject')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'subject'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-navy'
              }`}
            >
              By Subject
            </button>
            <button
              onClick={() => setViewMode('class')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'class'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-navy'
              }`}
            >
              By Class / Stream
            </button>
          </div>
        </div>
      </header>

      {/* Mode 1: By Subject */}
      {viewMode === 'subject' && (
        <div className="space-y-6">
          {(!workspaceData.by_subject || workspaceData.by_subject.length === 0) ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-navy">No Assigned Subjects</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                You do not have any active subject assignments in this school. Contact your school administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workspaceData.by_subject.map((subj) => (
                <div
                  key={subj.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-lg">
                        {subj.topics?.length || 0} Topics
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-navy">
                      {subj.academic_title || subj.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                      {subj.grade_name ? `Academic Level: ${subj.grade_name}` : 'Curriculum Subject'}
                    </p>

                    {/* Assigned Streams */}
                    <div className="mt-5 space-y-2">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Streams I Teach:
                      </p>

                      {subj.streams && subj.streams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {subj.streams.map((st) => (
                            <button
                              key={st.stream_id}
                              onClick={() => {
                                setSelectedSubjectId(subj.id);
                                setSelectedStreamId(st.stream_id);
                              }}
                              className="p-3 bg-slate-50 hover:bg-primary/10 border border-slate-100 hover:border-primary/30 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div>
                                <p className="text-sm font-black text-navy group-hover:text-primary transition-colors">
                                  {st.form_name} {st.stream_name}
                                </p>
                                <p className="text-xs font-medium text-slate-400">
                                  {st.student_count} Students
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400 font-semibold italic">
                          No streams currently assigned
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: By Class / Stream */}
      {viewMode === 'class' && (
        <div className="space-y-6">
          {(!workspaceData.by_class || workspaceData.by_class.length === 0) ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-navy">No Assigned Classes</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                You do not have any stream assignments in this school. Contact your school administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaceData.by_class.map((cls) => (
                <div
                  key={cls.stream_id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-lg">
                        {cls.student_count} Students
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-navy">
                      {cls.form_name} {cls.stream_name}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Subjects I Teach Here ({cls.subjects?.length || 0}):
                    </p>

                    <div className="mt-4 space-y-2">
                      {cls.subjects?.map((subj) => (
                        <button
                          key={subj.id}
                          onClick={() => {
                            setSelectedSubjectId(subj.id);
                            setSelectedStreamId(cls.stream_id);
                          }}
                          className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 flex items-center justify-between text-left transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <div>
                              <span className="text-xs font-bold text-navy group-hover:text-primary transition-colors block">
                                {subj.academic_title || subj.name}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
