import React from 'react';

const ExamSetupStep = ({ data = { count: '3', names: ['Opening Exam', 'Mid-Term Exam', 'Closing Exam'] }, updateData }) => {
  const count = data.count || '3';
  const names = data.names || ['Opening Exam', 'Mid-Term Exam', 'Closing Exam'];

  const handleCount = (n) => {
    let newNames = [];
    if (n === '1') newNames = ['Main Exam'];
    if (n === '2') newNames = ['Mid-Term Exam', 'Closing Exam'];
    if (n === '3') newNames = ['Opening Exam', 'Mid-Term Exam', 'Closing Exam'];
    if (n === 'Custom') newNames = names.length > 0 ? names : ['Opening Exam', 'Mid-Term Exam', 'Closing Exam'];
    
    updateData({ count: n, names: newNames });
  };

  const handleNameChange = (index, val) => {
    const updated = [...names];
    updated[index] = val;
    updateData({ ...data, names: updated });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-heading text-navy">Exam Setup</h2>
      <p className="text-sm text-slate-500">How many examinations does your school conduct per term?</p>
      
      <div className="grid grid-cols-4 gap-2 pt-2">
        {['1', '2', '3', 'Custom'].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => handleCount(n)}
            className={`py-3 rounded-xl text-sm font-semibold font-heading border-2 transition-all cursor-pointer ${
              count === n
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-slate-200 text-slate-600 hover:border-primary'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        <p className="text-xs font-semibold text-slate-500">Examination Names</p>
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-4 font-mono">{i + 1}.</span>
            <input
              value={name}
              onChange={e => handleNameChange(i, e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamSetupStep;
