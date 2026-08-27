import { useState, useEffect, useContext } from 'react';
import { Clock, BookOpen, ChevronRight, Building2, Play, Bell, Unlock } from 'lucide-react';
import { Link, useNavigate } from "react-router";
import UserContext from '../../Context/UserContext';
import studentCurriculumService from '../../services/studentCurriculumService';
import { useSubscriptionContext } from '../../component-library/billing-and-payments/subscriptions/SubscriptionContextProvider';
import ProgressCircle from '../../Components/Common/ProgressCircle';

export function Dashboard() {
  const { user } = useContext(UserContext);
  const subscriptionContext = useSubscriptionContext();
  const navigate = useNavigate();

  const [schoolContext, setSchoolContext] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectProgressMap, setSubjectProgressMap] = useState({});
  const [recentModules, setRecentModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const [school, fetchedSubjects] = await Promise.all([
        studentCurriculumService.getSchoolContext(),
        studentCurriculumService.getSubjects(null, true)
      ]);

      setSchoolContext(school);

      const recent = studentCurriculumService.getRecentLearningModules(user?.id);
      setRecentModules(recent);

      // Order subjects by last opened subject
      const orderedSubjects = studentCurriculumService.orderSubjectsByLastOpened(fetchedSubjects, user?.id);
      setSubjects(orderedSubjects);

      // Compute progress for enrolled subjects
      if (orderedSubjects && orderedSubjects.length > 0) {
        const progressMap = {};
        await Promise.all(
          orderedSubjects.slice(0, 8).map(async (subj) => {
            const topics = await studentCurriculumService.getTopicsForSubject(subj.id);
            const prog = studentCurriculumService.getSubjectProgress(subj.id, topics, user?.id);
            progressMap[subj.id] = prog;
          })
        );
        setSubjectProgressMap(progressMap);
      }

      setIsLoading(false);
    };

    if (user?.id) {
        loadDashboardData();
    }
  }, [user?.id]);

  const handleOpenSubject = (subjectId) => {
    studentCurriculumService.recordSubjectAccess(subjectId, user?.id);
    navigate(`/student/subject/${subjectId}`);
  };

  const dismissKey = `vlearn_onboarding_reminder_dismissed_${user?.id}`;
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(dismissKey) === 'true'
  );

  const entitlements = subscriptionContext?.entitlements;
  const activeSubscriptions = subscriptionContext?.activeSubscriptions || [];

  const hasAccess =
    entitlements?.platform_wide === true ||
    activeSubscriptions.length > 0;

  const showOnboardingBanner =
    !isLoading &&
    user?.role === 'student' &&
    user?.profile?.onboarding_complete === false &&
    !bannerDismissed;

  const showSubscriptionCard =
    !isLoading &&
    user?.role === 'student' &&
    user?.profile?.onboarding_complete === true &&
    !hasAccess;

  const handleDismissBanner = () => {
    localStorage.setItem(dismissKey, 'true');
    setBannerDismissed(true);
  };

  return (
    <div>
      {/* Navigation Header */}
      <header className="flex items-center justify-between py-3.5 pl-14 pr-4 sm:px-6 md:px-10 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            {schoolContext && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-custom-blue rounded-full text-xs font-semibold">
                <Building2 className="w-4 h-4 shrink-0 text-custom-blue" />
                <span className="truncate max-w-[200px] lg:max-w-[250px]">
                  {schoolContext.school_name}
                  {schoolContext.class_name ? ` - ${schoolContext.class_name}` : ''}
                </span>
              </div>
            )}

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer" aria-label="Notifications">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>

            {user && (
              <Link to="/student/profile" className="min-h-[40px] flex items-center">
                <span className="font-semibold text-xs sm:text-sm text-gray-800 hover:text-custom-blue truncate max-w-[120px] sm:max-w-none">
                  {user.username}
                </span>
              </Link>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-10 lg:space-y-12">
          
          {/* ONBOARDING REMINDER BANNER (State 1: Incomplete Onboarding) */}
          {showOnboardingBanner && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl sm:rounded-3xl border border-orange-200 bg-orange-50/80 p-4 sm:p-6 shadow-xs">
              <div className="flex items-center gap-3 sm:gap-4">
                <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-custom-orange shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-bold text-orange-950 text-sm sm:text-base">Your profile setup is incomplete</h3>
                  <p className="text-xs sm:text-sm text-orange-800 mt-0.5">
                    Complete your curriculum and subject selection to unlock your personalized learning experience.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-orange-200/60">
                <Link
                  to="/onboarding"
                  className="rounded-xl sm:rounded-2xl bg-custom-orange px-4 py-2.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-xs flex items-center justify-center min-h-[44px]"
                >
                  Continue Setup →
                </Link>
                <button
                  onClick={handleDismissBanner}
                  className="p-2 text-orange-400 hover:text-orange-700 text-lg leading-none transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION CARD (State 2: Onboarding Complete, No Access) */}
          {showSubscriptionCard && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl sm:rounded-3xl border border-blue-100 bg-white p-4 sm:p-6 md:p-8 shadow-xs sm:shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <Unlock className="w-7 h-7 sm:w-8 sm:h-8 text-custom-blue shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    Your profile is ready. Choose a subscription to start learning.
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Everything is set up. The last step is choosing a plan that gives you access to lessons, quizzes, and simulations.
                  </p>
                </div>
              </div>
              <div className="shrink-0 w-full sm:w-auto">
                <Link
                  to="/subscription"
                  className="rounded-xl sm:rounded-2xl bg-custom-blue px-4 py-2.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap flex items-center justify-center w-full sm:w-auto min-h-[44px]"
                >
                  View Subscription Plans →
                </Link>
              </div>
            </div>
          )}

          {/* SECTION 1: RECENTLY OPENED */}
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-custom-blue" />
                Recently Opened
              </h2>
            </div>

            {recentModules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {recentModules.slice(0, 3).map((module) => {
                  const modPct = module.totalPages > 0
                    ? Math.round(((module.completedConcepts?.length || 0) / module.totalPages) * 100)
                    : (module.isCompleted ? 100 : 0);

                  return (
                    <div
                      key={module.lessonId || module.storageKey}
                      onClick={() => navigate(`/student/lesson-viewer/${module.topicId}?from=student`)}
                      className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-custom-blue border border-blue-100 max-w-[180px] sm:max-w-[200px] truncate">
                            {module.topicName || module.subjectName || 'Curriculum Lesson'}
                          </span>
                          <ProgressCircle
                            percentage={modPct}
                            size={36}
                            strokeWidth={3.5}
                          />
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-custom-blue transition-colors">
                          {module.lessonTitle}
                        </h3>
                      </div>

                      <div className="mt-4 sm:mt-6 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-custom-blue flex items-center gap-1">
                          Continue →
                        </span>
                        <ChevronRight className="w-4 h-4 text-custom-blue group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xs sm:shadow-sm">
                <p className="text-gray-500 text-xs sm:text-sm font-medium">No recently opened lessons. Select a subject below to start learning.</p>
              </div>
            )}
          </section>

          {/* SECTION 2: SUBJECTS */}
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-custom-blue" />
                Subjects
              </h2>
              <Link to="/student/subjects" className="text-xs font-bold text-custom-blue hover:underline py-1 px-2 min-h-[36px] flex items-center">
                View All →
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-36 sm:h-40 bg-gray-200 rounded-2xl sm:rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : subjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {subjects.slice(0, 8).map((subject) => {
                  const gradeLabel = subject.grade_name || '';
                  const progress = subjectProgressMap[subject.id] || { pct: 0, isStarted: false, isCompleted: false };
                  return (
                    <div
                      key={subject.id}
                      onClick={() => handleOpenSubject(subject.id)}
                      className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2.5 sm:p-3 bg-blue-50 text-custom-blue rounded-xl sm:rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <ProgressCircle
                            percentage={progress.pct}
                            size={36}
                            strokeWidth={3.5}
                          />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-custom-blue transition-colors truncate">
                          {subject.name}
                        </h3>
                        {gradeLabel && (
                          <p className="text-xs font-semibold text-gray-400 mt-0.5 truncate">
                            {gradeLabel}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs font-bold truncate">
                          <span className={progress.pct > 0 ? 'text-custom-blue font-extrabold' : 'text-gray-400 font-semibold'}>
                            {progress.isCompleted
                              ? '100% Complete'
                              : progress.pct > 0
                              ? `${progress.pct}% progress`
                              : 'Not started'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-gray-500 border border-gray-100">
                No enrolled subjects found.
              </div>
            )}
          </section>

        </div>
    </div>
  );
}

export default Dashboard;