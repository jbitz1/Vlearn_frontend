import { useState, useEffect, useContext } from 'react';
import { BookOpen, ChevronRight, Clock, Play, Building2, Bell, Plus } from 'lucide-react';
import { useNavigate } from "react-router";
import UserContext from '../../Context/UserContext';
import teacherCurriculumService from '../../services/teacherCurriculumService';
import AddSubjectModal from '../../Components/Teacher/AddSubjectModal';

export function TeacherDashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [recentlyTaught, setRecentlyTaught] = useState([]);
  const [schoolContext, setSchoolContext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add Subject Modal state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const [fetchedSubjects, streams, recent] = await Promise.all([
      teacherCurriculumService.getTeacherSubjects(),
      teacherCurriculumService.getMyStreams(),
      teacherCurriculumService.getRecentlyTaught()
    ]);

    setSubjects(fetchedSubjects);
    setRecentlyTaught(recent);

    if (streams && streams.length > 0) {
      setSchoolContext({
        school_name: streams[0].school_name || 'School Workspace'
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSubjectAdded = () => {
    loadDashboardData();
  };

  const teacherDisplayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'Teacher';

  return (
    <div className="space-y-8 min-h-screen">
      {/* Dashboard Header */}
      <header className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
            <p className="text-gray-600 font-bold text-base mt-1">{teacherDisplayName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {schoolContext && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-custom-blue rounded-full text-xs font-semibold">
                <Building2 className="w-4 h-4 shrink-0 text-custom-blue" />
                <span className="truncate max-w-[250px]">{schoolContext.school_name}</span>
              </div>
            )}

            <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="space-y-10">

        {/* SECTION 1: MY SUBJECTS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-custom-blue" />
                My Subjects
              </h2>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                Curriculum subjects you prepare for and teach.
              </p>
            </div>
            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="px-4 py-2 bg-custom-blue hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => navigate(`/teacher/subject/${subject.id}`)}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                      {subject.name}
                    </h4>
                    <p className="text-xs font-semibold text-gray-400 mt-1">
                      {subject.grade_name || 'Standard Grade'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                    <span>{subject.topicCount || 0} Topics</span>
                    <span>{subject.publishedLessonCount || 0} Published Lessons</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center text-gray-500 border border-gray-100 text-sm flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-800">No subjects added yet.</span>
              <p className="text-xs text-gray-500 max-w-sm">
                Add subjects directly from the platform's Curriculum Builder pool to start preparing and teaching.
              </p>
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="mt-1 px-4 py-2 bg-custom-blue text-white hover:bg-blue-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject from Curriculum Builder
              </button>
            </div>
          )}
        </section>

        {/* SECTION 2: RECENTLY TAUGHT */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-custom-blue" />
              Recently Taught
            </h2>
          </div>

          {recentlyTaught.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyTaught.slice(0, 3).map((lesson) => (
                <div
                  key={lesson.lessonId}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug">
                      {lesson.lessonTitle}
                    </h3>
                    {lesson.topicName && (
                      <p className="text-xs font-semibold text-gray-500 mt-1">
                        Topic: {lesson.topicName}
                      </p>
                    )}

                    <div className="mt-3 space-y-0.5">
                      <p className="text-xs font-bold text-gray-800">
                        {lesson.subjectName}
                      </p>
                      {lesson.className && (
                        <p className="text-xs font-semibold text-custom-blue">
                          {lesson.className} {lesson.streamName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">
                      {lesson.timeAgo || 'Recently'}
                    </span>
                    <button
                      onClick={() => navigate(`/lesson-viewer/${lesson.topicId}`)}
                      className="px-4 py-2 bg-custom-blue hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Continue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-100 text-sm">
              No recently taught lessons.
            </div>
          )}
        </section>

      </div>

      {/* Add Subject Modal from Curriculum Builder */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSubjectAdded={handleSubjectAdded}
        existingSubjectIds={subjects.map(s => s.id)}
      />
    </div>
  );
}

export default TeacherDashboard;
