import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, BookOpen, Clock, Play, RefreshCw } from 'lucide-react';
import studentCurriculumService from '../../services/studentCurriculumService';

export const TopicWorkspace = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({ isCompleted: false, pct: 0 });

  useEffect(() => {
    const loadTopicData = async () => {
      setIsLoading(true);
      const fetchedTopic = await studentCurriculumService.getTopicById(topicId);
      setTopic(fetchedTopic);

      const lessonData = await studentCurriculumService.getActiveLesson(topicId);
      setActiveLesson(lessonData);

      const localProgress = studentCurriculumService.getTopicProgress(topicId);
      setProgress(localProgress);

      setIsLoading(false);
    };

    loadTopicData();
  }, [topicId]);

  const handleLaunchModule = () => {
    navigate(`/lesson-viewer/${topicId}`);
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
        className="flex items-center text-sm font-bold text-custom-blue hover:underline"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Subject
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          {topic?.name || 'Topic'}
        </h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          {topic?.description || 'Curriculum learning content and activities.'}
        </p>

        {/* Progress summary bar */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase">Topic Progress</span>
            <span className="text-sm font-black text-custom-blue">{progress.pct}% Complete</span>
          </div>
          <div className="w-48 bg-gray-100 rounded-full h-2">
            <div
              className="bg-custom-blue h-2 rounded-full transition-all"
              style={{ width: `${progress.pct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Learning Content Section */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-6">Learning Content</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {/* Primary Learning Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-custom-blue rounded-2xl">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {activeLesson?.title || topic?.name || 'Interactive Learning Experience'}
                    </h3>
                    {progress.isCompleted ? (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                        Completed
                      </span>
                    ) : progress.pct > 0 ? (
                      <span className="bg-blue-100 text-custom-blue text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                        In Progress
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                        Not Started
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {activeLesson?.description || 'Interactive AI-generated learning experience.'}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> 15 mins
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={handleLaunchModule}
                  className="px-6 py-3 bg-custom-blue hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm transition-colors flex items-center gap-2"
                >
                  {progress.isCompleted ? (
                    <>
                      <RefreshCw className="w-4 h-4" /> Review →
                    </>
                  ) : progress.pct > 0 ? (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Continue →
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Start →
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicWorkspace;
