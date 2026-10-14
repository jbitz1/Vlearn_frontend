import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MD } from './BlueprintComponents';

/**
 * Official Marked Examination Script Report
 * Provides Kenyan national exam (KNEC KCSE / CBC) result breakdown,
 * Chief Examiner evaluation verdict, and question-by-question commentary.
 */
export const ExamScriptReport = ({
  examResults,
  lesson,
  onRetake,
  onExit,
}) => {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'needs_work' | 'correct'
  const [expandedDetails, setExpandedDetails] = useState({});

  if (!examResults) return null;

  const framework = examResults.assessment_framework || 'kcse';
  const isCBC = framework === 'cbc';
  const pct = examResults.percentage ?? 0;
  const grade = examResults.grade || (pct >= 80 ? 'A' : 'B');
  const totalAwarded = examResults.total_marks_awarded ?? 0;
  const totalMax = examResults.total_max_marks ?? 0;

  // Build a lookup for block metadata (diagrams, scenarios, competency)
  const blockMap = new Map();
  (lesson?.blocks || []).forEach((b) => {
    if (b && b.id) blockMap.set(b.id, b);
  });

  const questions = examResults.questions || [];
  const correctCount = questions.filter((q) => q.is_correct).length;
  const partialOrIncorrectCount = questions.length - correctCount;

  const filteredQuestions = questions.filter((q) => {
    if (filterMode === 'correct') return q.is_correct;
    if (filterMode === 'needs_work') return !q.is_correct;
    return true;
  });

  const toggleExpand = (idx) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Grade badge color styling
  let gradeBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let gradeTitle = isCBC ? 'Performance Level' : 'KNEC Mean Grade';
  if (pct < 50) {
    gradeBadgeColor = 'bg-rose-50 text-rose-800 border-rose-300';
  } else if (pct < 70) {
    gradeBadgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 sm:py-12 font-sans space-y-8 animate-fade-in">
      {/* ── Top Header Navigation ────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-custom-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isCBC ? 'CBC Assessment (KJSEA) • Official Marked Script' : 'KNEC KCSE Examination • Official Marked Script'}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
            {examResults.title || lesson?.title || 'Examination Result'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {onRetake && (
            <button
              type="button"
              onClick={onRetake}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
              Retake Examination
            </button>
          )}
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-custom-blue rounded-xl hover:bg-blue-700 transition cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Review
            </button>
          )}
        </div>
      </div>

      {/* ── Score & Grade Summary Hero Card ──────────────────────────── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Total Marks */}
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-5 md:pb-0 md:pr-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-custom-blue shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900">
                  {totalAwarded}
                </span>
                <span className="text-lg font-bold text-gray-400">
                  / {totalMax} Marks
                </span>
              </div>
              <p className="text-xs font-semibold text-custom-blue mt-0.5">
                {pct}% Accuracy
              </p>
            </div>
          </div>

          {/* Performance Level / Grade */}
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-5 md:pb-0 md:pr-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{gradeTitle}</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-xl text-base sm:text-lg font-black border ${gradeBadgeColor}`}>
                {grade}
              </span>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {isCBC ? 'KICD Rubric Evaluation' : 'KNEC KCSE Standard Scale'}
              </p>
            </div>
          </div>

          {/* Question Stats */}
          <div className="flex flex-col justify-center space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paper Completion</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{correctCount} Full Marks</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>{partialOrIncorrectCount} Needs Review</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-custom-blue h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Official Chief Examiner Verdict Commentary ──────────────── */}
      {examResults.examiner_verdict && (
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-200/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-custom-blue text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-custom-blue">
                  Official Chief Examiner Evaluation Verdict
                </h3>
                <span className="text-[10px] font-bold text-gray-500 bg-white/80 border border-gray-200 px-2 py-0.5 rounded-full">
                  Standardized KNEC / CBC Rubric
                </span>
              </div>
              <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-sans">
                {examResults.examiner_verdict}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Priority Revision Concepts ───────────────────────────────── */}
      {examResults.revision_priorities && examResults.revision_priorities.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg mb-3">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <span>Priority Revision Areas Identified by Examiner</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 mb-4 leading-relaxed">
            Based on lost marks and omitted scientific terminology in your submitted answers, revisit these syllabus concepts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {examResults.revision_priorities.map((sub, i) => (
              <div
                key={i}
                className="bg-white/90 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{sub}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Review textbook notes & past questions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Question Breakdown Header & Filter Tabs ─────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200/70 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Marked Examination Script Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Review your written submissions, official model answers, and examiner mark allocations.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('needs_work')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                filterMode === 'needs_work'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Needs Work ({partialOrIncorrectCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                filterMode === 'correct'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Full Marks ({correctCount})
            </button>
          </div>
        </div>

        {/* ── Detailed Question Cards ─────────────────────────────────── */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const block = blockMap.get(q.block_id);
            const content = block && typeof block.content === 'object' ? block.content : {};
            const questionPrompt = content.question || content.content || block?.title || q.question_title;
            const scenarioStimulus = content.scenario_stimulus || '';
            const diagramSvg = content.diagram_svg || '';
            const diagramCaption = content.diagram_caption || '';
            const competency = content.competency_tested || '';

            const isFullMarks = q.marks_awarded === q.max_marks;
            const isZeroMarks = q.marks_awarded === 0;

            let markBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            if (isFullMarks) {
              markBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            } else if (isZeroMarks) {
              markBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
            }

            const isDetailsOpen = expandedDetails[idx] ?? true;

            return (
              <div
                key={q.block_id || idx}
                className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-gray-900">
                      {q.question_title || `Question ${idx + 1}`}
                    </span>
                    {competency && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        Competency: {competency}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-gray-400 capitalize bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-200">
                      {(q.check_type || 'question').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${markBadgeClass}`}>
                    {q.marks_awarded} / {q.max_marks} {q.max_marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>

                {/* Scenario Stimulus if present */}
                {scenarioStimulus && (
                  <div className="p-4 bg-gradient-to-r from-cyan-50/70 to-blue-50/70 border border-cyan-200/80 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-800 mb-1.5">
                      <Globe className="w-3.5 h-3.5 text-custom-blue" />
                      <span>Situational Stimulus Scenario</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                      {scenarioStimulus}
                    </p>
                  </div>
                )}

                {/* Diagram SVG if present */}
                {diagramSvg && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                    <div
                      className="w-full max-w-md overflow-x-auto flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
                      dangerouslySetInnerHTML={{ __html: diagramSvg }}
                    />
                    {diagramCaption && (
                      <p className="text-xs font-semibold text-gray-600 mt-2 text-center">
                        {diagramCaption}
                      </p>
                    )}
                  </div>
                )}

                {/* Question Prompt */}
                <MD className="text-gray-900 font-bold text-base sm:text-lg leading-snug">
                  {questionPrompt}
                </MD>

                {/* Student's Submitted Answer */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Student's Submitted Answer:
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm sm:text-base font-mono text-gray-800 whitespace-pre-wrap">
                    {q.student_answer ? q.student_answer : (
                      <span className="text-gray-400 italic font-sans">(Question was not attempted)</span>
                    )}
                  </div>
                </div>

                {/* Expandable Examiner Marking Scheme & Commentary */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-700 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-custom-blue" />
                      Official Marking Scheme & Examiner Evaluation
                    </span>
                    {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isDetailsOpen && (
                    <div className="p-4 sm:p-5 bg-white space-y-4 text-xs sm:text-sm">
                      {/* Model Answer / Scheme */}
                      <div>
                        <p className="font-bold text-custom-blue uppercase tracking-wider text-[11px] mb-1">
                          Official Model Answer / Key Marking Points:
                        </p>
                        <p className="text-gray-900 font-semibold bg-blue-50/50 p-3 rounded-xl border border-blue-100 leading-relaxed">
                          {q.model_answer || q.correct_answer || 'Refer to curriculum guidelines.'}
                        </p>
                      </div>

                      {/* Examiner Feedback */}
                      {q.feedback && (
                        <div>
                          <p className="font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                            Chief Examiner Specific Commentary:
                          </p>
                          <p className="text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                            {q.feedback}
                          </p>
                        </div>
                      )}

                      {/* Points Earned & Points Missed Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {q.points_earned && q.points_earned.length > 0 && (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                            <p className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 mb-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Points Awarded:
                            </p>
                            <ul className="space-y-1 text-xs text-emerald-800 list-disc pl-4">
                              {q.points_earned.map((pt, pIdx) => (
                                <li key={pIdx}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {q.points_missed && q.points_missed.length > 0 && (
                          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                            <p className="font-bold text-rose-900 text-xs flex items-center gap-1.5 mb-1.5">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Marks Deducted / Omitted Points:
                            </p>
                            <ul className="space-y-1 text-xs text-rose-800 list-disc pl-4">
                              {q.points_missed.map((pt, pIdx) => (
                                <li key={pIdx}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Subtopic Reference */}
                      {q.subtopic_to_review && (
                        <div className="pt-1 flex items-center gap-2 text-xs text-gray-600">
                          <BookOpen className="w-3.5 h-3.5 text-custom-blue shrink-0" />
                          <span>
                            Syllabus Reference:{' '}
                            <span className="font-bold text-gray-800">{q.subtopic_to_review}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Actions ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Learning Dashboard
        </button>

        {onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-custom-blue rounded-2xl hover:bg-blue-700 transition cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Re-take Full Examination Paper
          </button>
        )}
      </div>
    </div>
  );
};
