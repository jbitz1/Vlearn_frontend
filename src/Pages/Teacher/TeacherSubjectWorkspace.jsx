import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ChevronLeft, BookOpen, Users, FolderDown, Video, Cpu, Play,
  ExternalLink, ArrowRight
} from 'lucide-react';
import ReactPlayer from 'react-player';
import SimulationViewerContainer from '../User/Simulations/SimulationViewerContainer';
import teacherCurriculumService from '../../services/teacherCurriculumService';

export const TeacherSubjectWorkspace = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [streams, setStreams] = useState([]);
  const [resources, setResources] = useState({});
  const [experiments, setExperiments] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [activeTab, setActiveTab] = useState('topics');
  const [resourceCategory, setResourceCategory] = useState('platform');
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Inline Viewer states
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedSimulation, setSelectedSimulation] = useState(null);

  useEffect(() => {
    const loadSubjectWorkspace = async () => {
      setIsLoading(true);
      const subjectData = await teacherCurriculumService.getSubjectById(subjectId);
      setSubject(subjectData);

      const subjectName = subjectData?.name || '';

      const [fetchedTopics, fetchedStreams, fetchedResources, fetchedExperiments, fetchedSims] = await Promise.all([
        teacherCurriculumService.getTopicsForSubject(subjectId),
        teacherCurriculumService.getStreamsForSubject(subjectId),
        teacherCurriculumService.getResources(subjectName),
        teacherCurriculumService.getExperiments(subjectName),
        teacherCurriculumService.getSimulations(subjectName)
      ]);

      setTopics(fetchedTopics);
      setStreams(fetchedStreams);
      setResources(fetchedResources);
      setExperiments(fetchedExperiments);
      setSimulations(fetchedSims);
      setIsLoading(false);
    };

    loadSubjectWorkspace();
  }, [subjectId]);

  const handleOpenTopic = (topicId) => {
    navigate(`/teacher/topic/${topicId}`);
  };

  const handleOpenClass = (streamId) => {
    navigate(`/teacher/class/${streamId}`);
  };

  const handleWatchExperiment = (exp) => {
    setSelectedExperiment(exp);
  };

  const handlePresentExperiment = (exp) => {
    const videoUrl = exp.playback_url || exp.video_url || exp.videoLink;
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    } else {
      setSelectedExperiment(exp);
    }
  };

  const handleOpenSimulation = (sim) => {
    setSelectedSimulation(sim);
  };

  const handlePresentSimulation = (sim) => {
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

  return (
    <div className="space-y-8 min-h-screen">
      {/* Back link */}
      <button
        onClick={() => {
          if (selectedSimulation) {
            setSelectedSimulation(null);
          } else {
            navigate('/teacher/subjects');
          }
        }}
        className="flex items-center text-sm font-bold text-custom-blue hover:underline cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {selectedSimulation
          ? `Back to ${subject?.name || 'Subject'} Workspace`
          : 'Back to My Subjects'}
      </button>

      {/* If simulation selected, render inline player */}
      {selectedSimulation ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <SimulationViewerContainer simulation={selectedSimulation} />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              {subject?.name || 'Subject'}
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Curriculum topics, assigned streams, resources, and interactive teaching tools.
            </p>

            {/* Tab Navigation (Order: Topics -> Classes -> Resources -> Experiments -> Simulations) */}
            <div className="flex border-b border-gray-200 mt-8 gap-6 overflow-x-auto">
              {[
                { id: 'topics', label: 'Topics', icon: BookOpen, count: topics.length },
                { id: 'classes', label: 'Classes', icon: Users, count: streams.length },
                { id: 'resources', label: 'Resources', icon: FolderDown, count: Object.values(resources).flat().length },
                { id: 'experiments', label: 'Experiments', icon: Video, count: experiments.length },
                { id: 'simulations', label: 'Simulations', icon: Cpu, count: simulations.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 text-sm font-extrabold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
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
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div>

              {/* TAB 1: TOPICS */}
              {activeTab === 'topics' && (
                <div className="space-y-4">
                  {topics.length > 0 ? (
                    topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => handleOpenTopic(topic.id)}
                        className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between flex-wrap gap-4 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3.5 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                              {topic.name}
                            </h3>
                            <p className="text-gray-500 text-sm">{topic.description || 'Curriculum Topic'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-custom-blue">Open</span>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
                      No topics available for this subject yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CLASSES (Streams assigned to teacher for this subject) */}
              {activeTab === 'classes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streams.length > 0 ? (
                    streams.map((stream) => (
                      <div
                        key={stream.stream_id || stream.id}
                        onClick={() => handleOpenClass(stream.stream_id || stream.id)}
                        className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3.5 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                              <Users className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-custom-blue bg-blue-50 px-2.5 py-1 rounded-full">
                              Stream
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                            {stream.school_class_name ? `${stream.school_class_name} ${stream.stream_name}` : stream.stream_name}
                          </h3>
                          <p className="text-xs font-semibold text-gray-400 mt-1">
                            {subject?.name || 'Subject Stream'}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-custom-blue">Open Class →</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
                      No streams assigned for this subject.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RESOURCES (Organized by Curriculum Topics & Category) */}
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  {/* Resources Sub-navigation */}
                  <div className="flex border-b border-gray-200 gap-4">
                    <button
                      onClick={() => setResourceCategory('platform')}
                      className={`pb-2.5 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                        resourceCategory === 'platform'
                          ? 'border-custom-blue text-custom-blue'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Platform Resources
                    </button>
                    <button
                      onClick={() => setResourceCategory('my_resources')}
                      className={`pb-2.5 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                        resourceCategory === 'my_resources'
                          ? 'border-custom-blue text-custom-blue'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      My Resources
                    </button>
                  </div>

                  {resourceCategory === 'platform' ? (
                    <div className="space-y-8">
                      {Object.keys(resources).length > 0 ? (
                        Object.entries(resources).map(([topicName, fileList]) => (
                          <div key={topicName} className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                              <FolderDown className="w-5 h-5 text-custom-blue" />
                              <h3 className="text-xl font-bold text-gray-900">{topicName}</h3>
                              <span className="text-xs bg-blue-50 text-custom-blue font-extrabold px-2.5 py-0.5 rounded-full">
                                {fileList.length} {fileList.length === 1 ? 'Resource' : 'Resources'}
                              </span>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-3xl divide-y divide-gray-100 shadow-sm overflow-hidden">
                              {fileList.map((file) => (
                                <div key={file.id} className="p-4 md:px-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-red-50 text-red-600 font-extrabold text-xs rounded-lg uppercase">
                                      {file.type || 'PDF'}
                                    </span>
                                    <div>
                                      <div className="font-bold text-gray-900 text-sm">{file.title}</div>
                                      <div className="text-xs text-gray-400">{file.size}</div>
                                    </div>
                                  </div>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-1.5 bg-gray-100 hover:bg-custom-blue hover:text-white text-gray-800 text-xs font-extrabold rounded-xl transition-colors shrink-0"
                                  >
                                    Download
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
                          No curriculum resources found for this subject.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-3">
                      <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center font-bold">
                        <FolderDown className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">My Resources</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Teacher-owned resources and custom files area. Upload capabilities will be enabled in a future release.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EXPERIMENTS */}
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
                            className="w-full py-2.5 bg-custom-blue hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-current" /> Open
                          </button>
                          <button
                            onClick={() => handlePresentExperiment(exp)}
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" /> Present
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

              {/* TAB 5: SIMULATIONS */}
              {activeTab === 'simulations' && (
                <div className="space-y-8">
                  {Object.keys(simulationsByTopic).length > 0 ? (
                    Object.entries(simulationsByTopic).map(([topicName, topicSims]) => (
                      <div key={topicName} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                          <Cpu className="w-5 h-5 text-purple-600" />
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
                              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                                <button
                                  onClick={() => handleOpenSimulation(sim)}
                                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Play className="w-4 h-4 fill-current" /> Open
                                </button>
                                <button
                                  onClick={() => handlePresentSimulation(sim)}
                                  className="px-4 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <ExternalLink className="w-4 h-4" /> Present
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
                className="text-gray-400 hover:text-gray-700 text-lg font-bold px-2 cursor-pointer"
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
            <p className="text-gray-600 text-sm">{selectedExperiment.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubjectWorkspace;
