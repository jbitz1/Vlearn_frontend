import React, { useState } from 'react';
import { MessageSquare, X, CheckCircle, AlertTriangle, Loader2, Send } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../config/apiClient';
import BASE_URL from '../../config';

export default function TeacherFeedbackModal({
  isOpen,
  onClose,
  topicName,
  subjectName,
  formName,
  topicId,
  contextData = {},
}) {
  const tName = topicName || contextData.topic_name || 'Topic';
  const sName = subjectName || contextData.subject_name || '';
  const fName = formName || contextData.stream_name || '';
  const tId = topicId || contextData.topic_id || null;

  const [feedbackCategory, setFeedbackCategory] = useState('clarity');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setError('Please provide your feedback or suggestion.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      visualization_title: `${sName ? sName + ' - ' : ''}${tName}${fName ? ' (' + fName + ')' : ''}`.trim(),
      visualization_type: 'teacher_feedback',
      issue_type: 'teacher_feedback',
      description: `[Category: ${feedbackCategory}] ${feedbackText.trim()}`,
    };

    try {
      await apiClient.post('/api/curriculum/visualization-issues/', payload);

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedbackText('');
        onClose();
      }, 1600);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403 || !err.response) {
        try {
          await axios.post(`${BASE_URL}/api/curriculum/visualization-issues/`, payload, {
            headers: { 'Content-Type': 'application/json' }
          });
          setIsSubmitted(true);
          setTimeout(() => {
            setIsSubmitted(false);
            setFeedbackText('');
            onClose();
          }, 1600);
          return;
        } catch (fallbackErr) {
          setError(fallbackErr.response?.data?.detail || 'Failed to submit feedback. Please try again.');
          return;
        }
      }
      setError(err.response?.data?.detail || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Direct Teacher Feedback</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{topicName} • {formName}</p>
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
            <h4 className="text-sm font-bold text-gray-900">Feedback Received!</h4>
            <p className="text-xs text-gray-500">Thank you for helping us improve classroom content.</p>
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
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Feedback Focus
              </label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="clarity">Concept Clarity / Student Understanding</option>
                <option value="pacing">Lesson Pacing & Time Estimate</option>
                <option value="missing_visual">Need additional diagram / simulation</option>
                <option value="curriculum_fit">KCSE Syllabus Alignment</option>
                <option value="other">General Teacher Suggestion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Your Observations & Suggestions *
              </label>
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your classroom experience, what concepts students found tricky, or specific content changes..."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none placeholder:text-gray-400"
                required
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
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
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
