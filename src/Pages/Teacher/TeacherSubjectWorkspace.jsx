import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ChevronLeft, 
  BookOpen, 
  Users, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
} from 'lucide-react';
import teacherCurriculumService from '../../services/teacherCurriculumService';
import TeacherContext from '../../Context/TeacherContext';

export default function TeacherSubjectWorkspace() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { activeSchool } = useContext(TeacherContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('subject'); // 'subject' | 'class'
  const [workspaceData, setWorkspaceData] = useState({ by_subject: [], by_class: [] });
  
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedStreamId, setSelectedStreamId] = useState(null);
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

          // Initial selection
          if (data.by_subject && data.by_subject.length > 0) {
            const initialSubj = subjectId 
              ? data.by_subject.find(s => String(s.id) === String(subjectId)) || data.by_subject[0]
              : data.by_subject[0];
            setSelectedSubjectId(initialSubj.id);
            if (initialSubj.streams && initialSubj.streams.length > 0) {
              setSelectedStreamId(initialSubj.streams[0].stream_id);
            }
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
  }, [activeSchool, subjectId]);

  const activeSubject = workspaceData.by_subject?.find(s => s.id === selectedSubjectId);
  const activeStream = activeSubject?.streams?.find(st => st.stream_id === selectedStreamId) || activeSubject?.streams?.[0];

  // Filter topics by search query
  const filteredTopics = (activeSubject?.topics || []).filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-3xl font-black text-navy mt-1">Curriculum & Lesson Facilitator</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Select an assigned subject and stream to access lessons, simulations, experiments, and teaching notes.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('subject')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'subject'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-navy'
              }`}
            >
              By Subject
            </button>
            <button
              onClick={() => setViewMode('class')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
          {/* Subject Pills / Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {workspaceData.by_subject?.map((subj) => {
              const isSelected = subj.id === selectedSubjectId;
              return (
                <button
                  key={subj.id}
                  onClick={() => {
                    setSelectedSubjectId(subj.id);
                    if (subj.streams && subj.streams.length > 0) {
                      setSelectedStreamId(subj.streams[0].stream_id);
                    }
                  }}
                  className={`px-5 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-navy text-white border-navy shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 ${isSelected ? 'text-primary-light' : 'text-slate-400'}`} />
                  {subj.name}
                  {subj.grade_name && (
                    <span className={`text-xs px-2 py-0.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {subj.grade_name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeSubject ? (
            <div className="space-y-6">
              {/* Stream Selector & Search Bar */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-2">
                    Target Stream:
                  </span>
                  {activeSubject.streams && activeSubject.streams.length > 0 ? (
                    activeSubject.streams.map((st) => {
                      const isStSelected = st.stream_id === (selectedStreamId || activeStream?.stream_id);
                      return (
                        <button
                          key={st.stream_id}
                          onClick={() => setSelectedStreamId(st.stream_id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isStSelected
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          {st.form_name} {st.stream_name} ({st.student_count} students)
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400 italic">No assigned streams for this subject.</span>
                  )}
                </div>

                <div className="relative md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search topics..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-navy placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.length === 0 ? (
                  <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-slate-500 font-semibold text-sm">No topics found matching your query.</p>
                  </div>
                ) : (
                  filteredTopics.map((topic) => {
                    const stId = selectedStreamId || activeStream?.stream_id || 1;
                    return (
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
                          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                            {topic.description || 'Comprehensive curriculum learning modules, simulations, and lab demonstrations.'}
                          </p>

                          {/* Resource Metrics Badges */}
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
                            {activeStream ? `${activeStream.form_name} ${activeStream.stream_name}` : 'Curriculum Topic'}
                          </span>
                          <button
                            onClick={() => navigate(`/teacher/topic-workspace/${stId}/${activeSubject.id}/${topic.id}`)}
                            className="px-4 py-2 bg-navy hover:bg-primary text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            Open Facilitator <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-navy">No Assigned Subjects Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                You do not have any subject assignments in this school. Contact your administrator.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: By Class / Stream */}
      {viewMode === 'class' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceData.by_class?.map((cls) => (
            <div
              key={cls.stream_id}
              className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs"
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
                  Assigned Teaching Subjects ({cls.subjects?.length || 0}):
                </p>

                <div className="mt-4 space-y-2">
                  {cls.subjects?.map((subj) => (
                    <button
                      key={subj.id}
                      onClick={() => {
                        setSelectedSubjectId(subj.id);
                        setSelectedStreamId(cls.stream_id);
                        setViewMode('subject');
                      }}
                      className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-navy group-hover:text-primary transition-colors">
                          {subj.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (cls.subjects && cls.subjects.length > 0) {
                      setSelectedSubjectId(cls.subjects[0].id);
                      setSelectedStreamId(cls.stream_id);
                      setViewMode('subject');
                    }
                  }}
                  className="w-full py-2.5 bg-navy hover:bg-slate-800 text-white font-bold rounded-xl text-xs text-center transition-colors cursor-pointer"
                >
                  Explore Class Topics
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
