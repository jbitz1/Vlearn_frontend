import { useState } from "react";
import { ChevronRight, BookOpen, Loader } from "lucide-react";

export default function AcademicContextStep({
  curricula,
  grades,
  selectedCurriculumId,
  setSelectedCurriculumId,
  selectedGradeId,
  setSelectedGradeId,
  schoolOption,
  setSchoolOption,
  unverifiedSchoolName,
  setUnverifiedSchoolName,
  isHomeschooled,
  setIsHomeschooled,
  fetchingData,
  gradesLoading,
  handleNextStep,
  isLoading
}) {

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Select Curriculum & Grade</h2>
        <p className="text-gray-600 text-sm">Choose your curriculum to view available grades and form levels.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">1. Select Curriculum</label>
        <div className="grid grid-cols-2 gap-4">
          {fetchingData ? (
            // Skeleton Loader for Curricula
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 animate-pulse h-28"></div>
            ))
          ) : curricula.length > 0 ? (
            curricula.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCurriculumId(c.id)}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-center ${selectedCurriculumId === c.id ? 'border-custom-orange bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-custom-blue'}`}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-custom-blue" />
                <h3 className="font-bold text-gray-800">{c.name}</h3>
                <p className="text-xs text-gray-500">{c.description || 'Standard Curriculum'}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-2">No curricula available.</p>
          )}
        </div>
      </div>

      {selectedCurriculumId && (
        <div className="animate-fade-in">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">2. Select Grade / Form</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gradesLoading ? (
              // Skeleton Loader for Grades
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl border-2 border-gray-100 bg-gray-50 animate-pulse h-12"></div>
              ))
            ) : grades.length > 0 ? (
              grades.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGradeId(g.id)}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all text-center flex items-center justify-center ${selectedGradeId === g.id ? 'border-custom-blue bg-blue-50 shadow-sm font-bold' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="text-sm text-gray-800">{g.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 col-span-3">No grades found for this curriculum.</p>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">3. School Context (Optional)</label>
        
        {!isHomeschooled && (
          <div className="animate-fade-in mb-3">
            <input
              type="text"
              value={unverifiedSchoolName}
              onChange={(e) => {
                setUnverifiedSchoolName(e.target.value);
                setSchoolOption(e.target.value.trim() ? "UNVERIFIED" : "NONE");
              }}
              placeholder="Enter your school name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-custom-blue outline-none"
            />
          </div>
        )}

        <label className="flex items-center space-x-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={isHomeschooled}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsHomeschooled(checked);
              setSchoolOption("NONE");
              if (checked) {
                setUnverifiedSchoolName("");
              }
            }}
            className="w-4 h-4 text-custom-blue rounded border-gray-300 focus:ring-custom-blue"
          />
          <span className="text-sm text-gray-700">I am homeschooled / home learner</span>
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={handleNextStep}
          disabled={!selectedGradeId || isLoading || !selectedCurriculumId}
          className={`px-8 py-3 rounded-full text-white font-semibold flex items-center transition-all ${(!selectedGradeId || !selectedCurriculumId) ? 'bg-gray-300 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-orange shadow-md'}`}
        >
          {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <>Next <ChevronRight className="ml-2 w-5 h-5" /></>}
        </button>
      </div>
    </div>
  );
}
