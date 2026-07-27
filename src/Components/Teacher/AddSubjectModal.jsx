import { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Check, Layers, GraduationCap } from 'lucide-react';
import teacherCurriculumService from '../../services/teacherCurriculumService';

export const AddSubjectModal = ({ isOpen, onClose, onSubjectAdded, existingSubjectIds = [] }) => {
  const [catalog, setCatalog] = useState([]);
  const [activeCurriculumId, setActiveCurriculumId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set(existingSubjectIds.map(id => String(id))));

  useEffect(() => {
    if (!isOpen) return;

    const loadCatalog = async () => {
      setIsLoading(true);
      const data = await teacherCurriculumService.getCurriculumCatalog();
      setCatalog(data);
      if (data.length > 0) {
        setActiveCurriculumId(data[0].id);
      }
      setIsLoading(false);
    };

    loadCatalog();
    setAddedIds(new Set(existingSubjectIds.map(id => String(id))));
  }, [isOpen, existingSubjectIds]);

  if (!isOpen) return null;

  const handleSelectSubject = (subjectObj) => {
    teacherCurriculumService.addTeacherSubject(subjectObj);
    setAddedIds(prev => new Set([...prev, String(subjectObj.id)]));
    if (onSubjectAdded) onSubjectAdded(subjectObj);
  };

  const activeCurriculum = catalog.find(c => c.id === activeCurriculumId) || catalog[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-custom-blue" />
              Add Subject from Curriculum Builder
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              Select available subjects organized by platform Curricula and Grades.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-custom-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-500">Loading Curriculum Builder Pool...</p>
          </div>
        ) : catalog.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No subjects currently published in the Curriculum Builder pool.
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto pr-1 flex-1">
            {/* Curriculum Tabs */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 overflow-x-auto">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                <Layers className="w-4 h-4 text-custom-blue" /> Curriculum:
              </span>
              {catalog.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCurriculumId(c.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                    activeCurriculumId === c.id
                      ? 'bg-custom-blue text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.name}
                  {c.description && <span className="ml-1 opacity-80">({c.description})</span>}
                </button>
              ))}
            </div>

            {/* Grades & Subjects for Selected Curriculum */}
            {activeCurriculum && activeCurriculum.grades ? (
              <div className="space-y-6">
                {activeCurriculum.grades.map(grade => (
                  <div key={grade.id} className="bg-gray-50 border border-gray-100 rounded-3xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        {grade.name}
                      </h4>
                      <span className="text-[10px] font-extrabold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
                        {grade.subjects.length} Subjects Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                      {grade.subjects.map(subj => {
                        const isAdded = addedIds.has(String(subj.id));

                        return (
                          <div
                            key={subj.id}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                              isAdded
                                ? 'bg-purple-50/80 border-purple-200 text-purple-900'
                                : 'bg-white border-gray-200 hover:border-custom-blue hover:shadow-xs text-gray-900'
                            }`}
                          >
                            <div className="truncate">
                              <div className="font-bold text-xs truncate">{subj.name}</div>
                              <div className="text-[10px] text-gray-400 font-semibold truncate">{grade.name} • {activeCurriculum.name}</div>
                            </div>

                            {isAdded ? (
                              <span className="px-2.5 py-1 bg-purple-200/80 text-purple-800 font-extrabold text-[10px] rounded-xl flex items-center gap-1 shrink-0">
                                <Check className="w-3 h-3" /> Added
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSelectSubject(subj)}
                                className="px-3 py-1.5 bg-custom-blue hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal;
