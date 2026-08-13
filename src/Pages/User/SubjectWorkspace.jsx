import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ChevronLeft, BookOpen, Video, Cpu, Play, 
  HelpCircle, ArrowRight, ExternalLink 
} from 'lucide-react';
import ReactPlayer from 'react-player';
import SimulationViewerContainer from './Simulations/SimulationViewerContainer';
import studentCurriculumService from '../../services/studentCurriculumService';
import UserContext from '../../Context/UserContext';
import ProgressCircle from '../../Components/Common/ProgressCircle';

export const SubjectWorkspace = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState('topics');
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Inline Viewer states
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedSimulation, setSelectedSimulation] = useState(null);

  useEffect(() => {
    const loadSubjectData = async () => {
      setIsLoading(true);
      studentCurriculumService.recordSubjectAccess(subjectId, user?.id);
      const subjectData = await studentCurriculumService.getSubjectById(subjectId);
      setSubject(subjectData);

      const subjectName = subjectData?.name || '';

      const [fetchedTopics, fetchedExperiments, fetchedSims, fetchedQuizzes] = await Promise.all([
        studentCurriculumService.getTopicsForSubject(subjectId),
        studentCurriculumService.getExperiments(subjectName),
        studentCurriculumService.getSimulations(subjectName),
        studentCurriculumService.getQuizAttempts()
      ]);

      setTopics(fetchedTopics);
      setExperiments(fetchedExperiments);
      setSimulations(fetchedSims);
      setQuizAttempts(fetchedQuizzes);
      setIsLoading(false);
    };

    loadSubjectData();
  }, [subjectId, user?.id]);

  const handleOpenTopic = (topicId) => {
    navigate(`/student/topic/${topicId}`);
  };

  const handleWatchExperiment = (exp) => {
    if (exp.id && String(exp.id).length < 6) {
      navigate(`/coursedetails/${exp.id}`);
    } else {
      setSelectedExperiment(exp);
    }
  };

  const handleOpenSimulation = (sim) => {
    setSelectedSimulation(sim);
  };

  // Group simulations by Curriculum Topic
  const simulationsByTopic = simulations.reduce((acc, sim) => {
    const topicName = sim.topic || 'General STEM Simulations';
    if (!acc[topicName]) {
      acc[topicName] = [];
    }
    acc[topicName].push(sim);
    return acc;
  }, {});

  const subjectProgress = studentCurriculumService.getSubjectProgress(subjectId, topics, user?.id);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Back button */}
      <button
        onClick={() => {
          if (selectedSimulation) {
            setSelectedSimulation(null);
          } else {
            navigate('/student/subjects');
          }
        }}
        className="flex items-center text-sm font-bold text-custom-blue hover:underline cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {selectedSimulation
          ? `Back to ${subject?.name || 'Subject'} Simulations`
          : 'Back to Subjects'}
      </button>

      {/* If a simulation is selected, render self-contained SimulationViewerContainer */}
      {selectedSimulation ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <SimulationViewerContainer simulation={selectedSimulation} />
        </div>
      ) : (
        <>
          {/* Subject Header */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-[240px]">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                  {subject?.name || 'Subject'}
                </h1>
                <p className="text-gray-500 font-medium text-sm mt-1">
                  {subject?.description || 'Explore topics, recorded practical experiments, simulations, and practice.'}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl shrink-0">
                <ProgressCircle
                  percentage={subjectProgress.pct}
                  size={52}
                  strokeWidth={5}
                />
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject Progress</div>
                  <div className="text-sm font-black text-gray-900">
                    {subjectProgress.isCompleted
                      ? '100% Completed'
                      : subjectProgress.pct > 0
                      ? `${subjectProgress.pct}% Completed`
                      : 'Not Started'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mt-8 gap-6 overflow-x-auto">
              {[
                { id: 'topics', label: 'Topics', icon: BookOpen, count: topics.length, show: true },
                { id: 'experiments', label: 'Experiments', icon: Video, count: experiments.length, show: experiments.length > 0 },
                { id: 'simulations', label: 'Simulations', icon: Cpu, count: simulations.length, show: simulations.length > 0 },
                { id: 'practice', label: 'Practice', icon: HelpCircle, count: quizAttempts.length, show: true },
              ].filter(tab => tab.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 text-sm font-extrabold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-custom-blue text-custom-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 text-custom-blue' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div>
              {/* TAB 1: TOPICS */}
              {activeTab === 'topics' && (
                <div className="space-y-4">
                  {topics.length > 0 ? (
                    topics.map((topic) => {
                      const progress = studentCurriculumService.getTopicProgress(topic.id, user?.id, topic.lesson_count || 0);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => handleOpenTopic(topic.id)}
                          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-6 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="p-3.5 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors shrink-0">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                                {topic.name}
                              </h3>
                              <p className="text-gray-500 text-sm mt-0.5">{topic.description || 'Curriculum Topic'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-5 shrink-0">
                            <div className="text-right hidden sm:block">
                              <div className="text-xs font-extrabold text-gray-500">Progress</div>
                              <div className="text-xs font-semibold text-gray-400">
                                {progress.isCompleted ? 'Completed' : progress.pct > 0 ? 'In Progress' : 'Not Started'}
                              </div>
                            </div>
                            <ProgressCircle
                              percentage={progress.pct}
                              size={46}
                              strokeWidth={4}
                            />
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
                      No topics available for this subject yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: EXPERIMENTS (Recorded Videos) */}
              {activeTab === 'experiments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {experiments.length > 0 ? (
                    experiments.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 bg-gray-900 overflow-hidden cursor-pointer" onClick={() => handleWatchExperiment(exp)}>
                            {exp.image ? (
                              <img src={exp.image} alt={exp.title} className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <Video className="w-12 h-12" />
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWatchExperiment(exp);
                              }}
                              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-custom-blue text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </button>
                          </div>
                          <div className="p-6">
                            <span className="text-xs font-bold text-custom-blue bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                              Recorded Practical
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2">{exp.title}</h3>
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{exp.description || 'Recorded lab demonstration.'}</p>
                          </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-2">
                          <button
                            onClick={() => handleWatchExperiment(exp)}
                            className="w-full py-2.5 bg-custom-blue hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" /> Open Practical
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
                      No recorded experiments available for this subject.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SIMULATIONS (Grouped by Topic) */}
              {activeTab === 'simulations' && (
                <div className="space-y-8">
                  {Object.keys(simulationsByTopic).length > 0 ? (
                    Object.entries(simulationsByTopic).map(([topicName, topicSims]) => (
                      <div key={topicName} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                          <h3 className="text-xl font-bold text-gray-900">{topicName}</h3>
                          <span className="text-xs bg-purple-50 text-purple-700 font-extrabold px-2.5 py-0.5 rounded-full">
                            {topicSims.length} {topicSims.length === 1 ? 'Simulation' : 'Simulations'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {topicSims.map((sim) => (
                            <div
                              key={sim.id || sim.key}
                              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                    <Cpu className="w-6 h-6" />
                                  </div>
                                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full uppercase">
                                    Interactive Simulation
                                  </span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">{sim.title}</h4>
                                <p className="text-gray-500 text-sm mt-1 line-clamp-3">{sim.description || 'Interactive virtual lab.'}</p>
                              </div>
                              <div className="mt-6 pt-4 border-t border-gray-100">
                                <button
                                  onClick={() => handleOpenSimulation(sim)}
                                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Play className="w-4 h-4 fill-current" /> Open Simulation
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
                      No interactive simulations available for this subject yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRACTICE (Quizzes & Revisions) */}
              {activeTab === 'practice' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Practice Activities</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Complete topic quizzes and practice activities to reinforce your understanding.
                    </p>
                    {quizAttempts.length > 0 ? (
                      <div className="space-y-3">
                        {quizAttempts.slice(0, 5).map((attempt) => (
                          <div key={attempt.id} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <div className="font-bold text-gray-900">{attempt.quiz?.title || 'Topic Assessment'}</div>
                              <div className="text-xs text-gray-500">Completed assessment score</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                attempt.score >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                Score: {attempt.score}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No practice attempts recorded for this subject.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal for Experiment Video */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedExperiment.title}</h3>
              <button
                onClick={() => setSelectedExperiment(null)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-4 relative">
              <ReactPlayer
                url={selectedExperiment.playback_url || selectedExperiment.video_url || selectedExperiment.videoLink}
                controls
                width="100%"
                height="100%"
                playing
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-gray-600 text-sm max-w-xl">{selectedExperiment.description}</p>
              <button
                onClick={() => navigate(`/coursedetails/${selectedExperiment.id}`)}
                className="px-4 py-2 bg-custom-blue text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Full Practical Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectWorkspace;
