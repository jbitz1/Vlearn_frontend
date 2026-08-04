import React from 'react';
import { CheckCircle, Building2, MapPin, Target, Layers, BookOpen, GraduationCap, Users } from 'lucide-react';

export default function SchoolReviewStep({
  formData,
  firstStreamData,
  curricula,
  grades,
  onEditSchool,
  onEditStream,
  onConfirm,
  isSubmitting
}) {
  const selectedCurriculumName = curricula.find(c => c.id === firstStreamData.curriculumId)?.name || 'Unknown';
  const selectedGradeName = grades.find(g => g.id === firstStreamData.gradeId)?.name || 'Unknown';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Review Your School Profile</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Please confirm your details before we set up your school.
        </p>
      </div>

      <div className="space-y-4">
        {/* School Summary Card */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-custom-blue" />
              School Details
            </h3>
            <button 
              onClick={onEditSchool}
              disabled={isSubmitting}
              className="text-sm text-custom-blue hover:underline font-semibold"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <span className="block text-gray-500 text-xs">Name</span>
              <span className="font-medium text-gray-900">{formData.name}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs">Code</span>
              <span className="font-medium text-gray-900">{formData.code || 'None'}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</span>
              <span className="font-medium text-gray-900">{formData.location_county}, {formData.location_subcounty}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs flex items-center gap-1"><Target className="w-3 h-3"/> Type & Ownership</span>
              <span className="font-medium text-gray-900 capitalize">{formData.school_type.toLowerCase()} • {formData.ownership_type.toLowerCase()}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-gray-500 text-xs flex items-center gap-1"><Layers className="w-3 h-3"/> Curricula Offered</span>
              <span className="font-medium text-gray-900">{formData.curricula_offered}</span>
            </div>
          </div>
        </div>

        {/* First Stream Summary Card */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-custom-orange" />
              First Stream Details
            </h3>
            <button 
              onClick={onEditStream}
              disabled={isSubmitting}
              className="text-sm text-custom-blue hover:underline font-semibold"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="col-span-2">
              <span className="block text-gray-500 text-xs flex items-center gap-1"><BookOpen className="w-3 h-3"/> Curriculum</span>
              <span className="font-medium text-gray-900">{selectedCurriculumName}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs flex items-center gap-1"><GraduationCap className="w-3 h-3"/> Grade / Form</span>
              <span className="font-medium text-gray-900">{selectedGradeName}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs">Stream Name</span>
              <span className="font-medium text-gray-900">{firstStreamData.name}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs">Number of Students</span>
              <span className="font-medium text-gray-900">{firstStreamData.numberOfStudents || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Next Milestones Info */}
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mt-4">
          <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900">What happens next?</h4>
            <p className="text-xs text-blue-700 mt-1">
              After confirming and choosing your subscription, you'll reach your dashboard where you can:
            </p>
            <ul className="text-xs text-blue-700 mt-1 list-disc pl-4 space-y-0.5">
              <li>Invite teachers to your school</li>
              <li>Create additional streams</li>
              <li>Import student lists</li>
              <li>Upload historical academic records</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-3xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-custom-orange/70 cursor-wait'
              : 'bg-custom-orange hover:bg-orange-600 hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating School...
            </>
          ) : (
            'Confirm & Continue to Subscription'
          )}
        </button>
      </div>
    </div>
  );
}
