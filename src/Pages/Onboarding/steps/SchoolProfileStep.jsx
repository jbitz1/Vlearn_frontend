import React from 'react';

const SchoolProfileStep = ({ data = {}, updateData }) => {
  const fields = [
    { key: 'name', label: 'School Name', value: data?.name || '', full: true },
    { key: 'code', label: 'School Code', value: data?.code || '', readOnly: true },
    { key: 'type', label: 'School Type', value: data?.type || '' },
    { key: 'curriculum', label: 'Curriculum', value: data?.curriculum || '' },
    { key: 'county', label: 'County', value: data?.county || '' },
    { key: 'subCounty', label: 'Sub-County', value: data?.subCounty || '' },
    { key: 'phone', label: 'School Contact', value: data?.phone || '' },
    { key: 'adminName', label: 'Administrator Name', value: data?.adminName || '' },
    { key: 'adminPhone', label: 'Administrator Phone', value: data?.adminPhone || '' },
    { key: 'email', label: 'Administrator / Contact Email', value: data?.email || data?.adminEmail || '' },
    { key: 'academicYear', label: 'Academic Year', value: data?.academicYear || '2026' },
    { key: 'currentTerm', label: 'Current Term', value: data?.currentTerm || 'Term 1' },
  ];

  const handleChange = (key, val) => {
    updateData({ ...data, [key]: val });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-navy">School Profile</h2>
          <p className="text-sm text-slate-500">Confirm your school details. You can update these later in Settings.</p>
        </div>
        {data?.code && (
          <span className="px-3 py-1 bg-primary-light text-primary font-mono font-bold text-xs rounded-lg">
            {data.code}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2">
        {fields.map(({ key, label, value, full, readOnly }) => (
          <div key={label} className={full ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
            <input
              value={value}
              readOnly={readOnly}
              onChange={(e) => handleChange(key, e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary transition-colors bg-white text-slate-800 ${
                readOnly ? 'bg-slate-50 font-mono text-slate-500 cursor-not-allowed' : ''
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolProfileStep;
