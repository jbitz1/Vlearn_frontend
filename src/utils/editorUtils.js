/**
 * editorUtils.js
 *
 * Robust, non-destructive formatting helpers for markdown text areas.
 * Provides smart word detection, wrap/unwrap toggle, smart prefix toggle,
 * and key handlers without injecting dummy placeholder text.
 */

/**
 * Toggle wrapping delimiters (e.g. '**' for bold, '*' for italic, '$' for math).
 *
 * @param {string} val Current text value
 * @param {number} start Selection start index
 * @param {number} end Selection end index
 * @param {string} delimiter Delimiter string (e.g. '**')
 * @returns {{ nextVal: string, newStart: number, newEnd: number }}
 */
export function toggleWrap(val = '', start = 0, end = 0, delimiter = '**') {
    const dLen = delimiter.length;

    // 1. Text is selected
    if (start < end) {
        const selected = val.slice(start, end);
        // Case 1a: Selection itself is wrapped with delimiter (e.g. "**water**")
        if (selected.startsWith(delimiter) && selected.endsWith(delimiter) && selected.length >= dLen * 2) {
            const unwrapped = selected.slice(dLen, -dLen);
            return {
                nextVal: val.slice(0, start) + unwrapped + val.slice(end),
                newStart: start,
                newEnd: start + unwrapped.length,
            };
        }
        // Case 1b: Surrounding characters outside selection are the delimiter
        if (start >= dLen && val.slice(start - dLen, start) === delimiter && val.slice(end, end + dLen) === delimiter) {
            return {
                nextVal: val.slice(0, start - dLen) + selected + val.slice(end + dLen),
                newStart: start - dLen,
                newEnd: start - dLen + selected.length,
            };
        }
        // Case 1c: Wrap selection
        return {
            nextVal: val.slice(0, start) + delimiter + selected + delimiter + val.slice(end),
            newStart: start + dLen,
            newEnd: end + dLen,
        };
    }

    // 2. Collapsed cursor (start === end)
    let wordStart = start;
    let wordEnd = start;
    while (wordStart > 0 && /[a-zA-Z0-9_\-\u00C0-\u017F]/.test(val[wordStart - 1])) wordStart--;
    while (wordEnd < val.length && /[a-zA-Z0-9_\-\u00C0-\u017F]/.test(val[wordEnd])) wordEnd++;

    if (wordStart < wordEnd) {
        const word = val.slice(wordStart, wordEnd);
        // If word under cursor is already wrapped: toggle it OFF
        if (wordStart >= dLen && val.slice(wordStart - dLen, wordStart) === delimiter && val.slice(wordEnd, wordEnd + dLen) === delimiter) {
            return {
                nextVal: val.slice(0, wordStart - dLen) + word + val.slice(wordEnd + dLen),
                newStart: wordStart - dLen,
                newEnd: wordEnd - dLen,
            };
        }
        // Otherwise: wrap the word
        return {
            nextVal: val.slice(0, wordStart) + delimiter + word + delimiter + val.slice(wordEnd),
            newStart: wordStart + dLen,
            newEnd: wordEnd + dLen,
        };
    }

    // 3. Not on a word: insert delimiter pair and place cursor in the middle
    // NEVER insert dummy text like 'bold text' or 'italic text'!
    return {
        nextVal: val.slice(0, start) + delimiter + delimiter + val.slice(start),
        newStart: start + dLen,
        newEnd: start + dLen,
    };
}

/**
 * Toggle block formula ($$...$$)
 */
export function toggleBlockMath(val = '', start = 0, end = 0) {
    if (start < end) {
        const selected = val.slice(start, end).trim();
        return {
            nextVal: val.slice(0, start) + `\n$$\n${selected}\n$$\n` + val.slice(end),
            newStart: start + 4,
            newEnd: start + 4 + selected.length,
        };
    }
    return {
        nextVal: val.slice(0, start) + '\n$$\n\n$$\n' + val.slice(start),
        newStart: start + 4,
        newEnd: start + 4,
    };
}

/**
 * Toggle color styling span
 */
export function toggleColor(val = '', start = 0, end = 0, className = '') {
    if (start < end) {
        const selected = val.slice(start, end);
        const spanMatch = selected.match(/^<span class="([^"]+)">([\s\S]*)<\/span>$/);
        if (spanMatch) {
            if (spanMatch[1] === className) {
                const unwrapped = spanMatch[2];
                return {
                    nextVal: val.slice(0, start) + unwrapped + val.slice(end),
                    newStart: start,
                    newEnd: start + unwrapped.length,
                };
            } else {
                const updated = `<span class="${className}">${spanMatch[2]}</span>`;
                return {
                    nextVal: val.slice(0, start) + updated + val.slice(end),
                    newStart: start,
                    newEnd: start + updated.length,
                };
            }
        }
        const wrapped = `<span class="${className}">${selected}</span>`;
        return {
            nextVal: val.slice(0, start) + wrapped + val.slice(end),
            newStart: start,
            newEnd: start + wrapped.length,
        };
    }

    // Collapsed cursor on word
    let wordStart = start;
    let wordEnd = start;
    while (wordStart > 0 && /[a-zA-Z0-9_\-\u00C0-\u017F]/.test(val[wordStart - 1])) wordStart--;
    while (wordEnd < val.length && /[a-zA-Z0-9_\-\u00C0-\u017F]/.test(val[wordEnd])) wordEnd++;

    if (wordStart < wordEnd) {
        const word = val.slice(wordStart, wordEnd);
        const wrapped = `<span class="${className}">${word}</span>`;
        return {
            nextVal: val.slice(0, wordStart) + wrapped + val.slice(wordEnd),
            newStart: wordStart,
            newEnd: wordStart + wrapped.length,
        };
    }

    const tagOpen = `<span class="${className}">`;
    const tagClose = '</span>';
    return {
        nextVal: val.slice(0, start) + tagOpen + tagClose + val.slice(start),
        newStart: start + tagOpen.length,
        newEnd: start + tagOpen.length,
    };
}

