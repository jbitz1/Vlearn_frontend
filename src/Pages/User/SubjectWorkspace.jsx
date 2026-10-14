import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ChevronLeft, BookOpen, Video, Cpu, Play, 
  HelpCircle, ArrowRight, ExternalLink, CheckSquare, Sparkles 
} from 'lucide-react';
import ReactPlayer from 'react-player';
import FullscreenSimulationModal from '../../Components/Simulations/FullscreenSimulationModal';
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
  const [revisionQuizzes, setRevisionQuizzes] = useState([]);
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

      const [fetchedTopics, fetchedExperiments, fetchedSims, fetchedQuizzes, fetchedRevisionQuizzes] = await Promise.all([
        studentCurriculumService.getTopicsForSubject(subjectId),
        studentCurriculumService.getExperiments(subjectName),
        studentCurriculumService.getSimulations(subjectName),
        studentCurriculumService.getQuizAttempts(),
        studentCurriculumService.getRevisionQuizzes({ subjectId })
      ]);

      setTopics(fetchedTopics);
      setExperiments(fetchedExperiments);
      setSimulations(fetchedSims);
      setQuizAttempts(fetchedQuizzes);
      setRevisionQuizzes(fetchedRevisionQuizzes);
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

  // Filter and group simulations strictly matching this subject's actual curriculum topics
  const { simulationsByTopic, matchedSimulationsCount } = useMemo(() => {
    if (!topics || topics.length === 0 || !simulations || simulations.length === 0) {
      return { simulationsByTopic: {}, matchedSimulationsCount: 0 };
    }

    const grouped = {};
    let totalMatched = 0;
    const assignedSimKeys = new Set();

    topics.forEach((topic) => {
      const tRaw = (topic.name || '').replace(/^Topic\s*\d+\s*:\s*/i, '').trim().toLowerCase();

      const matching = simulations.filter((sim) => {
        if (assignedSimKeys.has(sim.key || sim.id)) return false;
        const simTopic = (sim.topic || '').toLowerCase();
        const simTitle = (sim.title || '').toLowerCase();

        // Exact topic title match
        if (simTopic.includes(tRaw) || tRaw.includes(simTopic)) return true;

        // Specific Chemistry Form 4 vs Form 3 keywords
        if (tRaw.includes('acid') || tRaw.includes('salt')) {
          return simTopic.includes('acid') || simTopic.includes('salt') || simTitle.includes('acid') || simTitle.includes('solubility');
        }
        if (tRaw.includes('gas law')) {
          return simTopic.includes('gas') || simTitle.includes('gas') || simTitle.includes('charles') || simTitle.includes('boyle') || simTitle.includes('graham');
        }
        if (tRaw.includes('mole') || tRaw.includes('formula') || tRaw.includes('titrat')) {
          return simTopic.includes('mole') || simTopic.includes('titrat') || simTitle.includes('titrat');
        }
        if (tRaw.includes('energy') || tRaw.includes('heat')) {
          return simTopic.includes('energy') || simTitle.includes('hess') || simTitle.includes('heat');
        }
        if (tRaw.includes('rate') || tRaw.includes('reversible')) {
          return simTopic.includes('rate') || simTitle.includes('collision') || simTitle.includes('haber') || simTitle.includes('equilibrium');
        }
        if (tRaw.includes('electro')) {
          return simTopic.includes('electro') || simTitle.includes('potential') || simTitle.includes('discharge') || simTitle.includes('plating') || simTitle.includes('voltaic') || simTitle.includes('electrolysis');
        }
        if (tRaw.includes('metal')) {
          return simTopic.includes('metal') || simTitle.includes('reactivity');
        }
        if (tRaw.includes('organic chemistry ii') || tRaw.includes('alkanol')) {
          return simTopic.includes('organic chemistry ii') || simTitle.includes('micelle') || simTitle.includes('functional group');
        }
        if (tRaw.includes('organic chemistry i') || tRaw.includes('hydrocarbon')) {
          return simTopic.includes('organic chemistry i');
        }
        if (tRaw.includes('radioactivity')) {
          return simTopic.includes('radioactivity') || simTitle.includes('decay') || simTitle.includes('fission');
        }

        // Biology Form 4 keywords
        if (tRaw.includes('genetic') || tRaw.includes('dna') || tRaw.includes('punnett') || tRaw.includes('blood') || tRaw.includes('karyotype') || tRaw.includes('meiosis') || tRaw.includes('heredity')) {
          return simTopic.includes('genetic') || simTitle.includes('dna') || simTitle.includes('genetics') || simTitle.includes('karyotype') || simTitle.includes('pedigree') || simTitle.includes('meiosis') || simTitle.includes('sex-linked');
        }
        if (tRaw.includes('evolution') || tRaw.includes('natural selection') || tRaw.includes('limb') || tRaw.includes('moth') || tRaw.includes('speciation') || tRaw.includes('isolation')) {
          return simTopic.includes('evolution') || simTitle.includes('evolution') || simTitle.includes('moth') || simTitle.includes('limb') || simTitle.includes('speciation');
        }
        if (tRaw.includes('reception') || tRaw.includes('response') || tRaw.includes('coordination') || tRaw.includes('eye') || tRaw.includes('ear') || tRaw.includes('reflex') || tRaw.includes('tropism') || tRaw.includes('nerve') || tRaw.includes('synapse')) {
          return simTopic.includes('reception') || simTitle.includes('eye') || simTitle.includes('ear') || simTitle.includes('reflex') || simTitle.includes('tropism') || simTitle.includes('nerve') || simTitle.includes('synapse');
        }
        if (tRaw.includes('support') || tRaw.includes('movement') || tRaw.includes('vertebra') || tRaw.includes('muscle') || tRaw.includes('joint') || tRaw.includes('turgor') || tRaw.includes('sliding') || tRaw.includes('filament')) {
          return simTopic.includes('support') || simTitle.includes('vertebra') || simTitle.includes('muscle') || simTitle.includes('joint') || simTitle.includes('turgor') || simTitle.includes('sliding');
        }

        // Physics Form 4 keywords
        if (tRaw.includes('lens') || tRaw.includes('optics') || tRaw.includes('refraction')) {
          return simTopic.includes('lens') || simTopic.includes('optic') || simTitle.includes('lens') || simTitle.includes('microscope') || simTitle.includes('telescope');
        }
        if (tRaw.includes('circular motion')) {
          return simTopic.includes('circular') || simTitle.includes('circular') || simTitle.includes('centripetal') || simTitle.includes('loop');
        }
        if (tRaw.includes('float') || tRaw.includes('sink') || tRaw.includes('archimedes')) {
          return simTopic.includes('float') || simTopic.includes('sink') || simTitle.includes('archimedes') || simTitle.includes('hydrometer');
        }
        if (tRaw.includes('electromagnetic spectrum') || tRaw.includes('em spectrum')) {
          return simTopic.includes('spectrum') || simTitle.includes('spectrum') || simTitle.includes('radiation');
        }
        if (tRaw.includes('electromagnetic induction') || tRaw.includes('induction')) {
          return simTopic.includes('induction') || simTitle.includes('faraday') || simTitle.includes('lenz') || simTitle.includes('generator') || simTitle.includes('transformer');
        }
        if (tRaw.includes('mains') || tRaw.includes('power distribution')) {
          return simTopic.includes('mains') || simTitle.includes('grid') || simTitle.includes('wiring') || simTitle.includes('costing');
        }
        if (tRaw.includes('cathode') || tRaw.includes('crt')) {
          return simTopic.includes('cathode') || simTitle.includes('crt') || simTitle.includes('cro') || simTitle.includes('thomson');
        }
        if (tRaw.includes('x-ray') || tRaw.includes('xray')) {
          return simTopic.includes('x-ray') || simTopic.includes('xray') || simTitle.includes('x-ray') || simTitle.includes('bragg') || simTitle.includes('transition');
        }
        if (tRaw.includes('photoelectric')) {
          return simTopic.includes('photoelectric') || simTitle.includes('photoelectric') || simTitle.includes('planck') || simTitle.includes('electroscope');
        }
        if (tRaw.includes('electronic') || tRaw.includes('semiconductor')) {
          return simTopic.includes('electronic') || simTitle.includes('junction') || simTitle.includes('logic gate') || simTitle.includes('transistor');
        }

        return false;
      });

      if (matching.length > 0) {
        matching.forEach((s) => assignedSimKeys.add(s.key || s.id));
        grouped[topic.name] = matching;
        totalMatched += matching.length;
      }
    });

    return { simulationsByTopic: grouped, matchedSimulationsCount: totalMatched };
  }, [topics, simulations]);

  const subjectProgress = studentCurriculumService.getSubjectProgress(subjectId, topics, user?.id);

  return (
    <div className="pl-14 pr-4 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8 min-h-screen">
      {/* Back button */}
      <button
        onClick={() => {
          if (selectedSimulation) {
            setSelectedSimulation(null);
          } else {
            navigate('/student/subjects');
          }
        }}
        className="flex items-center text-xs sm:text-sm font-bold text-custom-blue hover:underline cursor-pointer min-h-[40px]"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Subjects
      </button>

      {/* Subject Header */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs sm:shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4 sm:gap-6">
              <div className="flex-1 min-w-[200px]">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
                  {subject?.name || 'Subject'}
                </h1>
                <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1">
                  {subject?.description || 'Explore topics, recorded practical experiments, simulations, and practice.'}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 border border-gray-100 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                <ProgressCircle
                  percentage={subjectProgress.pct}
                  size={46}
                  strokeWidth={4.5}
                />
                <div>
                  <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Subject Progress</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900">
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
            <div className="flex border-b border-gray-200 mt-6 sm:mt-8 gap-2 sm:gap-6 overflow-x-auto scrollbar-none pb-0.5">
              {[
                { id: 'topics', label: 'Topics', icon: BookOpen, count: topics.length, show: true },
                { id: 'experiments', label: 'Experiments', icon: Video, count: experiments.length, show: experiments.length > 0 },
                { id: 'simulations', label: 'Simulations', icon: Cpu, count: matchedSimulationsCount, show: matchedSimulationsCount > 0 || ['biology', 'physics', 'chemistry', 'mathematics'].some(s => (subject?.name || '').toLowerCase().includes(s)) },
                { id: 'practice', label: 'Revision Quizzes', icon: CheckSquare, count: revisionQuizzes.length, show: true },
              ].filter(tab => tab.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all whitespace-nowrap min-h-[44px] cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-custom-blue text-custom-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
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
                <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-2xl sm:rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div>
              {/* TAB 1: TOPICS */}
              {activeTab === 'topics' && (
                <div className="space-y-3 sm:space-y-4">
                  {topics.length > 0 ? (
                    topics.map((topic) => {
                      const progress = studentCurriculumService.getTopicProgress(topic.id, user?.id, topic.lesson_count || 0);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => handleOpenTopic(topic.id)}
                          className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 group"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                            <div className="p-3 bg-blue-50 text-custom-blue rounded-xl sm:rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors shrink-0">
                              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors truncate">
                                {topic.name}
                              </h3>
                              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-1">{topic.description || 'Curriculum Topic'}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                            <div className="text-left sm:text-right">
                              <div className="text-[10px] sm:text-xs font-extrabold text-gray-500 uppercase tracking-wider">Progress</div>
                              <div className="text-xs font-semibold text-gray-400">
                                {progress.isCompleted ? 'Completed' : progress.pct > 0 ? `${progress.pct}%` : 'Not Started'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ProgressCircle
                                percentage={progress.pct}
                                size={40}
                                strokeWidth={4}
                              />
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-gray-500 border border-gray-100">
                      No topics available for this subject yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: EXPERIMENTS (Recorded Videos) */}
              {activeTab === 'experiments' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {experiments.length > 0 ? (
                    experiments.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs sm:shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-40 sm:h-44 bg-gray-900 overflow-hidden cursor-pointer" onClick={() => handleWatchExperiment(exp)}>
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
                                handleWatchExperiment(exp);
                              }}
                              className="absolute inset-0 m-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-custom-blue text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </button>
                          </div>
                          <div className="p-4 sm:p-6">
                            <span className="text-[10px] sm:text-xs font-bold text-custom-blue bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                              Recorded Practical
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-2 line-clamp-2">{exp.title}</h3>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">{exp.description || 'Recorded lab demonstration.'}</p>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6 pt-0 flex gap-2">
                          <button
                            onClick={() => handleWatchExperiment(exp)}
                            className="w-full py-2.5 bg-custom-blue hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                          >
                            <Play className="w-4 h-4 fill-current" /> Open Practical
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-gray-500 border border-gray-100">
                      No recorded experiments available for this subject.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SIMULATIONS (Grouped by Topic) */}
              {activeTab === 'simulations' && (
                <div className="space-y-6 sm:space-y-8">
                  {Object.keys(simulationsByTopic).length > 0 ? (
                    Object.entries(simulationsByTopic).map(([topicName, topicSims]) => (
                      <div key={topicName} className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{topicName}</h3>
                          <span className="text-[10px] sm:text-xs bg-purple-50 text-purple-700 font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                            {topicSims.length} {topicSims.length === 1 ? 'Simulation' : 'Simulations'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {topicSims.map((sim) => (
                            <div
                              key={sim.id || sim.key}
                              className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                  <div className="p-2.5 sm:p-3 bg-purple-50 text-purple-600 rounded-xl sm:rounded-2xl">
                                    <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
                                  </div>
                                  <span className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full uppercase">
                                    Interactive Simulation
                                  </span>
                                </div>
                                <h4 className="text-base sm:text-lg font-bold text-gray-900">{sim.title}</h4>
                                <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-3">{sim.description || 'Interactive virtual lab.'}</p>
                              </div>
                              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                                <button
                                  onClick={() => handleOpenSimulation(sim)}
                                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
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
                    <div className="col-span-full bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-gray-500 border border-gray-100">
                      No interactive simulations available for this subject yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: REVISION QUIZZES & PRACTICE */}
              {activeTab === 'practice' && (
                <div className="space-y-6">
                  {/* Revision Quizzes Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Curriculum Revision Quizzes</h3>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                          Practice assessments tailored to each topic's core competencies and misconceptions.
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-custom-blue rounded-full">
                        {revisionQuizzes.length} Available
                      </span>
                    </div>

                    {revisionQuizzes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {revisionQuizzes.map((quiz) => {
                          const diff = (quiz.difficulty || 'intermediate').toLowerCase();
                          const diffClass = diff === 'beginner'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : diff === 'advanced'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-custom-blue border-blue-200';

                          return (
                            <div
                              key={quiz.id}
                              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${diffClass} capitalize`}>
                                    {diff}
                                  </span>
                                  <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                    {quiz.question_count || 5} Questions
                                  </span>
                                </div>
                                <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2">
                                  {quiz.title}
                                </h4>
                                <div className="text-xs text-gray-500 font-medium truncate flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                  <span className="truncate">{quiz.topic_name || 'Topic Assessment'}</span>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <button
                                  onClick={() => navigate(`/student/lesson-viewer/?lessonId=${quiz.id}&from=student`)}
                                  className="w-full py-2.5 bg-custom-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                                >
                                  <Play className="w-4 h-4 fill-current" /> Start Revision Quiz
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100 shadow-xs">
                        No revision quizzes published for this subject yet. Check back soon!
                      </div>
                    )}
                  </div>

                  {/* Past Assessment Attempts */}
                  {quizAttempts.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-sm">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4">Recent Quiz Performance</h3>
                      <div className="space-y-3">
                        {quizAttempts.slice(0, 5).map((attempt) => (
                          <div key={attempt.id} className="bg-gray-50 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between flex-wrap gap-2.5">
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-gray-900">{attempt.quiz?.title || 'Topic Assessment'}</div>
                              <div className="text-[11px] sm:text-xs text-gray-500">Completed assessment score</div>
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
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

      {/* Fullscreen Simulation Modal */}
      <FullscreenSimulationModal
        simulation={selectedSimulation}
        isOpen={Boolean(selectedSimulation)}
        onClose={() => setSelectedSimulation(null)}
      />

      {/* Modal for Experiment Video */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl overflow-hidden relative my-auto">
            {/* Header Bar */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 pr-6">
                <PlayCircle className="text-red-500 w-5 h-5 shrink-0" />
                <h3 className="text-base sm:text-xl font-bold text-white truncate">{selectedExperiment.title}</h3>
              </div>
              <button
                onClick={() => setSelectedExperiment(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Side-by-Side Responsive Grid: Video Priority (lg:col-span-7 vs lg:col-span-5) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Video Player */}
              <div className="lg:col-span-7 bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                <div className="relative aspect-video w-full">
                  {selectedExperiment.cloudflare_video_id ? (
                    <iframe
                      src={`https://iframe.videodelivery.net/${selectedExperiment.cloudflare_video_id}`}
                      className="w-full h-full"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen
                    />
                  ) : (
                    <ReactPlayer
                      url={selectedExperiment.playback_url || selectedExperiment.video_url || selectedExperiment.videoLink}
                      controls
                      width="100%"
                      height="100%"
                      playing
                    />
                  )}
                </div>
              </div>

              {/* Right: Instructions & Explanations Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                    <BookOpen className="w-4 h-4 text-custom-blue" />
                    <span>Experiment Overview</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {selectedExperiment.description || 'Observe the practical chemical demonstration and note key reactions and experimental results.'}
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-teal-300 font-semibold font-mono text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>Focus Note</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Observe the apparatus arrangement, reagents used, and physical observation endpoints as demonstrated.
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/coursedetails/${selectedExperiment.id}`)}
                  className="w-full py-2.5 px-4 bg-custom-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
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

export default SubjectWorkspace;
