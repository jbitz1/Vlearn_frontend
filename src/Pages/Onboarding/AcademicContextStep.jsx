import { useState } from "react";
import { ChevronRight, BookOpen, Loader } from "lucide-react";

export default function AcademicContextStep({
  curricula,
  grades,
  verifiedSchools,
  selectedCurriculumId,
  setSelectedCurriculumId,
  selectedGradeId,
  setSelectedGradeId,
  schoolOption,
  setSchoolOption,
  selectedSchoolId,
  setSelectedSchoolId,
  unverifiedSchoolName,
  setUnverifiedSchoolName,
  fetchingData,
  gradesLoading,
  handleNextStep,
  isLoading
}) {
  const [schoolSearch, setSchoolSearch] = useState("");

  const filteredSchools = verifiedSchools.filter(s => 
    s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(schoolSearch.toLowerCase()))
  );

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
        <select
          value={schoolOption}
          onChange={(e) => {
            setSchoolOption(e.target.value);
            if (e.target.value !== "VERIFIED") setSelectedSchoolId(null);
            if (e.target.value !== "UNVERIFIED") setUnverifiedSchoolName("");
          }}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-custom-blue mb-3 outline-none"
        >
          <option value="NONE">Studying Independently / Not Listed</option>
          <option value="VERIFIED">Select Registered School</option>
          <option value="UNVERIFIED">Propose My School Name</option>
        </select>

        {schoolOption === "VERIFIED" && (
          <div className="space-y-2 animate-fade-in">
            <input 
              type="text" 
              placeholder="Search schools..." 
              value={schoolSearch}
              onChange={(e) => setSchoolSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-custom-blue text-sm outline-none"
            />
            {fetchingData ? (
               <div className="w-full h-32 rounded-xl border border-gray-100 bg-gray-50 animate-pulse"></div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map(sch => (
                    <div 
                      key={sch.id}
                      onClick={() => setSelectedSchoolId(sch.id)}
                      className={`p-3 cursor-pointer transition-colors ${selectedSchoolId === sch.id ? 'bg-blue-50 border-l-4 border-custom-blue' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                    >
                      <div className="font-semibold text-sm text-gray-800">{sch.name}</div>
                      {sch.code && <div className="text-xs text-gray-500">{sch.code}</div>}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No schools match your search.</div>
                )}
              </div>
            )}
          </div>
        )}

        {schoolOption === "UNVERIFIED" && (
          <div className="animate-fade-in">
            <input
              type="text"
              value={unverifiedSchoolName}
              onChange={(e) => setUnverifiedSchoolName(e.target.value)}
              placeholder="Enter School Name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-custom-blue outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={handleNextStep}
          disabled={!selectedGradeId || isLoading || !selectedCurriculumId || (schoolOption === 'VERIFIED' && !selectedSchoolId) || (schoolOption === 'UNVERIFIED' && !unverifiedSchoolName.trim())}
          className={`px-8 py-3 rounded-full text-white font-semibold flex items-center transition-all ${(!selectedGradeId || !selectedCurriculumId || (schoolOption === 'VERIFIED' && !selectedSchoolId) || (schoolOption === 'UNVERIFIED' && !unverifiedSchoolName.trim())) ? 'bg-gray-300 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-orange shadow-md'}`}
        >
          {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <>Next <ChevronRight className="ml-2 w-5 h-5" /></>}
        </button>
      </div>
    </div>
  );
}
