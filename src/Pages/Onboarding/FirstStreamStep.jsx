import React from 'react';
import { BookOpen, GraduationCap, Users, User, ChevronLeft } from 'lucide-react';

export default function FirstStreamStep({
  curricula,
  grades,
  selectedCurriculumId,
  selectedGradeId,
  streamName,
  numberOfStudents,
  onCurriculumChange,
  onGradeChange,
  onStreamNameChange,
  onStudentCountChange,
  loadingStates,
  onBack,
  onNext,
}) {
  const isFormValid = selectedCurriculumId && selectedGradeId && streamName?.trim().length >= 2;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create First Stream</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Set up your first class group. You can add more streams later.
        </p>
      </div>

      <div className="space-y-4">
        {/* Curriculum */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Curriculum <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedCurriculumId || ''}
              onChange={(e) => onCurriculumChange(e.target.value)}
              disabled={loadingStates.curricula}
              className={`w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all bg-white appearance-none ${
                loadingStates.curricula ? 'opacity-50 cursor-wait' : ''
              }`}
              required
            >
              <option value="" disabled>
                {loadingStates.curricula ? 'Loading curricula...' : 'Select Curriculum'}
              </option>
              {curricula.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Grade / Form <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedGradeId || ''}
              onChange={(e) => onGradeChange(e.target.value)}
              disabled={!selectedCurriculumId || loadingStates.grades}
              className={`w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all bg-white appearance-none ${
                !selectedCurriculumId || loadingStates.grades ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              required
            >
              <option value="" disabled>
                {!selectedCurriculumId
                  ? 'Select a curriculum first'
                  : loadingStates.grades
                  ? 'Loading grades...'
                  : 'Select Grade / Form'}
              </option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stream Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Stream Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={streamName || ''}
              onChange={(e) => onStreamNameChange(e.target.value)}
              placeholder="e.g. Form 1 North or Grade 7 Stream A"
              className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Number of Students */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Number of Students <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              min="0"
              value={numberOfStudents || ''}
              onChange={(e) => onStudentCountChange(e.target.value)}
              placeholder="e.g. 40"
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 text-gray-400">
              Class Teacher
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-300" />
              </div>
              <input
                type="text"
                disabled
                placeholder="Assign after adding teachers"
                className="w-full pl-10 pr-4 py-2 text-gray-400 bg-gray-50 border border-gray-200 rounded-2xl cursor-not-allowed outline-none text-sm"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Class teachers can be assigned after inviting teachers to your school.</p>
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 rounded-3xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-center flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`flex-1 py-3 px-4 rounded-3xl font-bold text-white transition-all shadow-md ${
            isFormValid
              ? 'bg-custom-orange hover:bg-orange-600 hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
          }`}
        >
          Next: Review
        </button>
      </div>
    </div>
  );
}
