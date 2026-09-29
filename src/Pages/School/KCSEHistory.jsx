import { useState, useEffect } from 'react';
import { Plus, GraduationCap, Loader2, X, AlertCircle, TrendingUp } from 'lucide-react';
import BackButton from '../../Components/Common/BackButton';
import { useSchoolContext } from '../../Context/SchoolContext';
import { assessmentService } from '../../services/assessmentService';

const pointsToGrade = (pts) => {
  const p = parseFloat(pts);
  if (isNaN(p) || p <= 0) return 'E';
  if (p >= 11.5) return 'A';
  if (p >= 10.5) return 'A-';
  if (p >= 9.5) return 'B+';
  if (p >= 8.5) return 'B';
  if (p >= 7.5) return 'B-';
  if (p >= 6.5) return 'C+';
  if (p >= 5.5) return 'C';
  if (p >= 4.5) return 'C-';
  if (p >= 3.5) return 'D+';
  if (p >= 2.5) return 'D';
  if (p >= 1.5) return 'D-';
  return 'E';
};

export default function KCSEHistory() {
  const { school } = useSchoolContext();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [kcseRecords, setKcseRecords] = useState([]);

  // Controlled form state
  const [formData, setFormData] = useState({
    year: new Date().getFullYear() - 1,
    total_candidates: '',
    mean_points: '',
    mean_grade: '',
    grade_a_count: 0,
    grade_a_minus_count: 0,
    grade_b_plus_count: 0,
    grade_b_count: 0,
    grade_b_minus_count: 0,
    grade_c_plus_count: 0,
    grade_c_count: 0,
    grade_c_minus_count: 0,
    grade_d_plus_count: 0,
    grade_d_count: 0,
    grade_d_minus_count: 0,
    grade_e_count: 0,
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await assessmentService.getKCSEResults();
      const list = Array.isArray(res) ? res : res?.results || [];
      setKcseRecords(list);
    } catch (err) {
      console.error('Failed to load KCSE history:', err);
      setError('Unable to load KCSE historical records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handlePointsChange = (e) => {
    const pts = e.target.value;
    setFormData((prev) => ({
      ...prev,
      mean_points: pts,
      mean_grade: pts ? pointsToGrade(pts) : prev.mean_grade,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.year || !formData.total_candidates || !formData.mean_points) {
      setModalError('Year, Total Candidates, and Mean Points are required.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);
      await assessmentService.createKCSEResult({
        school: school?.id || null,
        year: parseInt(formData.year, 10),
        total_candidates: parseInt(formData.total_candidates, 10),
        mean_points: parseFloat(formData.mean_points),
        mean_grade: formData.mean_grade || pointsToGrade(formData.mean_points),
        grade_a_count: parseInt(formData.grade_a_count, 10) || 0,
        grade_a_minus_count: parseInt(formData.grade_a_minus_count, 10) || 0,
        grade_b_plus_count: parseInt(formData.grade_b_plus_count, 10) || 0,
        grade_b_count: parseInt(formData.grade_b_count, 10) || 0,
        grade_b_minus_count: parseInt(formData.grade_b_minus_count, 10) || 0,
        grade_c_plus_count: parseInt(formData.grade_c_plus_count, 10) || 0,
        grade_c_count: parseInt(formData.grade_c_count, 10) || 0,
        grade_c_minus_count: parseInt(formData.grade_c_minus_count, 10) || 0,
        grade_d_plus_count: parseInt(formData.grade_d_plus_count, 10) || 0,
        grade_d_count: parseInt(formData.grade_d_count, 10) || 0,
        grade_d_minus_count: parseInt(formData.grade_d_minus_count, 10) || 0,
        grade_e_count: parseInt(formData.grade_e_count, 10) || 0,
      });

      setShowModal(false);
      setFormData({
        year: new Date().getFullYear() - 1,
        total_candidates: '',
        mean_points: '',
        mean_grade: '',
        grade_a_count: 0,
        grade_a_minus_count: 0,
        grade_b_plus_count: 0,
        grade_b_count: 0,
        grade_b_minus_count: 0,
        grade_c_plus_count: 0,
        grade_c_count: 0,
        grade_c_minus_count: 0,
        grade_d_plus_count: 0,
        grade_d_count: 0,
        grade_d_minus_count: 0,
        grade_e_count: 0,
      });
      await fetchRecords();
    } catch (err) {
      console.error('Failed to save KCSE results:', err);
      const detail =
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Failed to save KCSE results.';
      setModalError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  // Sort chronologically for chart (oldest to newest)
  const chartRecords = [...kcseRecords].sort((a, b) => (a.year || 0) - (b.year || 0)).slice(-5);
  // Sort reverse chronologically for table (newest to oldest)
  const tableRecords = [...kcseRecords].sort((a, b) => (b.year || 0) - (a.year || 0));

  return (
    <div className="space-y-6 min-h-screen pb-10 max-w-7xl mx-auto font-sans">
      <header className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="mb-2">
            <BackButton to="/school/performance" label="Back to Performance Hub" />
          </div>
          <h1 className="text-2xl font-black font-heading text-navy">KCSE History</h1>
          <p className="text-slate-500 font-medium text-xs mt-0.5">
            Final Exam Performance Trends • {school?.name || 'School'}
          </p>
        </div>
        <button
          onClick={() => {
            setModalError(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Results
        </button>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
          Loading KCSE historical records...
        </div>
      ) : kcseRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-xs">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-heading font-bold text-navy text-base">No KCSE Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You haven't recorded any national examination results yet. Add results to track performance trends and grade distributions over time.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add First KCSE Result
          </button>
        </div>
      ) : (
        <>
          {/* Vertical bar chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold font-heading text-navy text-base mb-6">
              Mean Score Trend ({chartRecords.length} Most Recent Years)
            </h3>
            <div className="h-64 flex items-end gap-6 sm:gap-10 pb-8 border-b border-slate-100">
              {chartRecords.map((item, idx) => {
                const score = parseFloat(item.mean_points || 0);
                const isLatest = idx === chartRecords.length - 1;
                return (
                  <div key={item.id || item.year} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="font-bold text-xs text-slate-600 group-hover:text-navy transition-colors">
                      {score.toFixed(2)} pts ({item.mean_grade || pointsToGrade(score)})
                    </span>
                    <div
                      className={`w-14 sm:w-20 rounded-t-xl transition-all ${
                        isLatest ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                      style={{ height: `${Math.min((score / 12) * 100, 100)}%` }}
                    ></div>
                    <span className={`font-bold text-xs mt-1 ${isLatest ? 'text-primary' : 'text-slate-500'}`}>
                      {item.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Candidate & grade breakdown table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold font-heading text-navy text-base">Grade Breakdown</h3>
              <span className="text-xs text-slate-400">{tableRecords.length} examination years</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Year</th>
                    <th className="p-4">Candidates</th>
                    <th className="p-4">Mean Grade</th>
                    <th className="p-4">Mean Pts</th>
                    <th className="p-3">A</th>
                    <th className="p-3">A-</th>
                    <th className="p-3">B+</th>
                    <th className="p-3">B</th>
                    <th className="p-3">B-</th>
                    <th className="p-3">C+</th>
                    <th className="p-3">C</th>
                    <th className="p-3">C-</th>
                    <th className="p-3">D+</th>
                    <th className="p-3">D</th>
                    <th className="p-3">D-</th>
                    <th className="p-3">E</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableRecords.map((item, idx) => (
                    <tr key={item.id || item.year} className={idx === 0 ? 'bg-primary/5 font-semibold' : 'hover:bg-slate-50'}>
                      <td className="p-4 font-bold text-navy">{item.year}</td>
                      <td className="p-4">{item.total_candidates}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-primary/10 text-primary">
                          {item.mean_grade || pointsToGrade(item.mean_points)}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-navy">{parseFloat(item.mean_points || 0).toFixed(2)}</td>
                      <td className="p-3 text-slate-600">{item.grade_a_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_a_minus_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_b_plus_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_b_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_b_minus_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_c_plus_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_c_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_c_minus_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_d_plus_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_d_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_d_minus_count || 0}</td>
                      <td className="p-3 text-slate-600">{item.grade_e_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-slate-100 my-8">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-navy text-lg">Add KCSE Results</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-navy cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="m-5 mb-0 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Examination Year</label>
                  <input
                    type="number"
                    min="1990"
                    max="2030"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Total Candidates</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.total_candidates}
                      onChange={(e) => setFormData({ ...formData, total_candidates: e.target.value })}
                      placeholder="e.g. 140"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Mean Points (1 - 12)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="12"
                      value={formData.mean_points}
                      onChange={handlePointsChange}
                      placeholder="e.g. 7.82"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mean Grade</label>
                  <input
                    type="text"
                    value={formData.mean_grade}
                    onChange={(e) => setFormData({ ...formData, mean_grade: e.target.value.toUpperCase() })}
                    placeholder="e.g. C+"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none font-bold"
                  />
                </div>

                {/* Grade Counts Overview */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="font-bold text-slate-700 uppercase mb-2">Grade Counts (Optional)</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['a', 'a_minus', 'b_plus', 'b', 'b_minus', 'c_plus', 'c', 'c_minus', 'd_plus', 'd', 'd_minus', 'e'].map((key) => {
                      const label = key.replace('_minus', '-').replace('_plus', '+').toUpperCase();
                      const field = `grade_${key}_count`;
                      return (
                        <div key={key}>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{label}</label>
                          <input
                            type="number"
                            min="0"
                            value={formData[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:border-primary focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'Saving...' : 'Save Results'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

