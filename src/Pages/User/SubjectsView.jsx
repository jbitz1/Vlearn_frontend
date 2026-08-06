import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, ChevronRight, Layers } from 'lucide-react';
import studentCurriculumService from '../../services/studentCurriculumService';

export const SubjectsView = () => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCurriculum = async () => {
      setIsLoading(true);
      const fetchedGrades = await studentCurriculumService.getGrades();
      setGrades(fetchedGrades);

      if (fetchedGrades.length > 0) {
        const defaultGrade = fetchedGrades[0];
        setSelectedGrade(defaultGrade);
        const fetchedSubjects = await studentCurriculumService.getSubjects(defaultGrade.id);
        setSubjects(fetchedSubjects);
      } else {
        const allSubjects = await studentCurriculumService.getSubjects();
        setSubjects(allSubjects);
      }
      setIsLoading(false);
    };

    loadCurriculum();
  }, []);

  const handleGradeChange = async (grade) => {
    setSelectedGrade(grade);
    setIsLoading(true);
    const fetchedSubjects = await studentCurriculumService.getSubjects(grade.id);
    setSubjects(fetchedSubjects);
    setIsLoading(false);
  };

  const handleSelectSubject = (subjectId) => {
    navigate(`/student/subject/${subjectId}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Subjects</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">Select a subject to continue learning.</p>
      </div>

      {/* Grade Selector Tabs if multiple grades exist */}
      {grades.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          <Layers className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
          {grades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => handleGradeChange(grade)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                selectedGrade?.id === grade.id
                  ? 'bg-custom-blue text-white shadow-sm'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const gradeSubtitle = selectedGrade?.name || subject.grade_name || '';

            return (
              <div
                key={subject.id}
                onClick={() => handleSelectSubject(subject.id)}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                    {subject.name}
                  </h2>
                  {gradeSubtitle && (
                    <p className="text-xs font-semibold text-gray-400 mt-1">
                      {gradeSubtitle}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500">Subject Progress</span>
                    <span className="text-gray-400 font-semibold">Not started</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-transparent h-1.5 rounded-full w-0"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-12 text-center text-gray-500 border border-gray-200">
          No subjects available for the selected class.
        </div>
      )}
    </div>
  );
};

export default SubjectsView;
