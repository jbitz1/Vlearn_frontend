import React, { useState, useEffect } from 'react';
import { X, Building } from 'lucide-react';
import schoolAdminService from '../../services/schoolAdminService';
import { useSchoolContext } from '../../Context/SchoolContext';

export function InstitutionSettingsModal({ isOpen, onClose }) {
  const { school, refreshAll } = useSchoolContext();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (school) {
      setName(school.name || '');
      setCode(school.code || '');
      setContactEmail(school.contact_email || '');
      setPhoneNumber(school.phone_number || '');
      setAddress(school.address || '');
    } else {
      setName('');
      setCode('');
      setContactEmail('');
      setPhoneNumber('');
      setAddress('');
    }
    setError(null);
  }, [school, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !contactEmail) {
      setError('School Name and Contact Email are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (school?.id) {
        await schoolAdminService.updateSchool(school.id, {
          name,
          contact_email: contactEmail,
          phone_number: phoneNumber,
          address,
        });
      } else {
        await schoolAdminService.createSchool({
          name,
          code: code.toUpperCase() || 'SCH-001',
          contact_email: contactEmail,
          phone_number: phoneNumber,
          address,
        });
      }

      await refreshAll();
      onClose();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Failed to save institution settings.';
      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-custom-blue" />
            <h3 className="font-extrabold text-gray-900 text-lg">
              {school ? 'Institution Settings' : 'Create School Institution'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              School Name
            </label>
            <input
              type="text"
              placeholder="e.g. VizLearn Academy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              School Code
            </label>
            <input
              type="text"
              placeholder="e.g. VIZ-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!school}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none disabled:opacity-60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Contact Email
            </label>
            <input
              type="email"
              placeholder="admin@school.co"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+254700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Campus Address
            </label>
            <input
              type="text"
              placeholder="Address / Location"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-custom-blue focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-custom-blue text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InstitutionSettingsModal;
