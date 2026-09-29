/**
 * Utility formatters for VizLearn UI
 */

/**
 * Deduplicates and formats a form/class name and stream name cleanly.
 * Avoids awkward strings like "Form 3 Form 3 East" by detecting if the stream
 * name already includes the form prefix.
 *
 * Examples:
 *   formatStreamDisplay("Form 3", "East") => "Form 3 East"
 *   formatStreamDisplay("Form 3", "Form 3 East") => "Form 3 East"
 *   formatStreamDisplay("Grade 10", "Grade 10 North") => "Grade 10 North"
 *   formatStreamDisplay("Form 4", "") => "Form 4"
 */
export function formatStreamDisplay(formName = '', streamName = '') {
  const f = (formName || '').trim();
  const s = (streamName || '').trim();

  if (!f && !s) return '';
  if (!f) return s;
  if (!s) return f;

  // Check if stream name already starts with or strictly contains form name
  if (s.toLowerCase().startsWith(f.toLowerCase())) {
    return s;
  }

  // If stream name contains form name with spaces/punctuation
  const regex = new RegExp(`^${f}\\s+`, 'i');
  if (regex.test(s)) {
    return s;
  }

  return `${f} ${s}`;
}

export default {
  formatStreamDisplay,
};
