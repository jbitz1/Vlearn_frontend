import { Check, ChevronRight, Loader } from "lucide-react";
import Swal from "sweetalert2";

export default function SubjectsStep({
  subjects,
  selectedSubjectIds,
  handleSubjectToggle,
  maxSubjects,
  setStep,
  handleNextStep,
  isLoading,
  subjectsLoading
}) {
  // Sort subjects by order property if available, fallback to alphabetical
  const sortedSubjects = [...subjects].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Select Your Subjects</h2>
        <p className="text-gray-600 text-sm">Select up to {maxSubjects} subjects you are studying.</p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-custom-blue text-xs font-semibold">
          {selectedSubjectIds.length} of {maxSubjects} selected
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
        {subjectsLoading ? (
          // Skeleton Loader for Subjects
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl border-2 border-gray-100 bg-gray-50 animate-pulse h-12 flex items-center">
              <div className="w-5 h-5 rounded bg-gray-200 mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : sortedSubjects.length > 0 ? (
          sortedSubjects.map((sub) => {
            const isSelected = selectedSubjectIds.includes(sub.id);
            return (
              <div
                key={sub.id}
                onClick={() => {
                   if (!isSelected && selectedSubjectIds.length >= maxSubjects) {
                      Swal.fire("Subject Limit Reached", `You can select a maximum of ${maxSubjects} subjects.`, "info");
                   } else {
                      handleSubjectToggle(sub.id);
                   }
                }}
                className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${isSelected ? 'border-custom-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${isSelected ? 'bg-custom-blue border-custom-blue text-white' : 'border-gray-300'}`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">{sub.name}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center col-span-2 text-gray-500 py-6 text-xs sm:text-sm">No subjects found for this grade.</p>
        )}
      </div>

      <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-100">
        <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-300 rounded-full text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px] cursor-pointer">Back</button>
        <button
          onClick={handleNextStep}
          disabled={selectedSubjectIds.length === 0 || isLoading}
          className={`px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-white font-semibold text-xs sm:text-sm flex items-center justify-center transition-all min-h-[44px] ${selectedSubjectIds.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-orange shadow-md cursor-pointer'}`}
        >
          {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <>Review <ChevronRight className="ml-1.5 w-4 h-4 sm:w-5 sm:h-5" /></>}
        </button>
      </div>
    </div>
  );
}
