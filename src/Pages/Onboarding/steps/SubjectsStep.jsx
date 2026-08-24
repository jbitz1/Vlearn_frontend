import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';

const SUBJECT_LIST = [
  { id: 'mat', name: 'Mathematics' },
  { id: 'eng', name: 'English' },
  { id: 'kis', name: 'Kiswahili' },
  { id: 'bio', name: 'Biology' },
  { id: 'chem', name: 'Chemistry' },
  { id: 'phy', name: 'Physics' },
  { id: 'geo', name: 'Geography' },
  { id: 'his', name: 'History & Government' },
  { id: 'cre', name: 'Christian Religious Education' },
  { id: 'agr', name: 'Agriculture' },
  { id: 'bst', name: 'Business Studies' },
  { id: 'comp', name: 'Computer Studies' },
];

const SubjectsStep = ({ selectedSubjects = [], updateData }) => {
  const [customName, setCustomName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const selected = Array.isArray(selectedSubjects) ? selectedSubjects : [];

  const toggle = (id) => {
    if (selected.includes(id)) {
      updateData(selected.filter(s => s !== id));
    } else {
      updateData([...selected, id]);
    }
  };

  const handleAddCustom = () => {
    if (customName.trim()) {
      const customId = customName.trim().toLowerCase().replace(/\s+/g, '-');
      if (!selected.includes(customId)) {
        updateData([...selected, customId]);
      }
      setCustomName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-heading text-navy">Select Subjects</h2>
      <p className="text-sm text-slate-500">Choose all subjects offered at your school. You can add custom subjects below.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
        {SUBJECT_LIST.map(s => {
          const active = selected.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all cursor-pointer ${
                active
                  ? 'border-primary bg-primary-light text-primary font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${active ? 'bg-primary' : 'border border-slate-300'}`}>
                {active && <Check size={11} className="text-white stroke-[3]" />}
              </div>
              <span className="truncate">{s.name}</span>
            </button>
          );
        })}
      </div>

      {!isAdding ? (
        <button 
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline pt-1 cursor-pointer"
        >
          <Plus size={15} /> Add custom subject
        </button>
      ) : (
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="e.g. French, Music, Home Science"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 pt-1">{selected.length} subject(s) selected</p>
    </div>
  );
};

export default SubjectsStep;
