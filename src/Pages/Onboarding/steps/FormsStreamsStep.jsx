import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const FormsStreamsStep = ({ data = {}, curriculum = '', updateData }) => {
  const forms = Array.isArray(data.forms) ? data.forms : [];
  const streams = data.streams && typeof data.streams === 'object' ? data.streams : {};

  const [addingStreamTo, setAddingStreamTo] = useState(null);
  const [newStreamName, setNewStreamName] = useState('');
  const [isAddingForm, setIsAddingForm] = useState(false);
  const [newFormName, setNewFormName] = useState('');

  const getTermSingular = () => {
    if (curriculum === '8-4-4') return 'Form';
    if (curriculum === 'CBC') return 'Grade';
    if (curriculum === 'Both') return 'Form/Grade';
    return 'Level';
  };

  const getTermPlural = () => {
    if (curriculum === '8-4-4') return 'Forms';
    if (curriculum === 'CBC') return 'Grades';
    if (curriculum === 'Both') return 'Forms & Grades';
    return 'Levels';
  };

  const getPlaceholderText = () => {
    if (curriculum === '8-4-4') return 'e.g. Form 1';
    if (curriculum === 'CBC') return 'e.g. Grade 7';
    if (curriculum === 'Both') return 'e.g. Form 1 or Grade 7';
    return 'e.g. Year 9';
  };

  const getDefaultNextLevelName = () => {
    if (curriculum === '8-4-4') {
      return `Form ${forms.length + 1}`;
    }
    if (curriculum === 'CBC') {
      const lastForm = forms[forms.length - 1];
      if (lastForm) {
        const match = lastForm.match(/\d+/);
        if (match) {
          return `Grade ${parseInt(match[0]) + 1}`;
        }
      }
      return 'Grade 7';
    }
    if (curriculum === 'Both') {
      const lastForm = forms[forms.length - 1];
      if (lastForm) {
        const match = lastForm.match(/\d+/);
        if (match) {
          const num = parseInt(match[0]) + 1;
          return lastForm.toLowerCase().includes('grade') ? `Grade ${num}` : `Form ${num}`;
        }
      }
      return 'Grade 7';
    }
    return `Level ${forms.length + 1}`;
  };

  const handleAddFormSubmit = (e) => {
    if (e) e.preventDefault();
    const nameTrimmed = newFormName.trim();
    if (nameTrimmed) {
      if (!forms.includes(nameTrimmed)) {
        updateData({
          forms: [...forms, nameTrimmed],
          streams: {
            ...streams,
            [nameTrimmed]: []
          }
        });
      }
      setNewFormName('');
      setIsAddingForm(false);
    }
  };

  const handleAddStream = (form) => {
    if (newStreamName.trim()) {
      const currentStreams = streams[form] || [];
      updateData({
        forms,
        streams: {
          ...streams,
          [form]: [...currentStreams, newStreamName.trim()]
        }
      });
      setNewStreamName('');
      setAddingStreamTo(null);
    }
  };

  const handleRemoveStream = (form, st) => {
    const currentStreams = streams[form] || [];
    updateData({
      forms,
      streams: {
        ...streams,
        [form]: currentStreams.filter(s => s !== st)
      }
    });
  };

  const handleRemoveForm = (form) => {
    const updatedForms = forms.filter(f => f !== form);
    const updatedStreams = { ...streams };
    delete updatedStreams[form];
    updateData({
      forms: updatedForms,
      streams: updatedStreams
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-heading text-navy">{getTermPlural()} & Streams</h2>
      <p className="text-sm text-slate-500">Set up your school's {getTermSingular().toLowerCase()} levels and the streams within each.</p>
      
      {forms.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <p className="text-sm font-medium text-slate-600 mb-1">No {getTermPlural().toLowerCase()} configured yet</p>
          <p className="text-xs text-slate-400 mb-4">Add your school's {getTermSingular().toLowerCase()} levels (e.g. {getPlaceholderText().replace('e.g. ', '')}) and configure their streams.</p>
          
          {isAddingForm ? (
            <form onSubmit={handleAddFormSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                placeholder={getPlaceholderText()}
                value={newFormName}
                onChange={e => setNewFormName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-primary focus:outline-none bg-white text-slate-800"
                autoFocus
                required
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddingForm(false); setNewFormName(''); }}
                  className="flex-1 sm:flex-initial px-3 py-2 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              type="button"
              onClick={() => {
                setIsAddingForm(true);
                setNewFormName(getDefaultNextLevelName());
              }} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold font-heading hover:bg-navy-700 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add {getTermSingular()}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {forms.map((form) => (
            <div key={form} className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-navy font-heading">{form}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveForm(form)}
                    className="text-xs text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                    title={`Remove ${getTermSingular().toLowerCase()}`}
                  >
                    <X size={13} />
                  </button>
                </div>
                {addingStreamTo !== form && (
                  <button 
                    type="button"
                    onClick={() => setAddingStreamTo(form)}
                    className="text-xs text-primary font-medium hover:underline cursor-pointer"
                  >
                    + Add Stream
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {(streams[form] || []).map((st) => (
                  <span 
                    key={st} 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-light text-primary text-xs font-semibold font-heading"
                  >
                    {st}
                    <button 
                      type="button"
                      onClick={() => handleRemoveStream(form, st)} 
                      className="hover:text-primary-dark cursor-pointer ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {addingStreamTo === form && (
                  <div className="inline-flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. North, A, 7B"
                      value={newStreamName}
                      onChange={e => setNewStreamName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddStream(form)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-primary focus:outline-none w-32"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleAddStream(form)}
                      className="px-2 py-1 bg-primary text-white text-xs rounded-lg font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingStreamTo(null); setNewStreamName(''); }}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {(streams[form] || []).length === 0 && addingStreamTo !== form && (
                  <span className="text-xs text-slate-400 italic">No streams yet</span>
                )}
              </div>
            </div>
          ))}

          {isAddingForm ? (
            <form onSubmit={handleAddFormSubmit} className="flex items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white">
              <input
                type="text"
                placeholder={getPlaceholderText()}
                value={newFormName}
                onChange={e => setNewFormName(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-primary focus:outline-none bg-white text-slate-800 w-full max-w-xs"
                autoFocus
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingForm(false); setNewFormName(''); }}
                className="px-3 py-2 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button 
              type="button"
              onClick={() => {
                setIsAddingForm(true);
                setNewFormName(getDefaultNextLevelName());
              }} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-600 hover:border-primary hover:text-primary transition-colors cursor-pointer font-medium pt-2 w-full justify-center sm:justify-start"
            >
              <Plus size={15} /> Add Another {getTermSingular()}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FormsStreamsStep;
