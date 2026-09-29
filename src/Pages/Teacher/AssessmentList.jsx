import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { ClipboardList, Plus, Calendar, Award, Loader2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import BackButton from '../../Components/Common/BackButton';
import { assessmentService } from '../../services/assessmentService';

export default function AssessmentList() {
  const location = useLocation();
  const isSchool = location.pathname.startsWith('/school');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examinations, setExaminations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'open' | 'closed' | 'published'

  useEffect(() => {
    let isMounted = true;
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await assessmentService.getExaminations();
        const list = Array.isArray(res) ? res : res?.results || [];
        if (isMounted) {
          setExaminations(list);
        }
      } catch (err) {
        console.error('Failed to load examinations:', err);
        if (isMounted) {
          setError('Unable to load examinations list.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'completed':
        return 'bg-success-light text-success';
      case 'open':
      case 'active':
        return 'bg-primary-light text-primary';
      case 'closed':
        return 'bg-amber-100 text-amber-800';
      case 'draft':
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredExams = examinations.filter((exam) => {
    if (filterStatus === 'all') return true;
    return exam.status?.toLowerCase() === filterStatus;
  });

  const backUrl = isSchool ? '/school/dashboard' : '/teacher/dashboard';
  const entryBasePath = isSchool ? '/school/assessments/new' : '/teacher/assessments';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="space-y-3">
        <BackButton to={backUrl} label="Back to Dashboard" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-black font-heading text-navy">Examinations & Assessments</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled term exams, mark entry sessions, and published report cards
            </p>
          </div>
          <Link
            to={isSchool ? '/school/assessments/new' : '/teacher/assessments'}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Enter Marks
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {['all', 'open', 'closed', 'published'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`pb-3 px-4 font-black text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              filterStatus === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            {tab === 'all' ? 'All Exams' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
          Loading examinations...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-xs">
          <ClipboardList className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-heading font-bold text-navy text-base">No Examinations Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {filterStatus === 'all'
              ? 'No examinations have been created for this academic calendar yet.'
              : `No examinations currently have the status "${filterStatus}".`}
          </p>
          <Link
            to={isSchool ? '/school/assessments/new' : '/teacher/assessments'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Start Mark Entry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((assessment) => {
            const entryUrl = `/teacher/assessments/${assessment.id}/entry`;
            return (
              <div
                key={assessment.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-primary/50 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="w-9 h-9 rounded-xl bg-navy/5 text-navy font-black text-xs flex items-center justify-center shrink-0">
                      T{assessment.term || 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(assessment.status)}`}>
                      {assessment.status || 'open'}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-navy text-base group-hover:text-primary transition-colors">
                    {assessment.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Term {assessment.term || 1} · Max Score: {assessment.max_score || 100}</span>
                  </div>
                  {assessment.date && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Date: {new Date(assessment.date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={entryUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                  >
                    <span>{assessment.status === 'published' ? 'View Results' : 'Mark Entry'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
