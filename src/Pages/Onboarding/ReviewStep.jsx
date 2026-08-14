import { Loader, CheckCircle2, Pencil } from "lucide-react";

export default function ReviewStep({
  schoolName,
  curriculumName,
  gradeName,
  selectedSubjects,
  setStep,
  handleFinish,
  isLoading
}) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-full mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Review Your Profile</h2>
        <p className="text-gray-600 text-sm">Please confirm your academic details before continuing.</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-5">
        {/* Academic Context Summary */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wider">Academic Context</h3>
            <button 
              onClick={() => setStep(1)} 
              className="text-custom-blue hover:text-custom-orange text-xs flex items-center transition-colors font-medium min-h-[36px] px-2 cursor-pointer"
            >
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </button>
          </div>
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-100 shadow-xs space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">School</span>
              <span className="font-medium text-gray-900 text-right">{schoolName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Curriculum</span>
              <span className="font-medium text-gray-900 text-right">{curriculumName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Grade / Form</span>
              <span className="font-medium text-gray-900 text-right">{gradeName}</span>
            </div>
          </div>
        </div>

        {/* Subjects Summary */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wider">
              Selected Subjects ({selectedSubjects.length})
            </h3>
            <button 
              onClick={() => setStep(2)} 
              className="text-custom-blue hover:text-custom-orange text-xs flex items-center transition-colors font-medium min-h-[36px] px-2 cursor-pointer"
            >
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </button>
          </div>
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-100 shadow-xs">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {selectedSubjects.map(sub => (
                <span key={sub.id} className="px-2.5 py-1 bg-blue-50 text-custom-blue text-xs font-semibold rounded-lg border border-blue-100">
                  {sub.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handleFinish}
          disabled={isLoading}
          className="w-full px-6 py-3.5 bg-custom-orange text-white font-bold text-xs sm:text-sm rounded-full hover:bg-custom-blue shadow-md transition-all flex items-center justify-center min-h-[44px] cursor-pointer"
        >
          {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Continue to Subscription"}
        </button>
      </div>
    </div>
  );
}
