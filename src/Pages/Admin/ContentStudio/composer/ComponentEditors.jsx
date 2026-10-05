import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    Target, FileText, Lightbulb, HelpCircle, Star,
    AlertCircle, Info, Zap, Globe, Edit3, Eye,
    ChevronDown, ChevronUp, Trash2,
    Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Calculator, Quote, Palette, Plus
} from 'lucide-react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { extractText } from '../../../../utils/contentUtils';
import { getComponentBadgeInfo } from '../../../../utils/componentBadgeUtils';
import { toggleWrap, toggleBlockMath, toggleColor, toggleLinePrefix as toggleLinePrefixUtil, handleEditorKeyDown } from '../../../../utils/editorUtils';

// ──────────────────────────────────────────────────────────
// Shared text editor: split markdown/preview pane with toolbar
// ──────────────────────────────────────────────────────────
function MarkdownEditor({ value, onChange, onBlur, placeholder, minHeight = 200 }) {
    const [tab, setTab] = useState('write'); // 'write' | 'preview'
    const [showColorPicker, setShowColorPicker] = useState(false);
    const textareaRef = useRef(null);

    const toggleWrap = (delimiter) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const val = value || '';
        const dLen = delimiter.length;

        // 1. Text is selected
        if (start < end) {
            const selected = val.slice(start, end);
            // Case 1a: Selection itself is wrapped with delimiter
            if (selected.startsWith(delimiter) && selected.endsWith(delimiter) && selected.length >= dLen * 2) {
                const unwrapped = selected.slice(dLen, -dLen);
                const nextVal = val.slice(0, start) + unwrapped + val.slice(end);
                onChange(nextVal);
                setTimeout(() => {
                    el.focus();
                    el.setSelectionRange(start, start + unwrapped.length);
                }, 0);
                return;
            }
            // Case 1b: Surrounding characters are the delimiter
            if (start >= dLen && val.slice(start - dLen, start) === delimiter && val.slice(end, end + dLen) === delimiter) {
                const nextVal = val.slice(0, start - dLen) + selected + val.slice(end + dLen);
                onChange(nextVal);
                setTimeout(() => {
                    el.focus();
                    el.setSelectionRange(start - dLen, start - dLen + selected.length);
                }, 0);
                return;
            }
            // Case 1c: Wrap selection
            const nextVal = val.slice(0, start) + delimiter + selected + delimiter + val.slice(end);
            onChange(nextVal);
            setTimeout(() => {
                el.focus();
                el.setSelectionRange(start + dLen, end + dLen);
            }, 0);
            return;
        }

        // 2. Collapsed cursor (start === end)
        let wordStart = start;
        let wordEnd = start;
        while (wordStart > 0 && /[a-zA-Z0-9_\-\u00C0-\u017F]/.test(val[wordStart - 1])) wordStart--;
        while (wordEnd < val.length && /[a-zA-Z0-9_\-\u00C0-\u017F]/.test(val[wordEnd])) wordEnd++;

        if (wordStart < wordEnd) {
            const word = val.slice(wordStart, wordEnd);
            // If the word under cursor is already wrapped in delimiter: unwrap it!
            if (wordStart >= dLen && val.slice(wordStart - dLen, wordStart) === delimiter && val.slice(wordEnd, wordEnd + dLen) === delimiter) {
                const nextVal = val.slice(0, wordStart - dLen) + word + val.slice(wordEnd + dLen);
                onChange(nextVal);
                setTimeout(() => {
                    el.focus();
                    el.setSelectionRange(wordStart - dLen, wordEnd - dLen);
                }, 0);
                return;
            }
            // Otherwise, wrap the word!
            const nextVal = val.slice(0, wordStart) + delimiter + word + delimiter + val.slice(wordEnd);
            onChange(nextVal);
            setTimeout(() => {
                el.focus();
                el.setSelectionRange(wordStart + dLen, wordEnd + dLen);
            }, 0);
            return;
        }

        // 3. Not on a word (empty space or punctuation):
        // Insert empty delimiter pair and place cursor in the middle so typing is formatted.
        // NEVER insert dummy text like 'bold text' or 'italic text'!
        const nextVal = val.slice(0, start) + delimiter + delimiter + val.slice(start);
        onChange(nextVal);
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + dLen, start + dLen);
        }, 0);
    };

    const toggleBlockMath = () => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const val = value || '';

        if (start < end) {
            const selected = val.slice(start, end).trim();
            const nextVal = val.slice(0, start) + `\n$$\n${selected}\n$$\n` + val.slice(end);
            onChange(nextVal);
            setTimeout(() => {
                el.focus();
                el.setSelectionRange(start + 4, start + 4 + selected.length);
            }, 0);
            return;
        }

        // Empty block formula
        const nextVal = val.slice(0, start) + '\n$$\n\n$$\n' + val.slice(start);
        onChange(nextVal);
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + 4, start + 4);
        }, 0);
    };

    const toggleColor = (className) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const val = value || '';

        if (start < end) {
            const selected = val.slice(start, end);
            const spanMatch = selected.match(/^<span class="([^"]+)">([\s\S]*)<\/span>$/);
            if (spanMatch) {
                if (spanMatch[1] === className) {
                    const unwrapped = spanMatch[2];
                    const nextVal = val.slice(0, start) + unwrapped + val.slice(end);
                    onChange(nextVal);
                    setTimeout(() => {
                        el.focus();
                        el.setSelectionRange(start, start + unwrapped.length);
                    }, 0);
                    return;
                } else {
                    const updated = `<span class="${className}">${spanMatch[2]}</span>`;
                    const nextVal = val.slice(0, start) + updated + val.slice(end);
                    onChange(nextVal);
                    setTimeout(() => {
                        el.focus();
                        el.setSelectionRange(start, start + updated.length);
                    }, 0);
                    return;
                }
            }
            const wrapped = `<span class="${className}">${selected}</span>`;
            const nextVal = val.slice(0, start) + wrapped + val.slice(end);
            onChange(nextVal);
            setTimeout(() => {
                el.focus();
                el.setSelectionRange(start, start + wrapped.length);
            }, 0);
            return;
        }

        // Collapsed cursor
        let wordStart = start;
        let wordEnd = start;
        while (wordStart > 0 && /[a-zA-Z0-9_\-\u00C0-\u017F]/.test(val[wordStart - 1])) wordStart--;
        while (wordEnd < val.length && /[a-zA-Z0-9_\-\u00C0-\u017F]/.test(val[wordEnd])) wordEnd++;

        if (wordStart < wordEnd) {
            const word = val.slice(wordStart, wordEnd);
            const wrapped = `<span class="${className}">${word}</span>`;
            const nextVal = val.slice(0, wordStart) + wrapped + val.slice(wordEnd);
            onChange(nextVal);
            setTimeout(() => {
                el.focus();
                el.setSelectionRange(wordStart, wordStart + wrapped.length);
            }, 0);
            return;
        }

        const tagOpen = `<span class="${className}">`;
        const tagClose = '</span>';
        const nextVal = val.slice(0, start) + tagOpen + tagClose + val.slice(start);
        onChange(nextVal);
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + tagOpen.length, start + tagOpen.length);
        }, 0);
    };

    const toggleLinePrefix = (prefix, isSequential = false) => {
        const el = textareaRef.current;
        if (!el) return;
        const { nextVal, newStart, newEnd } = toggleLinePrefixUtil(value || '', el.selectionStart, el.selectionEnd, prefix, isSequential);
        onChange(nextVal);
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(newStart, newEnd);
        }, 0);
    };

    const handleKeyDown = (e) => {
        // Tab key: insert 2 spaces
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const val = value || '';
            const nextVal = val.slice(0, start) + '  ' + val.slice(end);
            onChange(nextVal);
            setTimeout(() => {
                if (textareaRef.current) textareaRef.current.setSelectionRange(start + 2, start + 2);
            }, 0);
            return;
        }

        // Ctrl+B or Cmd+B: Bold
        if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            toggleWrap('**');
            return;
        }

        // Ctrl+I or Cmd+I: Italic
        if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
            e.preventDefault();
            toggleWrap('*');
            return;
        }

        // Enter key: smart list continuation
        if (e.key === 'Enter') {
            const start = e.target.selectionStart;
            const val = value || '';
            const lastNewline = val.lastIndexOf('\n', start - 1);
            const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
            const currentLine = val.substring(lineStart, start);

            // Empty bullet line -> terminate bullet
            if (/^[\t ]*[-*][\t ]+$/.test(currentLine)) {
                e.preventDefault();
                const nextVal = val.slice(0, lineStart) + val.slice(start);
                onChange(nextVal);
                setTimeout(() => {
                    if (textareaRef.current) textareaRef.current.setSelectionRange(lineStart, lineStart);
                }, 0);
                return;
            }

            // Empty numbered line -> terminate list
            if (/^[\t ]*\d+\.[\t ]+$/.test(currentLine)) {
                e.preventDefault();
                const nextVal = val.slice(0, lineStart) + val.slice(start);
                onChange(nextVal);
                setTimeout(() => {
                    if (textareaRef.current) textareaRef.current.setSelectionRange(lineStart, lineStart);
                }, 0);
                return;
            }

            // Active bullet list item
            const bulletMatch = currentLine.match(/^([\t ]*[-*][\t ]+)/);
            if (bulletMatch) {
                e.preventDefault();
                const prefix = bulletMatch[1];
                const nextVal = val.slice(0, start) + '\n' + prefix + val.slice(start);
                onChange(nextVal);
                setTimeout(() => {
                    if (textareaRef.current) textareaRef.current.setSelectionRange(start + 1 + prefix.length, start + 1 + prefix.length);
                }, 0);
                return;
            }

            // Active numbered list item
            const numMatch = currentLine.match(/^([\t ]*)(\d+)\.([\t ]+)/);
            if (numMatch) {
                e.preventDefault();
                const indent = numMatch[1];
                const nextNum = parseInt(numMatch[2], 10) + 1;
                const space = numMatch[3];
                const prefix = `${indent}${nextNum}.${space}`;
                const nextVal = val.slice(0, start) + '\n' + prefix + val.slice(start);
                onChange(nextVal);
                setTimeout(() => {
                    if (textareaRef.current) textareaRef.current.setSelectionRange(start + 1 + prefix.length, start + 1 + prefix.length);
                }, 0);
                return;
            }
        }
    };

    const COLOR_OPTIONS = [
        { label: 'Blue (Key Term)', className: 'text-blue-600 font-semibold', bg: 'bg-blue-600' },
        { label: 'Emerald (Example)', className: 'text-emerald-600 font-semibold', bg: 'bg-emerald-600' },
        { label: 'Amber (Highlight)', className: 'text-amber-600 font-semibold', bg: 'bg-amber-600' },
        { label: 'Purple (Theory/Formula)', className: 'text-purple-600 font-semibold', bg: 'bg-purple-600' },
        { label: 'Rose (Critical/Alert)', className: 'text-rose-600 font-semibold', bg: 'bg-rose-600' },
    ];

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
            <div className="flex items-center border-b border-gray-200 bg-gray-50/80 px-2 relative">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setTab('write')}
                    className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        tab === 'write'
                            ? 'text-custom-blue border-b-2 border-custom-blue bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Edit3 size={13} /> Write
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setTab('preview')}
                    className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        tab === 'preview'
                            ? 'text-custom-blue border-b-2 border-custom-blue bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Eye size={13} /> Preview
                </button>

                {tab === 'write' && (
                    <div className="flex items-center gap-1 ml-4 pl-3 border-l border-gray-200">
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleWrap('**')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Bold (Ctrl+B)"
                        >
                            <Bold size={13} />
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleWrap('*')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Italic (Ctrl+I)"
                        >
                            <Italic size={13} />
                        </button>
                        <div className="w-[1px] h-3.5 bg-gray-200 mx-0.5" />
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleLinePrefix('# ')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Heading 1 (# )"
                        >
                            <Heading1 size={13} />
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleLinePrefix('## ')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Heading 2 (## )"
                        >
                            <Heading2 size={13} />
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleLinePrefix('### ')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Heading 3 (### )"
                        >
                            <Heading3 size={13} />
                        </button>
                        <div className="w-[1px] h-3.5 bg-gray-200 mx-0.5" />
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleLinePrefix('- ')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Bullet List"
                        >
                            <List size={13} />
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleLinePrefix('1. ', true)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Numbered List"
                        >
                            <ListOrdered size={13} />
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleLinePrefix('> ')}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Quote"
                        >
                            <Quote size={13} />
                        </button>
                        <div className="w-[1px] h-3.5 bg-gray-200 mx-0.5" />
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggleWrap('$')}
                            className="px-1.5 py-0.5 text-xs font-mono font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Inline Math ($...$)"
                        >
                            $x$
                        </button>
                        <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={toggleBlockMath}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 rounded transition-colors"
                            title="Formula Block ($$...$$)"
                        >
                            <Calculator size={13} />
                        </button>

                        <div className="w-[1px] h-3.5 bg-gray-200 mx-0.5" />

                        {/* Text Color Popover */}
                        <div className="relative">
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className={`p-1.5 rounded transition-colors ${
                                    showColorPicker
                                        ? 'bg-blue-100 text-custom-blue'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/70'
                                }`}
                                title="Highlight / Text Color"
                            >
                                <Palette size={13} />
                            </button>

                            {showColorPicker && (
                                <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 shadow-xl rounded-xl p-2 z-50 w-48 space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-0.5">Text Color</p>
                                    {COLOR_OPTIONS.map((col) => (
                                        <button
                                            key={col.label}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                toggleColor(col.className);
                                                setShowColorPicker(false);
                                            }}
                                            className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-gray-50 flex items-center gap-2 font-medium text-gray-700 transition-colors"
                                        >
                                            <span className={`w-2.5 h-2.5 rounded-full ${col.bg}`} />
                                            {col.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <span className="ml-auto text-[11px] text-gray-400 font-medium hidden sm:inline">Markdown & LaTeX</span>
            </div>
            {tab === 'write' ? (
                <textarea
                    ref={textareaRef}
                    className="w-full p-4 text-sm text-gray-700 bg-white resize-none outline-none font-mono leading-relaxed"
                    style={{ minHeight }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
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
                            remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                            rehypePlugins={[rehypeRaw, [rehypeKatex, { throwOnError: false, strict: false }]]}
                            components={{
                                p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-gray-800" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-3 space-y-1 text-gray-800" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-3 space-y-1 text-gray-800" {...props} />,
                                li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />
                            }}
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
    const badge = getComponentBadgeInfo(block.block_type);

    return (
        <div className="space-y-4">
            <div className={`flex items-center gap-2 pb-3 border-b ${badge.border}`}>
                <span className={`w-8 h-8 rounded-lg ${badge.bg} flex items-center justify-center`}>
                    <FileText size={16} className={badge.color} />
                </span>
                <div>
                    <p className={`text-xs font-bold ${badge.color} uppercase tracking-wide`}>{badge.label}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
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
    const checkType = content.check_type || (['multiple_choice', 'true_false', 'fill_in_the_blank', 'short_answer'].includes(block.block_type) ? block.block_type : 'short_answer');
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
                    <option value="fill_in_the_blank">Fill in the Blank</option>
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
                    placeholder={checkType === 'fill_in_the_blank' ? "e.g. Water freezes at ___ degrees Celsius under standard atmospheric pressure." : "What question will test students on this concept?"}
                />
                {checkType === 'fill_in_the_blank' && (
                    <p className="mt-1 text-xs text-violet-600 font-medium">
                        Tip: Use <span className="font-mono bg-violet-50 px-1 py-0.5 rounded border border-violet-200">___</span> (three underscores) in the question where the missing word should be.
                    </p>
                )}
            </div>

            {checkType === 'fill_in_the_blank' && (
                <div className="space-y-3 p-4 bg-violet-50/50 border border-violet-100 rounded-xl">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Missing Word / Phrase</label>
                        <input
                            type="text"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400 bg-white"
                            value={typeof answer === 'string' ? answer : ''}
                            onChange={(e) => onChange({ ...block, content: { ...content, answer: e.target.value } })}
                            onBlur={() => update({ answer })}
                            placeholder="e.g. 0 or zero"
                        />
                    </div>
                </div>
            )}

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
// EDITOR: Step Process (Sequential Process Flow)
// ──────────────────────────────────────────────────────────
export function StepProcessEditor({ block, onChange, onSave }) {
    const c = parseContent(block.content);
    const title = c.title || block.title || '';
    
    // Normalize steps into an array of strings
    const rawSteps = c.steps || c.items || c.procedure || [];
    const steps = Array.isArray(rawSteps) 
        ? rawSteps.map(s => typeof s === 'string' ? s : (s.title ? `**${s.title}**: ${s.description || ''}` : JSON.stringify(s)))
        : (typeof rawSteps === 'string' ? rawSteps.split('\n').filter(Boolean) : []);

    const update = (patch) => {
        const updated = {
            ...block,
            content: {
                ...c,
                ...patch,
            }
        };
        onChange(updated);
        onSave(updated);
    };

    const handleStepChange = (index, value) => {
        const nextSteps = [...steps];
        nextSteps[index] = value;
        onChange({
            ...block,
            content: { ...c, steps: nextSteps }
        });
    };

    const handleStepBlur = () => {
        update({ steps });
    };

    const addStep = () => {
        const nextSteps = [...steps, ''];
        update({ steps: nextSteps });
    };

    const removeStep = (index) => {
        const nextSteps = steps.filter((_, i) => i !== index);
        update({ steps: nextSteps });
    };

    const moveStep = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= steps.length) return;
        const nextSteps = [...steps];
        const [moved] = nextSteps.splice(index, 1);
        nextSteps.splice(targetIndex, 0, moved);
        update({ steps: nextSteps });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">
                        <ListOrdered size={16} />
                    </span>
                    <div>
                        <p className="text-xs font-bold text-sky-700 uppercase tracking-wide">Sequential Process Flow</p>
                        <p className="text-xs text-gray-500">Ordered sequence of scientific steps or procedure stages.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={addStep}
                    className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-md border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                    <Plus size={13} /> Add Step
                </button>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Process Title / Subtitle</label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-400 font-medium"
                    value={title}
                    onChange={(e) => onChange({ ...block, content: { ...c, title: e.target.value } })}
                    onBlur={(e) => update({ title: e.target.value })}
                    placeholder="e.g. From Curiosity to Scientific Law"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-600">
                        Process Steps ({steps.length})
                    </label>
                    <span className="text-[11px] text-gray-400">Supports markdown formatting (**bold**, $math$, etc.)</span>
                </div>
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50/70 border border-gray-200/80 rounded-xl group hover:border-sky-300 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-1">
                            {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <textarea
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 outline-none focus:border-sky-400 resize-y leading-relaxed font-sans"
                                value={step}
                                onChange={(e) => handleStepChange(idx, e.target.value)}
                                onBlur={handleStepBlur}
                                placeholder={`Describe step ${idx + 1}...`}
                            />
                        </div>
                        <div className="flex flex-col gap-1 shrink-0 pt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveStep(idx, -1)}
                                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded hover:bg-gray-200 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Step Up"
                            >
                                <ChevronUp size={13} />
                            </button>
                            <button
                                type="button"
                                disabled={idx === steps.length - 1}
                                onClick={() => moveStep(idx, 1)}
                                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 rounded hover:bg-gray-200 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Step Down"
                            >
                                <ChevronDown size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => removeStep(idx)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                                title="Delete Step"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                ))}

                {steps.length === 0 && (
                    <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-xs text-gray-400 mb-2">No steps in this process yet.</p>
                        <button
                            type="button"
                            onClick={addStep}
                            className="px-3 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition cursor-pointer"
                        >
                            + Add First Step
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Image
// ──────────────────────────────────────────────────────────
export function ImageEditor({ block, onChange, onSave, onDelete }) {
    const c = parseContent(block.content);
    const [urlInput, setUrlInput] = useState(c.url || '');

    const save = (url, caption) => {
        const updated = { ...block, content: { ...c, url, caption } };
        onChange(updated);
        onSave(updated);
    };

    const handleClear = () => {
        setUrlInput('');
        save('', c.caption || '');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-100">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-sm">🖼</span>
                    <div>
                        <p className="text-xs font-bold text-cyan-700 uppercase tracking-wide">Image</p>
                        <p className="text-xs text-gray-500">Embed an image by URL.</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {urlInput && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Clear image URL"
                        >
                            Clear Image
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(block.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete image component"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
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
export function YouTubeEditor({ block, onChange, onSave, onDelete }) {
    const c = parseContent(block.content);
    const [urlInput, setUrlInput] = useState(
        c.youtube_url || c.url || c.video_url || (c.video_id ? `https://www.youtube.com/watch?v=${c.video_id}` : '')
    );
    const [captionInput, setCaptionInput] = useState(c.caption || '');

    useEffect(() => {
        const parsed = parseContent(block.content);
        const currentUrl = parsed.youtube_url || parsed.url || parsed.video_url || (parsed.video_id ? `https://www.youtube.com/watch?v=${parsed.video_id}` : '');
        setUrlInput(currentUrl || '');
        setCaptionInput(parsed.caption || '');
    }, [block.content]);

    const extractVideoId = (url) => {
        if (!url) return '';
        const trimmed = url.trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
        try {
            const u = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
            if (u.hostname.includes('youtu.be')) {
                return u.pathname.replace(/^\//, '').split('/')[0] || '';
            }
            return u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop() || '';
        } catch { return ''; }
    };

    const save = (url, caption) => {
        const finalUrl = url !== undefined ? url : urlInput;
        const finalCaption = caption !== undefined ? caption : captionInput;
        const videoId = extractVideoId(finalUrl);
        const currentC = parseContent(block.content);
        const updated = {
            ...block,
            content: {
                ...currentC,
                youtube_url: finalUrl,
                url: finalUrl,
                video_url: finalUrl,
                video_id: videoId,
                resolved_video_id: videoId,
                caption: finalCaption,
            }
        };
        onChange(updated);
        onSave(updated);
    };

    const handleClear = () => {
        setUrlInput('');
        const currentC = parseContent(block.content);
        const updated = {
            ...block,
            content: {
                ...currentC,
                youtube_url: '',
                url: '',
                video_url: '',
                video_id: '',
                resolved_video_id: '',
            }
        };
        onChange(updated);
        onSave(updated);
    };

    const videoId = extractVideoId(urlInput) || c.video_id || c.resolved_video_id;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">▶</span>
                    <div>
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide">YouTube Video</p>
                        <p className="text-xs text-gray-500">Embed a YouTube video by URL.</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {urlInput && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Clear YouTube video"
                        >
                            Clear Video
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(block.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete video component"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">YouTube URL</label>
                <input
                    type="url"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onBlur={() => save(urlInput, captionInput)}
                    placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
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
                    value={captionInput}
                    onChange={(e) => {
                        setCaptionInput(e.target.value);
                        onChange({ ...block, content: { ...c, caption: e.target.value } });
                    }}
                    onBlur={() => save(urlInput, captionInput)}
                    placeholder="Video: ..."
                />
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// EDITOR: Video (hosted / direct link)
// ──────────────────────────────────────────────────────────
export function VideoEditor({ block, onChange, onSave, onDelete }) {
    const c = parseContent(block.content);
    const [urlInput, setUrlInput] = useState(c.video_url || c.url || '');
    const [captionInput, setCaptionInput] = useState(c.caption || '');

    useEffect(() => {
        const parsed = parseContent(block.content);
        setUrlInput(parsed.video_url || parsed.url || '');
        setCaptionInput(parsed.caption || '');
    }, [block.content]);

    const save = (url, caption) => {
        const finalUrl = url !== undefined ? url : urlInput;
        const finalCaption = caption !== undefined ? caption : captionInput;
        const currentC = parseContent(block.content);
        const updated = {
            ...block,
            content: {
                ...currentC,
                video_url: finalUrl,
                url: finalUrl,
                caption: finalCaption,
            }
        };
        onChange(updated);
        onSave(updated);
    };

    const handleClear = () => {
        setUrlInput('');
        const currentC = parseContent(block.content);
        const updated = {
            ...block,
            content: {
                ...currentC,
                video_url: '',
                url: '',
            }
        };
        onChange(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-violet-100">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">🎬</span>
                    <div>
                        <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Video</p>
                        <p className="text-xs text-gray-500">Direct link to a hosted video file (MP4, WebM, etc.).</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {urlInput && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Clear video URL"
                        >
                            Clear Video
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(block.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete video component"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Video URL</label>
                <input
                    type="url"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onBlur={() => save(urlInput, captionInput)}
                    placeholder="https://example.com/video.mp4"
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
                    value={captionInput}
                    onChange={(e) => {
                        setCaptionInput(e.target.value);
                        onChange({ ...block, content: { ...c, caption: e.target.value } });
                    }}
                    onBlur={() => save(urlInput, captionInput)}
                    placeholder="Video description..."
                />
            </div>
        </div>
    );
}
