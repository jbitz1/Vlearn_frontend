import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ChevronLeft, 
  BookOpen, 
  Play, 
  Eye, 
  FileText, 
  FlaskConical, 
  Video, 
  Sparkles, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Save, 
  BarChart3, 
  AlertCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import teacherCurriculumService from '../../services/teacherCurriculumService';
import UserContext from '../../Context/UserContext';
import TeacherContext from '../../Context/TeacherContext';

export const TeacherTopicWorkspace = () => {
  const { topicId, streamId: paramStreamId, subjectId: paramSubjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { activeSchool } = useContext(TeacherContext);

  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'simulations' | 'experiments' | 'videos' | 'resources'

  // Facilitation Notes state
  const [statusVal, setStatusVal] = useState('AVAILABLE');
  const [lastPosition, setLastPosition] = useState('');
  const [notesVal, setNotesVal] = useState('');
  const [isSavingLog, setIsSavingLog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadWorkspace = async () => {
      try {
        setIsLoading(true);
        // If streamId or subjectId not provided in route params, fetch default
        const sId = paramStreamId || 1;
        const subId = paramSubjectId || 1;
        const data = await teacherCurriculumService.getTopicWorkspace(sId, subId, topicId);
        
        if (isMounted) {
          setWorkspace(data);
          if (data.facilitation_log) {
            setStatusVal(data.facilitation_log.status || 'AVAILABLE');
            setLastPosition(data.facilitation_log.last_position || '');
            setNotesVal(data.facilitation_log.notes || '');
          }
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load topic workspace:', err);
        if (isMounted) setError('Failed to load topic workspace. Please verify your stream assignments.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWorkspace();
    return () => { isMounted = false; };
  }, [topicId, paramStreamId, paramSubjectId, activeSchool]);

  const handleSaveNotes = async () => {
    if (!workspace) return;
    try {
      setIsSavingLog(true);
      await teacherCurriculumService.saveTeachingLog({
        stream_id: workspace.stream.id,
        subject_id: workspace.subject.id,
        topic_id: workspace.topic.id,
        status: statusVal,
        last_position: lastPosition,
        notes: notesVal
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save log:', err);
      alert('Failed to save teaching notes. Please try again.');
    } finally {
      setIsSavingLog(false);
    }
  };

  const handleOpenLesson = (lessonId) => {
    navigate(`/lesson-viewer/${topicId}?lessonId=${lessonId}`);
  };

  const handleViewAsStudent = (lessonId) => {
    navigate(`/lesson-viewer/${topicId}?lessonId=${lessonId}&mode=preview`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading topic teaching workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-black text-navy">Unable to Load Topic Workspace</h2>
        <p className="text-sm text-slate-500">{error || 'Topic not found.'}</p>
        <button
          onClick={() => navigate('/teacher/my-teaching')}
          className="px-5 py-2.5 bg-navy text-white font-bold text-sm rounded-xl"
        >
          Return to My Teaching
        </button>
      </div>
    );
  }

  const { stream, subject, topic, lessons, simulations, experiments, videos, resources, performance } = workspace;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Header with Navigation */}
      <header className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <button
          onClick={() => navigate(`/teacher/subject/${subject.id}`)}
          className="flex items-center text-xs font-bold text-slate-400 hover:text-navy mb-4 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to {subject.name}
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-lg">
                {subject.name}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-lg">
                {stream.form_name} {stream.name}
              </span>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black rounded-lg">
                Topic {topic.order || 1}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-navy">{topic.name}</h1>
            <p className="text-slate-500 font-medium text-sm max-w-3xl leading-relaxed">
              {topic.description || 'Topic teaching workspace with curriculum lessons, interactive labs, and practical media.'}
            </p>
          </div>

          {/* Topic Performance Widget */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 self-start md:self-auto">
            <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Class Comprehension</p>
              <p className="text-xl font-black text-navy">
                {performance.average_score}% <span className="text-xs font-bold text-slate-500">(Grade {performance.grade})</span>
              </p>
              <p className="text-[11px] text-slate-400 font-semibold">{performance.assessments_count} Assessments administered</p>
            </div>
          </div>
        </div>
      </header>

      {/* Persistent Teaching Notes & Facilitation State Bar */}
      <section className="bg-amber-50/60 border-2 border-amber-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-200/60 text-amber-900 flex items-center justify-center font-black">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-950">Teaching Facilitation & Private Notes</h3>
              <p className="text-xs font-semibold text-amber-800">
                Track where you stopped in {stream.form_name} {stream.name} and record private lesson reflections.
              </p>
            </div>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900">Status:</span>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-black text-navy focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="AVAILABLE">Available</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="TAUGHT">Taught / Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-amber-900 mb-1">
              Where We Stopped:
            </label>
            <input
              type="text"
              value={lastPosition}
              onChange={(e) => setLastPosition(e.target.value)}
              placeholder="e.g. Worked Example 3, Page 2"
              className="w-full bg-white border border-amber-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-navy placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-900 mb-1">
              Private Teacher Notes & Misconceptions:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={notesVal}
                onChange={(e) => setNotesVal(e.target.value)}
                placeholder="e.g. Students struggled with activation energy curve. Need recap next class."
                className="flex-1 bg-white border border-amber-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-navy placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSavingLog}
                className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingLog ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Clean Resource Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'lessons'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Structured Lessons ({lessons.length})
          </button>

          <button
            onClick={() => setActiveTab('simulations')}
            className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'simulations'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Simulations ({simulations.length})
          </button>

          <button
            onClick={() => setActiveTab('experiments')}
            className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'experiments'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Experiments & Practicals ({experiments.length})
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'videos'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <Video className="w-4 h-4" />
            Videos ({videos.length})
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-3 px-4 font-black text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'resources'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Worksheets & Docs ({resources.length})
          </button>
        </div>

        {/* Tab 1: Lessons */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {lessons.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-semibold text-sm">No published lessons for this topic yet.</p>
              </div>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-primary/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-black rounded-md">
                        {lesson.duration}
                      </span>
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-black rounded-md">
                        {lesson.blocks_count} Steps
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-black rounded-md ${
                        lesson.status === 'TAUGHT'
                          ? 'bg-success/10 text-success'
                          : lesson.status === 'IN_PROGRESS'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {lesson.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-navy">{lesson.title}</h3>

                    {lesson.objectives && lesson.objectives.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Learning Objectives:</p>
                        <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                          {lesson.objectives.slice(0, 2).map((obj, i) => (
                            <li key={i}>{typeof obj === 'string' ? obj : JSON.stringify(obj)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleViewAsStudent(lesson.id)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-navy font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview as Student
                    </button>
                    <button
                      onClick={() => handleOpenLesson(lesson.id)}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary/20 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Launch Facilitator
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Simulations */}
        {activeTab === 'simulations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-semibold text-sm">No interactive simulations linked to this topic.</p>
              </div>
            ) : (
              simulations.map((sim) => (
                <div
                  key={sim.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-accent/50 transition-all shadow-xs group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-accent/10 text-accent text-xs font-black uppercase tracking-wider rounded-md">
                        {sim.archetype || 'Virtual Lab'}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">{sim.subject}</span>
                    </div>

                    <h3 className="text-lg font-black text-navy group-hover:text-accent transition-colors">
                      {sim.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                      {sim.description || 'Manipulate variables, observe reactions in real-time, and project interactive models.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/simulations`)}
                      className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Project in Classroom
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Experiments & Practicals */}
        {activeTab === 'experiments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <FlaskConical className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-semibold text-sm">No recorded practical experiments found for this topic.</p>
              </div>
            ) : (
              experiments.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-purple-300 transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-black uppercase rounded-md">
                        {exp.difficulty}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{exp.duration}</span>
                    </div>

                    <h3 className="text-lg font-black text-navy">{exp.title}</h3>
                    {exp.subtitle && (
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{exp.subtitle}</p>
                    )}
                    <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2 leading-relaxed">
                      {exp.description}
                    </p>
                    <p className="text-xs text-slate-400 font-bold mt-2">
                      Instructor: <span className="text-slate-700">{exp.instructor}</span>
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => navigate('/experiments')}
                      className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Watch Practical Lab
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Videos */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Video className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-semibold text-sm">No video assets linked to this topic.</p>
              </div>
            ) : (
              videos.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-xs font-black uppercase rounded-md">
                        {vid.asset_type === 'youtube' ? 'YouTube' : 'Curriculum Video'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-navy">{vid.title}</h3>
                    {vid.description && (
                      <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                        {vid.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-navy font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Watch Video
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Worksheets & Resources */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-semibold text-sm">No downloadable worksheets or documents available for this topic.</p>
              </div>
            ) : (
              resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase rounded-md">
                        {res.asset_type}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-navy">{res.title}</h3>
                    {res.description && (
                      <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                        {res.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Open / Download
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTopicWorkspace;

