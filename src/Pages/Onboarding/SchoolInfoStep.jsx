import React from 'react';
import { Building2, MapPin, Target, Layers } from 'lucide-react';

export default function SchoolInfoStep({ formData, onChange, onNext }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const isFormValid =
    formData.name?.trim().length >= 3 &&
    formData.location_county?.trim().length >= 2 &&
    formData.location_subcounty?.trim().length >= 2 &&
    formData.school_type &&
    formData.ownership_type &&
    formData.curricula_offered;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">School Information</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Let's start by establishing your school's core identity.
        </p>
      </div>

      <div className="space-y-4">
        {/* School Name & Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              School Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. Elite High School"
                className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              School Code <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code || ''}
              onChange={handleChange}
              placeholder="e.g. 10101001 (KNEC code)"
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              County <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="location_county"
                value={formData.location_county || ''}
                onChange={handleChange}
                placeholder="e.g. Kiambu"
                className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sub-County <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location_subcounty"
              value={formData.location_subcounty || ''}
              onChange={handleChange}
              placeholder="e.g. Kikuyu"
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              School Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Target className="h-4 w-4 text-gray-400" />
              </div>
              <select
                name="school_type"
                value={formData.school_type || ''}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all bg-white appearance-none"
                required
              >
                <option value="" disabled>Select Type</option>
                <option value="NATIONAL">National School</option>
                <option value="EXTRA_COUNTY">Extra County School</option>
                <option value="COUNTY">County School</option>
                <option value="SUB_COUNTY">Sub County School</option>
                <option value="PRIVATE">Private School</option>
                <option value="INTERNATIONAL">International School</option>
                <option value="ADULT_LEARNING">Adult Learner / Alternative</option>
                <option value="OTHER">Other / Not Sure</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ownership <span className="text-red-500">*</span>
            </label>
            <select
              name="ownership_type"
              value={formData.ownership_type || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all bg-white appearance-none"
              required
            >
              <option value="" disabled>Select Ownership</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="FAITH_BASED">Faith-Based</option>
              <option value="COMMUNITY">Community</option>
              <option value="NGO">NGO</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Curriculum */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Curricula Offered <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Layers className="h-4 w-4 text-gray-400" />
            </div>
            <select
              name="curricula_offered"
              value={formData.curricula_offered || ''}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-custom-blue focus:border-transparent outline-none transition-all bg-white appearance-none"
              required
            >
              <option value="" disabled>Select Curricula</option>
              <option value="CBC">CBC (Competency Based Curriculum)</option>
              <option value="8-4-4">8-4-4 System</option>
              <option value="BOTH">Both CBC and 8-4-4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`w-full py-3 px-4 rounded-3xl font-bold text-white transition-all shadow-md ${isFormValid
            ? 'bg-custom-orange hover:bg-orange-600 hover:shadow-lg'
            : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }`}
        >
          Next: Create First Stream
        </button>
      </div>
    </div>
  );
}
