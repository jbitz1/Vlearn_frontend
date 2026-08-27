import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, BookOpen, Clock, Play, CheckCircle2, RotateCcw, Cpu, Video, X } from 'lucide-react';
import studentCurriculumService from '../../services/studentCurriculumService';
import UserContext from '../../Context/UserContext';
import ProgressCircle from '../../Components/Common/ProgressCircle';
import SimulationViewerContainer from './Simulations/SimulationViewerContainer';

export const TopicWorkspace = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({ isCompleted: false, isStarted: false, pct: 0 });

  useEffect(() => {
    const loadTopicData = async () => {
      setIsLoading(true);
      const fetchedTopic = await studentCurriculumService.getTopicById(topicId);
      setTopic(fetchedTopic);

      let subjectName = fetchedTopic?.subject_name || '';
      if (fetchedTopic?.subject) {
        studentCurriculumService.recordSubjectAccess(fetchedTopic.subject, user?.id);
        if (!subjectName) {
          try {
            const subj = await studentCurriculumService.getSubjectById(fetchedTopic.subject);
            subjectName = subj?.name || '';
          } catch {}
        }
      }

      const topicName = fetchedTopic?.name || '';

      const [fetchedLessons, fetchedSims, fetchedExps] = await Promise.all([
        studentCurriculumService.getLessonsForTopic(topicId),
        studentCurriculumService.getSimulations(subjectName, topicName),
        studentCurriculumService.getExperiments(subjectName, topicName)
      ]);

      setLessons(fetchedLessons);
      setSimulations(fetchedSims);
      setExperiments(fetchedExps);

      // Pass the actual total lesson count so progress % is correct (e.g. 1/5 = 20%, not 100%)
      const localProgress = studentCurriculumService.getTopicProgress(topicId, user?.id, fetchedLessons.length);
      setProgress(localProgress);

      setIsLoading(false);
    };

    loadTopicData();
  }, [topicId, user?.id]);

  const handleLaunchLesson = (lessonId) => {
    navigate(`/student/lesson-viewer/${topicId}?lessonId=${lessonId}&from=student`);
  };

  return (
    <div className="pl-14 pr-4 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8 min-h-screen">
      {/* Back link */}
      <button
        onClick={() => {
          if (topic?.subject) {
            navigate(`/student/subject/${topic.subject}`);
          } else {
            navigate('/student/subjects');
          }
        }}
        className="flex items-center text-xs sm:text-sm font-bold text-custom-blue hover:underline cursor-pointer min-h-[40px]"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Subject
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs sm:shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4 sm:gap-6">
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
              {topic?.name || 'Topic'}
            </h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1">
              {topic?.description || 'Curriculum learning content and activities.'}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 border border-gray-100 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <ProgressCircle
              percentage={progress.pct}
              size={46}
              strokeWidth={4.5}
            />
            <div>
              <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Topic Progress</div>
              <div className="text-xs sm:text-sm font-black text-gray-900">
                {progress.isCompleted
                  ? '100% Completed'
                  : progress.pct > 0
                  ? `${progress.pct}% Completed`
                  : 'Not Started'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Content Section */}
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl font-extrabold text-gray-900 truncate">Curriculum Modules & Lessons ({lessons.length})</h2>
          <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Sequenced Order</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-2xl sm:rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : lessons.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 w-full">
            {lessons.map((lessonItem, index) => {
              const lessonProg = studentCurriculumService.getLessonProgress(lessonItem.id, user?.id);

              return (
                <div
                  key={lessonItem.id}
                  className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 group"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-5 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="p-3 sm:p-4 bg-blue-50 text-custom-blue rounded-xl sm:rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors shrink-0 mt-0.5 sm:mt-0">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] sm:text-xs font-extrabold text-custom-blue bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                          Lesson {index + 1} of {lessons.length}
                        </span>
                        {lessonProg.isCompleted && (
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 leading-snug">
                        {lessonItem.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-2">
                        {lessonItem.immutable_metadata?.description || `Module ${index + 1} for ${topic?.name || 'Chemistry'}`}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] sm:text-xs font-semibold text-gray-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~15 mins read
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <ProgressCircle
                      percentage={lessonProg.pct}
                      size={40}
                      strokeWidth={4}
                    />

                    <button
                      onClick={() => handleLaunchLesson(lessonItem.id)}
                      className={`px-4 py-2.5 sm:px-5 sm:py-3 text-white font-extrabold rounded-xl sm:rounded-2xl shadow-xs sm:shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer whitespace-nowrap min-h-[44px] flex-1 sm:flex-initial ${
                        lessonProg.isCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : lessonProg.pct > 0
                          ? 'bg-custom-orange hover:bg-orange-600'
                          : 'bg-custom-blue hover:bg-blue-700'
                      }`}
                    >
                      {lessonProg.isCompleted ? (
                        <>
                          <RotateCcw className="w-4 h-4" /> Review
                        </>
                      ) : lessonProg.pct > 0 ? (
                        <>
                          <Play className="w-4 h-4 fill-current" /> Resume →
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" /> Start Lesson →
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-gray-500 border border-gray-100">
            No published lessons available for this topic yet.
          </div>
        )}
      </div>

      {/* Topic-Specific Interactive Simulations Section (Only rendered if relevant to this topic) */}
      {simulations.length > 0 && (
        <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Interactive Simulations ({simulations.length})</h2>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Virtual Labs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {simulations.map((sim) => (
              <div
                key={sim.id || sim.key}
                className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full uppercase">
                      Virtual Lab
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-400">
                      {sim.subject}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{sim.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-3">{sim.description || 'Interactive simulation for this topic.'}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedSimulation(sim)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                  >
                    <Play className="w-4 h-4 fill-current" /> Open Simulation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic-Specific Recorded Lab Practicals Section (Only rendered if relevant to this topic) */}
      {experiments.length > 0 && (
        <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-custom-blue rounded-xl">
                <Video className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Recorded Practicals ({experiments.length})</h2>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-custom-blue bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Lab Demos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs sm:shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 sm:h-40 bg-gray-900 overflow-hidden cursor-pointer" onClick={() => setSelectedExperiment(exp)}>
                    {exp.image ? (
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Video className="w-10 h-10" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExperiment(exp);
                      }}
                      className="absolute inset-0 m-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-custom-blue text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </button>
                  </div>
                  <div className="p-4 sm:p-5">
                    <span className="text-[10px] sm:text-xs font-bold text-custom-blue bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                      {exp.category || 'Practical'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-1.5 line-clamp-2">{exp.title}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{exp.description || 'Recorded lab demonstration.'}</p>
                  </div>
                </div>
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    onClick={() => setSelectedExperiment(exp)}
                    className="w-full py-2.5 bg-custom-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch Practical
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Interactive Simulation */}
      {selectedSimulation && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full p-4 sm:p-6 md:p-8 shadow-2xl my-4 sm:my-8 relative">
            <button
              onClick={() => setSelectedSimulation(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors z-10 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <SimulationViewerContainer simulation={selectedSimulation} />
          </div>
        </div>
      )}

      {/* Modal for Experiment Video */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-gray-200 text-gray-900 rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl overflow-hidden relative my-auto">
            {/* Header Bar */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5 pr-6">
                <PlayCircle className="text-red-500 w-5 h-5 shrink-0" />
                <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate">{selectedExperiment.title}</h3>
              </div>
              <button
                onClick={() => setSelectedExperiment(null)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Responsive Grid: Video Priority */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Video Player */}
              <div className="lg:col-span-8 bg-black rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
                <div className="relative aspect-video w-full">
                  {selectedExperiment.cloudflare_video_id ? (
                    <iframe
                      src={`https://iframe.videodelivery.net/${selectedExperiment.cloudflare_video_id}`}
                      className="w-full h-full"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen
                    />
                  ) : selectedExperiment.playback_url ? (
                    <video
                      src={selectedExperiment.playback_url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                      Video source unavailable.
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Instructions & Explanations Panel */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-gray-50 border border-gray-100 rounded-2xl p-5 self-stretch">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 uppercase">
                    <BookOpen className="w-4 h-4 text-custom-blue" />
                    <span>Experiment Context</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                    {selectedExperiment.description || 'Watch the laboratory demonstration to observe the practical procedures, apparatus setup, and chemical reactions.'}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/coursedetails/${selectedExperiment.id}`)}
                  className="w-full py-2.5 px-4 bg-custom-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Full Practical Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicWorkspace;
