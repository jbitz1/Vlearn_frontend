import React, { useState } from 'react';
import { Flag, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../config/apiClient';
import BASE_URL from '../../config';

const PRESET_ISSUES = [
  { id: 'youtube_unavailable', label: 'YouTube video does not exist or is unavailable' },
  { id: 'simulation_broken', label: 'Simulation is not launching / shows blank screen' },
  { id: 'controls_broken', label: 'Interactive controls, buttons, or sliders not responding' },
  { id: 'content_error', label: 'Incorrect scientific content, formula, or diagram' },
  { id: 'other', label: 'Other issue or improvement suggestion' }
];

export default function ReportVisualizationModal({
  isOpen,
  onClose,
  visualizationTitle,
  visualizationType,
  lessonId,
  lessonBlockId,
  visual,
}) {
  const title = visualizationTitle || visual?.title || 'Untitled Visual';
  const type = visualizationType || visual?.type || 'simulation';
  const lId = lessonId || visual?.lessonId || visual?.lesson_id || null;
  const bId = lessonBlockId || visual?.lessonBlockId || visual?.block_id || null;

  const [selectedIssue, setSelectedIssue] = useState('youtube_unavailable');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      visualization_title: title,
      visualization_type: type,
      issue_type: selectedIssue,
      description: notes.trim(),
      lesson: lId,
      lesson_block: bId
    };

    try {
      await apiClient.post('/api/curriculum/visualization-issues/', payload);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403 || !err.response) {
        try {
          await axios.post(`${BASE_URL}/api/curriculum/visualization-issues/`, payload, {
            headers: { 'Content-Type': 'application/json' }
          });
          setIsSubmitted(true);
          setTimeout(() => {
            setIsSubmitted(false);
            onClose();
          }, 1500);
          return;
        } catch (fallbackErr) {
          setError(fallbackErr.response?.data?.detail || 'Failed to submit report. Please try again.');
          return;
        }
      }
      setError(err.response?.data?.detail || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Report Visualization Issue</h3>
              <p className="text-xs text-gray-500 truncate max-w-[240px]">{visualizationTitle || 'Content issue'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-gray-900">Issue Reported</h4>
            <p className="text-xs text-gray-500">Thank you! Our academic team will review this shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                What seems to be the problem?
              </label>
              <div className="space-y-2">
                {PRESET_ISSUES.map((issue) => (
                  <label
                    key={issue.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      selectedIssue === issue.id
                        ? 'border-red-400 bg-red-50/40 text-gray-900 font-semibold shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      value={issue.id}
                      checked={selectedIssue === issue.id}
                      onChange={() => setSelectedIssue(issue.id)}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <span>{issue.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Additional details (optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific slide, timestamp, or browser details..."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none placeholder:text-gray-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
