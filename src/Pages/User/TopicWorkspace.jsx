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
    navigate(`/lesson-viewer/${topicId}?lessonId=${lessonId}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Back link */}
      <button
        onClick={() => {
          if (topic?.subject) {
            navigate(`/student/subject/${topic.subject}`);
          } else {
            navigate('/student/subjects');
          }
        }}
        className="flex items-center text-sm font-bold text-custom-blue hover:underline cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Subject
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex-1 min-w-[240px]">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              {topic?.name || 'Topic'}
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              {topic?.description || 'Curriculum learning content and activities.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl shrink-0">
            <ProgressCircle
              percentage={progress.pct}
              size={52}
              strokeWidth={5}
            />
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Topic Progress</div>
              <div className="text-sm font-black text-gray-900">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Curriculum Modules & Lessons ({lessons.length})</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sequenced Curriculum Order</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : lessons.length > 0 ? (
          <div className="space-y-4 w-full">
            {lessons.map((lessonItem, index) => {
              const lessonProg = studentCurriculumService.getLessonProgress(lessonItem.id, user?.id);

              return (
                <div
                  key={lessonItem.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-6 group"
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="p-4 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-xs font-extrabold text-custom-blue bg-blue-50 px-2.5 py-0.5 rounded-md shrink-0">
                          Lesson {index + 1} of {lessons.length}
                        </span>
                        {lessonProg.isCompleted && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 leading-snug">
                        {lessonItem.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {lessonItem.immutable_metadata?.description || `Module ${index + 1} for ${topic?.name || 'Chemistry'}`}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~15 mins read
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <ProgressCircle
                      percentage={lessonProg.pct}
                      size={44}
                      strokeWidth={4}
                    />

                    <button
                      onClick={() => handleLaunchLesson(lessonItem.id)}
                      className={`px-5 py-3 text-white font-extrabold rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap ${
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
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
            No published lessons available for this topic yet.
          </div>
        )}
      </div>

      {/* Topic-Specific Interactive Simulations Section (Only rendered if relevant to this topic) */}
      {simulations.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">Interactive Simulations ({simulations.length})</h2>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Topic Virtual Labs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((sim) => (
              <div
                key={sim.id || sim.key}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full uppercase">
                      Virtual Lab
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      {sim.subject}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">{sim.title}</h3>
                  <p className="text-gray-500 text-sm mt-1.5 line-clamp-3">{sim.description || 'Interactive simulation for this topic.'}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedSimulation(sim)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-custom-blue rounded-xl">
                <Video className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">Recorded Practicals ({experiments.length})</h2>
            </div>
            <span className="text-xs font-bold text-custom-blue bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Lab Demonstrations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 bg-gray-900 overflow-hidden cursor-pointer" onClick={() => setSelectedExperiment(exp)}>
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
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-custom-blue text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </button>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-custom-blue bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                      {exp.category || 'Practical'}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-2 line-clamp-2">{exp.title}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{exp.description || 'Recorded lab demonstration.'}</p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => setSelectedExperiment(exp)}
                    className="w-full py-2 bg-custom-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 md:p-8 shadow-2xl my-8 relative">
            <button
              onClick={() => setSelectedSimulation(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <SimulationViewerContainer simulation={selectedSimulation} />
          </div>
        </div>
      )}

      {/* Modal for Experiment Video */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 pr-8">{selectedExperiment.title}</h3>
              <button
                onClick={() => setSelectedExperiment(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              {selectedExperiment.video_url || selectedExperiment.file ? (
                <video
                  src={selectedExperiment.video_url || selectedExperiment.file}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm">
                  Video source unavailable.
                </div>
              )}
            </div>
            {selectedExperiment.description && (
              <p className="text-gray-600 text-sm mt-4">{selectedExperiment.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicWorkspace;
