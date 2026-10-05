/**
 * contentUtils.js
 *
 * Shared utility functions for extracting readable text from LessonBlock
 * content fields, which may be stored as JSON strings, JSON objects, or
 * plain text strings.
 *
 * IMPORTANT: This must remain a .js file (not .jsx) so that it can be
 * safely imported by JSX files without breaking Vite React Fast Refresh.
 */

/**
 * Extract a human-readable text string from a LessonBlock content field.
 *
 * @param {string|object|null|undefined} content
 * @returns {string}
 */
export function extractText(content) {
    if (!content) return '';
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return extractText(parsed);
        } catch {
            return content;
        }
    }
    if (typeof content === 'object') {
        if (Array.isArray(content.steps)) {
            return content.steps.map((s, i) => typeof s === 'string' ? s : `${i + 1}. ${s.title || ''}: ${s.description || ''}`).join('\n\n');
        }
        return (
            content.text ||
            content.content ||
            content.question ||
            content.procedure ||
            content.explanation ||
            content.summary ||
            ''
        );
    }
    return String(content);
}