/**
 * Toggle line prefixes (headings, bullet points, numbers, quotes).
 * Always anchors strictly to line boundaries so mid-line selections apply to full lines.
 */
export function toggleLinePrefix(val = '', start = 0, end = 0, prefix = '- ', isSequential = false) {
    const isHeading = prefix.trim().startsWith('#');

    // 1. Expand range to cover entire affected lines
    const lastNewline = val.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    // If selection ends right at a newline, don't include the next line
    const searchEndIndex = end > start && val[end - 1] === '\n' ? Math.max(start, end - 2) : (end === start ? start : end - 1);
    const nextNewline = val.indexOf('\n', searchEndIndex);
    const lineEnd = nextNewline === -1 ? val.length : nextNewline;

    const fullLinesText = val.substring(lineStart, lineEnd);
    const lines = fullLinesText.split('\n');

    // Check if all non-empty lines already have the target prefix
    const allHavePrefix = lines.every(l => {
        if (!l.trim()) return true;
        if (isSequential) return /^\d+\.\s+/.test(l);
        if (isHeading) return l.startsWith(prefix);
        return l.startsWith(prefix);
    });

    const processed = lines.map((line, idx) => {
        if (!line.trim()) return line;

        if (allHavePrefix) {
            // Toggle OFF
            if (isSequential) return line.replace(/^\d+\.\s+/, '');
            if (isHeading) return line.replace(/^#{1,6}\s+/, '');
            return line.slice(prefix.length);
        } else {
            // Apply prefix
            if (isHeading) {
                // If it already had any heading or list prefix, clean it and apply new heading
                const clean = line.replace(/^#{1,6}\s+/, '').replace(/^[-*>\d\.]+\s+/, '');
                return `${prefix}${clean}`;
            } else if (isSequential) {
                const clean = line.replace(/^\d+\.\s+/, '').replace(/^[-*>\#]+\s+/, '');
                return `${idx + 1}. ${clean}`;
            } else {
                const clean = line.replace(/^[-*>\#]+\s+/, '').replace(/^\d+\.\s+/, '');
                return `${prefix}${clean}`;
            }
        }
    }).join('\n');

    const nextVal = val.substring(0, lineStart) + processed + val.substring(lineEnd);

    let newStart = lineStart;
    let newEnd = lineStart + processed.length;

    if (start === end) {
        const delta = processed.length - fullLinesText.length;
        const newPos = Math.max(lineStart, Math.min(nextVal.length, start + delta));
        newStart = newPos;
        newEnd = newPos;
    }

    return {
        nextVal,
        newStart,
        newEnd,
    };
}

/**
 * Handle editor shortcuts (Ctrl+B, Ctrl+I, Tab indentation, Enter list continuation).
 */
export function handleEditorKeyDown(e, value, onChange, textareaEl) {
    if (!textareaEl) return;

    // Tab key: insert 2 spaces
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = textareaEl.selectionStart;
        const end = textareaEl.selectionEnd;
        const val = value || '';
        const nextVal = val.slice(0, start) + '  ' + val.slice(end);
        onChange(nextVal);
        setTimeout(() => {
            textareaEl.setSelectionRange(start + 2, start + 2);
        }, 0);
        return;
    }

    // Ctrl+B or Cmd+B: Bold
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        const { nextVal, newStart, newEnd } = toggleWrap(value || '', textareaEl.selectionStart, textareaEl.selectionEnd, '**');
        onChange(nextVal);
        setTimeout(() => {
            textareaEl.focus();
            textareaEl.setSelectionRange(newStart, newEnd);
        }, 0);
        return;
    }

    // Ctrl+I or Cmd+I: Italic
    if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        const { nextVal, newStart, newEnd } = toggleWrap(value || '', textareaEl.selectionStart, textareaEl.selectionEnd, '*');
        onChange(nextVal);
        setTimeout(() => {
            textareaEl.focus();
            textareaEl.setSelectionRange(newStart, newEnd);
        }, 0);
        return;
    }

    // Enter key: smart list continuation
    if (e.key === 'Enter') {
        const start = textareaEl.selectionStart;
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
                textareaEl.setSelectionRange(lineStart, lineStart);
            }, 0);
            return;
        }

        // Empty numbered line -> terminate list
        if (/^[\t ]*\d+\.[\t ]+$/.test(currentLine)) {
            e.preventDefault();
            const nextVal = val.slice(0, lineStart) + val.slice(start);
            onChange(nextVal);
            setTimeout(() => {
                textareaEl.setSelectionRange(lineStart, lineStart);
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
                textareaEl.setSelectionRange(start + 1 + prefix.length, start + 1 + prefix.length);
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
                textareaEl.setSelectionRange(start + 1 + prefix.length, start + 1 + prefix.length);
            }, 0);
            return;
        }
    }
}
