import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    Target, FileText, Lightbulb, HelpCircle, Star,
    AlertCircle, Info, Zap, Globe, Edit3, Eye,
    ChevronDown, ChevronUp
} from 'lucide-react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// ──────────────────────────────────────────────────────────
// Shared text editor: split markdown/preview pane
// ──────────────────────────────────────────────────────────
function MarkdownEditor({ value, onChange, onBlur, placeholder, minHeight = 200 }) {
    const [tab, setTab] = useState('write'); // 'write' | 'preview'

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                    onClick={() => setTab('write')}
                    className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        tab === 'write'
                            ? 'text-custom-blue border-b-2 border-custom-blue bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Edit3 size={12} /> Write
                </button>
                <button
                    onClick={() => setTab('preview')}
                    className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        tab === 'preview'
                            ? 'text-custom-blue border-b-2 border-custom-blue bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Eye size={12} /> Preview
                </button>
                <span className="ml-auto px-3 py-2 text-xs text-gray-400">Markdown supported</span>
            </div>
            {tab === 'write' ? (
                <textarea
                    className="w-full p-4 text-sm text-gray-700 bg-white resize-none outline-none font-mono leading-relaxed"
                    style={{ minHeight }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    placeholder={placeholder}
                />
            ) : (
                <div
                    className="p-4 prose prose-sm max-w-none text-gray-700 min-h-[100px]"
                    style={{ minHeight }}
                >
                    {value ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
                        >
                            {value}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-gray-400 italic">Nothing to preview yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// Helper to extract text from a block's content field
// (which may be a JSON object, a JSON string, or plain text)
// ──────────────────────────────────────────────────────────
export function extractText(content) {
    if (!content) return '';
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return parsed.text || parsed.content || parsed.procedure || '';
        } catch {
            return content;
        }
    }
    if (typeof content === 'object') {
        return content.text || content.content || content.procedure || '';
    }
    return String(content);
}

// ──────────────────────────────────────────────────────────
// EDITOR: Learning Goal / Objectives
// ──────────────────────────────────────────────────────────
export function GoalEditor({ block, onChange, onSave }) {
    const text = extractText(block.content);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-emerald-100">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Target size={16} className="text-emerald-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Learning Goal</p>
                    <p className="text-xs text-gray-500">Define what students will understand after this concept.</p>
                </div>
            </div>
            <MarkdownEditor
                value={text}
                onChange={(val) => onChange({ ...block, content: { text: val } })}
                onBlur={() => onSave(block)}
                placeholder="By the end of this concept, students will be able to..."
                minHeight={120}
            />
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Concept Explanation / Core Text
// ──────────────────────────────────────────────────────────
export function ExplanationEditor({ block, onChange, onSave }) {
    const text = extractText(block.content);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-indigo-100">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText size={16} className="text-indigo-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Concept Explanation</p>
                    <p className="text-xs text-gray-500">Write the core concept clearly and concisely.</p>
                </div>
            </div>
            <MarkdownEditor
                value={text}
                onChange={(val) => onChange({ ...block, content: { ...parseContent(block.content), text: val } })}
                onBlur={() => onSave(block)}
                placeholder="Explain the concept here. Use headings, bullet points, and bold for key terms..."
                minHeight={280}
            />
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Worked Example
// ──────────────────────────────────────────────────────────
export function WorkedExampleEditor({ block, onChange, onSave }) {
    const content = parseContent(block.content);
    const problem = content.problem || content.text || '';
    const solution = content.solution || '';
    const insight = content.key_insight || '';

    const update = (patch) => {
        const updated = { ...block, content: { ...content, ...patch } };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
                <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Lightbulb size={16} className="text-amber-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Worked Example</p>
                    <p className="text-xs text-gray-500">Show students how to apply this concept step-by-step.</p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Problem Statement</label>
                <MarkdownEditor
                    value={problem}
                    onChange={(val) => onChange({ ...block, content: { ...content, problem: val } })}
                    onBlur={() => update({ problem })}
                    placeholder="Describe the problem students need to solve..."
                    minHeight={100}
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Step-by-Step Solution</label>
                <MarkdownEditor
                    value={solution}
                    onChange={(val) => onChange({ ...block, content: { ...content, solution: val } })}
                    onBlur={() => update({ solution })}
                    placeholder="Walk through the solution step by step..."
                    minHeight={160}
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Key Insight</label>
                <textarea
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none outline-none focus:border-amber-400"
                    rows={2}
                    value={insight}
                    onChange={(e) => onChange({ ...block, content: { ...content, key_insight: e.target.value } })}
                    onBlur={() => update({ key_insight: insight })}
                    placeholder="What is the most important takeaway?"
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Knowledge Check
// ──────────────────────────────────────────────────────────
export function KnowledgeCheckEditor({ block, onChange, onSave }) {
    const content = parseContent(block.content);
    const checkType = content.check_type || 'short_answer';
    const question = content.question || content.text || '';
    const answer = content.answer || content.expected_answer || '';
    const hint = content.hint || '';
    const options = content.options || ['', '', '', ''];

    const update = (patch) => {
        const updated = { ...block, content: { ...content, ...patch } };
        onChange(updated);
        onSave(updated);
    };

    const handleOptionChange = (idx, val) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        onChange({ ...block, content: { ...content, options: newOpts } });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-violet-100">
                <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <HelpCircle size={16} className="text-violet-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Knowledge Check</p>
                    <p className="text-xs text-gray-500">A question to test student understanding.</p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Question Type</label>
                <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400 bg-white"
                    value={checkType}
                    onChange={(e) => update({ check_type: e.target.value })}
                >
                    <option value="short_answer">Short Answer</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Question</label>
                <textarea
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none outline-none focus:border-violet-400"
                    rows={3}
                    value={question}
                    onChange={(e) => onChange({ ...block, content: { ...content, question: e.target.value } })}
                    onBlur={() => update({ question })}
                    placeholder="What question will test students on this concept?"
                />
            </div>

            {checkType === 'multiple_choice' && (
                <div className="space-y-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Options & Correct Answer</label>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-600">Correct:</span>
                        <select
                            className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 outline-none focus:border-violet-400 bg-white"
                            value={answer || 'A'}
                            onChange={(e) => update({ answer: e.target.value })}
                        >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-500 w-6">{String.fromCharCode(65 + idx)}.</span>
                            <input
                                type="text"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400"
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                onBlur={() => update({ options })}
                                placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                            />
                        </div>
                    ))}
                </div>
            )}

            {checkType === 'true_false' && (
                <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <label className="text-xs font-semibold text-gray-600">Correct Answer:</label>
                    <select
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400 bg-white"
                        value={answer === true ? 'true' : answer === false ? 'false' : 'true'}
                        onChange={(e) => update({ answer: e.target.value === 'true' })}
                    >
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
            )}

            {checkType === 'short_answer' && (
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Suggested Answer / Explanation</label>
                    <MarkdownEditor
                        value={typeof answer === 'string' ? answer : ''}
                        onChange={(val) => onChange({ ...block, content: { ...content, answer: val } })}
                        onBlur={() => update({ answer })}
                        placeholder="The correct answer / model answer..."
                        minHeight={100}
                    />
                </div>
            )}

            {checkType !== 'short_answer' && (
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Explanation (Shown after answering)</label>
                    <MarkdownEditor
                        value={content.explanation || ''}
                        onChange={(val) => onChange({ ...block, content: { ...content, explanation: val } })}
                        onBlur={() => update({ explanation: content.explanation })}
                        placeholder="Explain why this answer is correct..."
                        minHeight={80}
                    />
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hint (optional)</label>
                <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400"
                    value={hint}
                    onChange={(e) => onChange({ ...block, content: { ...content, hint: e.target.value } })}
                    onBlur={() => update({ hint })}
                    placeholder="A hint to help students who are stuck..."
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Callout (Tip / Warning / Note)
// ──────────────────────────────────────────────────────────
const CALLOUT_TYPES = [
    { value: 'tip',     label: 'Tip',     icon: Lightbulb, color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-300' },
    { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-300' },
    { value: 'note',    label: 'Note',    icon: Info,       color: 'text-blue-700',  bg: 'bg-blue-50',   border: 'border-blue-300' },
];

export function CalloutEditor({ block, onChange, onSave }) {
    const content = parseContent(block.content);
    const calloutType = content.callout_type || 'note';
    const text = content.text || '';
    const meta = CALLOUT_TYPES.find((c) => c.value === calloutType) || CALLOUT_TYPES[2];
    const Icon = meta.icon;

    const update = (patch) => {
        const updated = { ...block, content: { ...content, ...patch } };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-yellow-100">
                <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <AlertCircle size={16} className="text-yellow-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Callout</p>
                    <p className="text-xs text-gray-500">Highlight an important point for students.</p>
                </div>
            </div>

            <div className="flex gap-2">
                {CALLOUT_TYPES.map((ct) => (
                    <button
                        key={ct.value}
                        onClick={() => update({ callout_type: ct.value })}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                            calloutType === ct.value
                                ? `${ct.bg} ${ct.border} ${ct.color}`
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                        {ct.label}
                    </button>
                ))}
            </div>

            <div className={`rounded-lg border-l-4 p-4 ${meta.bg} ${meta.border.replace('border', 'border-l')}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className={meta.color} />
                    <span className={`text-xs font-bold uppercase ${meta.color}`}>{meta.label}</span>
                </div>
                <MarkdownEditor
                    value={text}
                    onChange={(val) => onChange({ ...block, content: { ...content, text: val } })}
                    onBlur={() => update({ text })}
                    placeholder="Write the callout content..."
                    minHeight={80}
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Summary
// ──────────────────────────────────────────────────────────
export function SummaryEditor({ block, onChange, onSave }) {
    const text = extractText(block.content);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-teal-100">
                <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Star size={16} className="text-teal-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">Summary</p>
                    <p className="text-xs text-gray-500">Reinforce the key points students should remember.</p>
                </div>
            </div>
            <MarkdownEditor
                value={text}
                onChange={(val) => onChange({ ...block, content: { text: val } })}
                onBlur={() => onSave(block)}
                placeholder="Summarise the key points:\n\n- Key point 1\n- Key point 2\n- Key point 3"
                minHeight={160}
            />
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Real World Example
// ──────────────────────────────────────────────────────────
export function RealWorldExampleEditor({ block, onChange, onSave }) {
    const content = parseContent(block.content);
    const scenario = content.scenario || content.text || '';
    const connection = content.connection || '';

    const update = (patch) => {
        const updated = { ...block, content: { ...content, ...patch } };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-green-100">
                <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Globe size={16} className="text-green-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Real World Example</p>
                    <p className="text-xs text-gray-500">Connect the concept to something students encounter in real life.</p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Real-World Scenario</label>
                <MarkdownEditor
                    value={scenario}
                    onChange={(val) => onChange({ ...block, content: { ...content, scenario: val } })}
                    onBlur={() => update({ scenario })}
                    placeholder="Describe a real-world situation where this concept applies..."
                    minHeight={140}
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Connection to Concept</label>
                <textarea
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none outline-none focus:border-green-400"
                    rows={2}
                    value={connection}
                    onChange={(e) => onChange({ ...block, content: { ...content, connection: e.target.value } })}
                    onBlur={() => update({ connection })}
                    placeholder="Explicitly link this example back to the concept..."
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Experiment
// ──────────────────────────────────────────────────────────
export function ExperimentEditor({ block, onChange, onSave }) {
    const content = parseContent(block.content);
    const purpose = content.purpose || '';
    const procedure = content.procedure || '';
    const observations = content.expected_observations || '';

    const update = (patch) => {
        const updated = { ...block, content: { ...content, ...patch } };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-orange-100">
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Zap size={16} className="text-orange-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Experiment</p>
                    <p className="text-xs text-gray-500">A practical activity for students to perform.</p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Purpose</label>
                <textarea
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none outline-none focus:border-orange-400"
                    value={purpose}
                    onChange={(e) => onChange({ ...block, content: { ...content, purpose: e.target.value } })}
                    onBlur={() => update({ purpose })}
                    placeholder="What will students discover?"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Procedure</label>
                <MarkdownEditor
                    value={procedure}
                    onChange={(val) => onChange({ ...block, content: { ...content, procedure: val } })}
                    onBlur={() => update({ procedure })}
                    placeholder="Step 1: ...\nStep 2: ..."
                    minHeight={160}
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expected Observations</label>
                <textarea
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none outline-none focus:border-orange-400"
                    value={observations}
                    onChange={(e) => onChange({ ...block, content: { ...content, expected_observations: e.target.value } })}
                    onBlur={() => update({ expected_observations: observations })}
                    placeholder="What should students observe?"
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// FALLBACK: Generic plain-text editor for unrecognised types
// ──────────────────────────────────────────────────────────
export function GenericEditor({ block, onChange, onSave }) {
    const text = extractText(block.content);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FileText size={16} className="text-gray-500" />
                </span>
                <div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {block.block_type.replace(/_/g, ' ')}
                    </p>
                </div>
            </div>
            <MarkdownEditor
                value={text}
                onChange={(val) => onChange({ ...block, content: { text: val } })}
                onBlur={() => onSave(block)}
                placeholder="Edit content here..."
                minHeight={200}
            />
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// Utility: safely parse block content to object
// ──────────────────────────────────────────────────────────
function parseContent(content) {
    if (!content) return {};
    if (typeof content === 'object') return content;
    try { return JSON.parse(content); } catch { return { text: content }; }
}

// ──────────────────────────────────────────────────────────
// EDITOR: Definition
// ──────────────────────────────────────────────────────────
export function DefinitionEditor({ block, onChange, onSave }) {
    const c = parseContent(block.content);
    const term = c.term || '';
    const definition = c.definition || '';
    const example = c.example || '';

    const update = (patch) => {
        const updated = { ...block, content: { ...c, ...patch } };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-purple-100">
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">D</span>
                <div>
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Definition</p>
                    <p className="text-xs text-gray-500">Introduce a key term with a clear definition.</p>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Term</label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                    value={term}
                    onChange={(e) => onChange({ ...block, content: { ...c, term: e.target.value } })}
                    onBlur={() => update({ term })}
                    placeholder="e.g. Osmosis"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Definition</label>
                <textarea
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-purple-400"
                    value={definition}
                    onChange={(e) => onChange({ ...block, content: { ...c, definition: e.target.value } })}
                    onBlur={() => update({ definition })}
                    placeholder="The movement of water molecules across a semi-permeable membrane..."
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Example <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                    value={example}
                    onChange={(e) => onChange({ ...block, content: { ...c, example: e.target.value } })}
                    onBlur={() => update({ example })}
                    placeholder="e.g. Water entering a plant root cell from soil"
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Misconception
// ──────────────────────────────────────────────────────────
export function MisconceptionEditor({ block, onChange, onSave }) {
    const c = parseContent(block.content);
    const myth = c.myth || '';
    const reality = c.reality || '';

    const update = (patch) => {
        const updated = { ...block, content: { ...c, ...patch } };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-red-100">
                <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle size={16} className="text-red-500" />
                </span>
                <div>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Misconception Buster</p>
                    <p className="text-xs text-gray-500">Correct a common student misconception.</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-red-600 mb-2">❌ Common Myth</p>
                    <textarea
                        rows={4}
                        className="w-full bg-transparent text-sm text-gray-700 resize-none outline-none"
                        value={myth}
                        onChange={(e) => onChange({ ...block, content: { ...c, myth: e.target.value } })}
                        onBlur={() => update({ myth })}
                        placeholder="Students often think..."
                    />
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-green-600 mb-2">✅ The Reality</p>
                    <textarea
                        rows={4}
                        className="w-full bg-transparent text-sm text-gray-700 resize-none outline-none"
                        value={reality}
                        onChange={(e) => onChange({ ...block, content: { ...c, reality: e.target.value } })}
                        onBlur={() => update({ reality })}
                        placeholder="In fact..."
                    />
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Table
// ──────────────────────────────────────────────────────────
export function TableEditor({ block, onChange, onSave }) {
    const c = parseContent(block.content);
    const headers = c.headers || ['Column 1', 'Column 2'];
    const rows = c.rows || [['', '']];

    const update = (patch) => {
        const updated = { ...block, content: { ...c, ...patch } };
        onChange(updated);
        onSave(updated);
    };

    const addColumn = () => {
        const newHeaders = [...headers, `Column ${headers.length + 1}`];
        const newRows = rows.map(r => [...r, '']);
        update({ headers: newHeaders, rows: newRows });
    };

    const addRow = () => {
        update({ rows: [...rows, headers.map(() => '')] });
    };

    const updateHeader = (i, val) => {
        const h = [...headers];
        h[i] = val;
        update({ headers: h });
    };

    const updateCell = (r, c2, val) => {
        const newRows = rows.map((row, ri) =>
            ri === r ? row.map((cell, ci) => (ci === c2 ? val : cell)) : row
        );
        update({ rows: newRows });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-blue-100">
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">T</span>
                <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Table</p>
                    <p className="text-xs text-gray-500">Structured comparison or data table.</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="border border-gray-300 bg-gray-100 p-1">
                                    <input
                                        className="w-full bg-transparent text-center font-semibold outline-none"
                                        value={h}
                                        onChange={(e) => updateHeader(i, e.target.value)}
                                    />
                                </th>
                            ))}
                            <th className="border border-dashed border-gray-300 p-1">
                                <button onClick={addColumn} className="text-xs text-blue-500 hover:text-blue-700 w-full">+ Col</button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, ri) => (
                            <tr key={ri}>
                                {row.map((cell, ci) => (
                                    <td key={ci} className="border border-gray-200 p-1">
                                        <input
                                            className="w-full outline-none px-1 py-0.5"
                                            value={cell}
                                            onChange={(e) => updateCell(ri, ci, e.target.value)}
                                        />
                                    </td>
                                ))}
                                <td />
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={headers.length + 1} className="border border-dashed border-gray-200">
                                <button onClick={addRow} className="text-xs text-blue-500 hover:text-blue-700 w-full py-1">+ Row</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Image
// ──────────────────────────────────────────────────────────
export function ImageEditor({ block, onChange, onSave }) {
    const c = parseContent(block.content);
    const [urlInput, setUrlInput] = useState(c.url || '');

    const save = (url, caption) => {
        const updated = { ...block, content: { ...c, url, caption } };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-cyan-100">
                <span className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-sm">🖼</span>
                <div>
                    <p className="text-xs font-bold text-cyan-700 uppercase tracking-wide">Image</p>
                    <p className="text-xs text-gray-500">Embed an image by URL.</p>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
                <input
                    type="url"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onBlur={() => save(urlInput, c.caption || '')}
                    placeholder="https://..."
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Caption <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    value={c.caption || ''}
                    onChange={(e) => onChange({ ...block, content: { ...c, caption: e.target.value } })}
                    onBlur={() => save(urlInput, c.caption || '')}
                    placeholder="Figure 1: ..."
                />
            </div>
            {urlInput && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[120px]">
                    <img
                        src={urlInput}
                        alt={c.caption || 'Preview'}
                        className="max-h-48 max-w-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: YouTube
// ──────────────────────────────────────────────────────────
export function YouTubeEditor({ block, onChange, onSave }) {
    const c = parseContent(block.content);
    const [urlInput, setUrlInput] = useState(c.youtube_url || '');

    const extractVideoId = (url) => {
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
            return u.searchParams.get('v') || '';
        } catch { return ''; }
    };

    const save = (url) => {
        const videoId = extractVideoId(url);
        const updated = { ...block, content: { ...c, youtube_url: url, video_id: videoId } };
        onChange(updated);
        onSave(updated);
    };

    const videoId = c.video_id || extractVideoId(urlInput);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-red-100">
                <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">▶</span>
                <div>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide">YouTube Video</p>
                    <p className="text-xs text-gray-500">Embed a YouTube video by URL.</p>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">YouTube URL</label>
                <input
                    type="url"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onBlur={() => save(urlInput)}
                    placeholder="https://www.youtube.com/watch?v=..."
                />
            </div>
            {videoId && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-black aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="YouTube Preview"
                    />
                </div>
            )}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Caption <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                    value={c.caption || ''}
                    onChange={(e) => onChange({ ...block, content: { ...c, caption: e.target.value } })}
                    onBlur={() => save(urlInput)}
                    placeholder="Video: ..."
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Video (hosted / direct link)
// ──────────────────────────────────────────────────────────
export function VideoEditor({ block, onChange, onSave }) {
    const c = parseContent(block.content);
    const [urlInput, setUrlInput] = useState(c.video_url || '');

    const save = (url) => {
        const updated = { ...block, content: { ...c, video_url: url } };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-violet-100">
                <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">🎬</span>
                <div>
                    <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Video</p>
                    <p className="text-xs text-gray-500">Direct link to a hosted video file (MP4, WebM, etc.).</p>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Video URL</label>
                <input
                    type="url"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onBlur={() => save(urlInput)}
                    placeholder="https://cdn.example.com/video.mp4"
                />
            </div>
            {urlInput && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <video
                        src={urlInput}
                        controls
                        className="w-full max-h-60"
                    />
                </div>
            )}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Caption <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                    value={c.caption || ''}
                    onChange={(e) => onChange({ ...block, content: { ...c, caption: e.target.value } })}
                    onBlur={() => save(urlInput)}
                    placeholder="Video description..."
                />
            </div>
        </div>
    );
}
