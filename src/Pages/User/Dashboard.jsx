import { useState, useEffect, useContext } from 'react';
import { Clock, BookOpen, ChevronRight, Building2, Play, Bell } from 'lucide-react';
import { Link, useNavigate } from "react-router";
import UserContext from '../../Context/UserContext';
import studentCurriculumService from '../../services/studentCurriculumService';

export function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [schoolContext, setSchoolContext] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [recentModules, setRecentModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const [school, fetchedSubjects] = await Promise.all([
        studentCurriculumService.getSchoolContext(),
        studentCurriculumService.getSubjects()
      ]);

      setSchoolContext(school);
      setSubjects(fetchedSubjects);

      const recent = studentCurriculumService.getRecentLearningModules();
      setRecentModules(recent);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const activeModule = recentModules.length > 0 ? recentModules[0] : null;

  return (
    <div>
      {/* Navigation Header */}
      <header className="flex items-center justify-between p-4 px-6 md:px-10 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-gray-900">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-6">
            {schoolContext && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-custom-blue rounded-full text-xs font-semibold">
                <Building2 className="w-4 h-4 shrink-0 text-custom-blue" />
                <span className="truncate max-w-[250px]">
                  {schoolContext.school_name}
                  {schoolContext.class_name ? ` - ${schoolContext.class_name}` : ''}
                </span>
              </div>
            )}

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>

            {user && (
              <Link to="/student/profile">
                <span className="font-semibold text-sm text-gray-800 hover:text-custom-blue">
                  {user.username}
                </span>
              </Link>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
          
          {/* SECTION 1: CONTINUE LEARNING (Highest Priority) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-custom-blue" />
                Continue Learning
              </h2>
            </div>

            {activeModule ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <h3 className="text-2xl font-black text-gray-900 line-clamp-2 leading-tight">
                      {activeModule.lessonTitle}
                    </h3>
                    <p className="text-sm font-semibold text-gray-500">
                      {activeModule.topicName || activeModule.subjectName || 'Current Learning Topic'}
                    </p>

                    <div className="pt-3">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600 max-w-md">
                        <span>Progress</span>
                        <span className="text-custom-blue font-extrabold">
                          {activeModule.totalPages > 0 
                            ? Math.round(((activeModule.completedConcepts?.length || 0) / activeModule.totalPages) * 100)
                            : 0}% Complete
                        </span>
                      </div>
                      <div className="w-full max-w-md bg-gray-100 rounded-full h-2 mt-1.5">
                        <div
                          className="bg-custom-blue h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${activeModule.totalPages > 0 
                              ? Math.round(((activeModule.completedConcepts?.length || 0) / activeModule.totalPages) * 100)
                              : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => navigate(`/lesson-viewer/${activeModule.topicId}`)}
                      className="px-6 py-3.5 bg-custom-blue hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" /> Continue →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
                <p className="text-gray-500 text-sm font-medium">Select a subject below to start learning.</p>
              </div>
            )}
          </section>

          {/* SECTION 2: SUBJECTS */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-custom-blue" />
                Subjects
              </h2>
              <Link to="/student/subjects" className="text-xs font-bold text-custom-blue hover:underline">
                View All →
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subjects.slice(0, 4).map((subject) => {
                  const gradeLabel = subject.grade_name || '';
                  return (
                    <div
                      key={subject.id}
                      onClick={() => navigate(`/student/subject/${subject.id}`)}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                          {subject.name}
                        </h3>
                        {gradeLabel && (
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">
                            {gradeLabel}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                          <span>Progress</span>
                          <span className="text-custom-blue font-extrabold">0%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                          <div className="bg-custom-blue h-1.5 rounded-full w-1/12"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-100">
                No enrolled subjects found.
              </div>
            )}
          </section>

          {/* SECTION 3: RECENT LEARNING */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Learning</h2>
            </div>

            {recentModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentModules.slice(0, 3).map((module) => (
                  <div
                    key={module.lessonId}
                    onClick={() => navigate(`/lesson-viewer/${module.topicId}`)}
                    className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                        {module.lessonTitle}
                      </h3>
                      <p className="text-xs font-semibold text-gray-400 mt-1">
                        {module.topicName || 'Curriculum Lesson'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-custom-blue flex items-center gap-1">
                        Continue →
                      </span>
                      <ChevronRight className="w-4 h-4 text-custom-blue" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-100 text-sm">
                No recent learning activity.
              </div>
            )}
          </section>

        </div>
    </div>
  );
}

export default Dashboard;