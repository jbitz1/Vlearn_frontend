import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, ChevronRight, Layers } from 'lucide-react';
import studentCurriculumService from '../../services/studentCurriculumService';
import UserContext from '../../Context/UserContext';
import ProgressCircle from '../../Components/Common/ProgressCircle';

export const SubjectsView = () => {
  const { user } = useContext(UserContext);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectProgressMap, setSubjectProgressMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const computeAllSubjectsProgress = async (subjectsList) => {
    if (!subjectsList || subjectsList.length === 0) return;
    const progressMap = {};
    await Promise.all(
      subjectsList.map(async (subj) => {
        const topics = await studentCurriculumService.getTopicsForSubject(subj.id);
        const prog = studentCurriculumService.getSubjectProgress(subj.id, topics, user?.id);
        progressMap[subj.id] = prog;
      })
    );
    setSubjectProgressMap(progressMap);
  };

  const [allEnrolledSubjects, setAllEnrolledSubjects] = useState([]);

  useEffect(() => {
    const loadCurriculum = async () => {
      setIsLoading(true);
      const [fetchedGrades, fetchedSubjects] = await Promise.all([
        studentCurriculumService.getGrades(),
        studentCurriculumService.getSubjects(null, true)
      ]);

      setAllEnrolledSubjects(fetchedSubjects);

      // Determine which grade IDs actually have enrolled subjects
      const enrolledGradeIds = new Set(
        fetchedSubjects.map(s => s.grade || s.grade_id || s.grade?.id).filter(Boolean)
      );

      // Only include grades the student is actively subscribed/enrolled to
      const userGrades = fetchedGrades.filter(g => enrolledGradeIds.has(g.id));
      const activeGradesList = userGrades.length > 0 ? userGrades : fetchedGrades;
      setGrades(activeGradesList);

      let displayedSubjects = [];
      if (activeGradesList.length > 0) {
        const defaultGrade = activeGradesList[0];
        setSelectedGrade(defaultGrade);
        displayedSubjects = activeGradesList.length > 1
          ? fetchedSubjects.filter(s => (s.grade || s.grade_id || s.grade?.id) === defaultGrade.id)
          : fetchedSubjects;
      } else {
        displayedSubjects = fetchedSubjects;
      }

      const ordered = studentCurriculumService.orderSubjectsByLastOpened(displayedSubjects, user?.id);
      setSubjects(ordered);
      await computeAllSubjectsProgress(ordered);
      setIsLoading(false);
    };

    loadCurriculum();
  }, [user?.id]);

  const handleGradeChange = async (grade) => {
    setSelectedGrade(grade);
    setIsLoading(true);
    let gradeSubjects = allEnrolledSubjects.filter(
      s => (s.grade || s.grade_id || s.grade?.id) === grade.id
    );
    if (gradeSubjects.length === 0) {
      gradeSubjects = await studentCurriculumService.getSubjects(grade.id, true);
    }
    const ordered = studentCurriculumService.orderSubjectsByLastOpened(gradeSubjects, user?.id);
    setSubjects(ordered);
    await computeAllSubjectsProgress(ordered);
    setIsLoading(false);
  };

  const handleSelectSubject = (subjectId) => {
    studentCurriculumService.recordSubjectAccess(subjectId, user?.id);
    navigate(`/student/subject/${subjectId}`);
  };

  return (
    <div className="pl-14 pr-4 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Subjects</h1>
        <p className="text-gray-500 font-medium text-xs sm:text-sm mt-0.5">Select a subject to continue learning.</p>
      </div>

      {/* Grade Selector Tabs if multiple grades exist */}
      {grades.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
          <Layers className="w-5 h-5 text-gray-400 mr-1 shrink-0" />
          {grades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => handleGradeChange(grade)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-colors whitespace-nowrap min-h-[44px] flex items-center cursor-pointer ${
                selectedGrade?.id === grade.id
                  ? 'bg-custom-blue text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {grade.name}
            </button>
          ))}
        </div>
      )}

      {/* Subject Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 sm:h-48 bg-gray-200 rounded-2xl sm:rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {subjects.map((subject) => {
            const gradeSubtitle = selectedGrade?.name || subject.grade_name || '';
            const progress = subjectProgressMap[subject.id] || { pct: 0, isStarted: false, isCompleted: false };

            return (
              <div
                key={subject.id}
                onClick={() => handleSelectSubject(subject.id)}
                className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2.5 sm:p-3 bg-blue-50 text-custom-blue rounded-xl sm:rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <ProgressCircle
                      percentage={progress.pct}
                      size={40}
                      strokeWidth={4}
                    />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                    {subject.name}
                  </h2>
                  {gradeSubtitle && (
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">
                      {gradeSubtitle}
                    </p>
                  )}
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs font-bold">
                    <span className="text-gray-400 block text-[11px]">Subject Progress</span>
                    <span className={progress.pct > 0 ? 'text-custom-blue font-extrabold' : 'text-gray-400 font-semibold'}>
                      {progress.isCompleted
                        ? '100% Completed'
                        : progress.pct > 0
                        ? `${progress.pct}% in progress`
                        : 'Not started'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs font-bold text-custom-blue group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-gray-500 border border-gray-200">
          No subjects available for the selected class.
        </div>
      )}
    </div>
  );
};

export default SubjectsView;
