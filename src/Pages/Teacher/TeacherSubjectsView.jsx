import { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import teacherCurriculumService from '../../services/teacherCurriculumService';
import AddSubjectModal from '../../Components/Teacher/AddSubjectModal';

export const TeacherSubjectsView = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Subject Modal state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const loadSubjects = async () => {
    setIsLoading(true);
    const overallSubjects = await teacherCurriculumService.getTeacherSubjects();
    setSubjects(overallSubjects);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubjectAdded = () => {
    loadSubjects();
  };

  return (
    <div className="space-y-8 min-h-screen">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/teacher')}
          className="flex items-center text-sm font-bold text-custom-blue hover:underline mb-4 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">My Subjects</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              Curriculum subjects you prepare for and teach.
            </p>
          </div>

          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="px-5 py-2.5 bg-custom-blue hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-custom-blue group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  {subject.grade_name || 'Curriculum Subject'}
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
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100 text-sm flex flex-col items-center gap-3">
          <div className="p-3.5 bg-blue-50 text-custom-blue rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="font-bold text-gray-800 text-base">No subjects added yet.</span>
          <p className="text-xs text-gray-500 max-w-md">
            Add subjects directly from the platform's Curriculum Builder pool to start preparing and teaching.
          </p>
          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="mt-2 px-5 py-2.5 bg-custom-blue text-white hover:bg-blue-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Subject from Curriculum Builder
          </button>
        </div>
      )}

      {/* Add Subject Modal from Curriculum Builder */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSubjectAdded={handleSubjectAdded}
        existingSubjectIds={subjects.map(s => s.id)}
      />
    </div>
  );
};

export default TeacherSubjectsView;
