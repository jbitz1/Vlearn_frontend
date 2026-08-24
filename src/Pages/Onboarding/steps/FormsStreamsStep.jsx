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
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forms.map((form) => (
              <div key={form} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-navy font-heading">{form}</span>
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
                      className="text-xs text-primary font-bold hover:underline cursor-pointer"
                    >
                      + Add Stream
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-center min-h-[36px]">
                  {(streams[form] || []).map((st) => (
                    <span 
                      key={st}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-navy shadow-2xs"
                    >
                      {st}
                      <button
                        type="button"
                        onClick={() => handleRemoveStream(form, st)}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove stream"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  {addingStreamTo === form && (
                    <form onSubmit={(e) => handleAddStreamSubmit(e, form)} className="inline-flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. North"
                        value={newStreamName}
                        onChange={e => setNewStreamName(e.target.value)}
                        className="w-28 px-2.5 py-1 text-xs font-semibold rounded-lg border border-primary focus:outline-none bg-white text-slate-800"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingStreamTo(null); setNewStreamName(''); }}
                        className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>

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
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-xs text-slate-600 hover:border-primary hover:text-primary transition-colors cursor-pointer font-bold w-full justify-center sm:justify-start"
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
