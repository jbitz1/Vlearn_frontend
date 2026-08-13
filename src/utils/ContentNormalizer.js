// src/utils/ContentNormalizer.js

export const ContentNormalizer = {
    // 1. Core text extractor and parser
    extractText(content) {
        if (!content) return '';
        if (typeof content === 'string') {
            try { 
                const p = JSON.parse(content); 
                return this.extractFromObject(p); 
            } catch { 
                return content; 
            }
        }
        if (typeof content === 'object') {
            return this.extractFromObject(content);
        }
        return String(content);
    },

    extractFromObject(obj) {
        if (!obj || typeof obj !== 'object') return '';
        if (Array.isArray(obj)) {
            return obj
                .map(item => (typeof item === 'string' ? item : this.extractFromObject(item)))
                .filter(Boolean)
                .join('\n\n');
        }
        if (obj.goals && Array.isArray(obj.goals)) {
            const prefix = obj.title ? `### ${obj.title}\n\n` : '';
            return prefix + obj.goals.map(g => `- ${g}`).join('\n');
        }
        if (obj.items && Array.isArray(obj.items)) {
            const prefix = obj.title ? `### ${obj.title}\n\n` : '';
            return prefix + obj.items.map(it => `- ${it}`).join('\n');
        }
        if (obj.body) return typeof obj.body === 'string' ? obj.body : this.extractFromObject(obj.body);
        if (obj.text) return typeof obj.text === 'string' ? obj.text : this.extractFromObject(obj.text);
        if (obj.content) return typeof obj.content === 'string' ? obj.content : this.extractFromObject(obj.content);
        if (obj.definition) return typeof obj.definition === 'string' ? obj.definition : this.extractFromObject(obj.definition);
        if (obj.explanation) return typeof obj.explanation === 'string' ? obj.explanation : this.extractFromObject(obj.explanation);
        if (obj.summary) return typeof obj.summary === 'string' ? obj.summary : this.extractFromObject(obj.summary);
        if (obj.instruction) return typeof obj.instruction === 'string' ? obj.instruction : this.extractFromObject(obj.instruction);
        if (obj.procedure) return typeof obj.procedure === 'string' ? obj.procedure : this.extractFromObject(obj.procedure);
        if (obj.purpose) return typeof obj.purpose === 'string' ? obj.purpose : this.extractFromObject(obj.purpose);
        if (obj.breakdown) return typeof obj.breakdown === 'string' ? obj.breakdown : this.extractFromObject(obj.breakdown);
        if (obj.description) return typeof obj.description === 'string' ? obj.description : this.extractFromObject(obj.description);
        if (obj.formula) return typeof obj.formula === 'string' ? obj.formula : this.extractFromObject(obj.formula);

        // Fallback: concatenate all non-metadata string/array values
        const parts = [];
        for (const [k, v] of Object.entries(obj)) {
            if (['id', 'order', 'page_number', 'block_type', 'component_type', 'archetype', 'status', 'version'].includes(k)) continue;
            if (typeof v === 'string' && v.trim()) parts.push(v);
            else if (Array.isArray(v)) parts.push(this.extractFromObject(v));
        }
        return parts.join('\n\n');
    },

    parseContent(content) {
        if (!content) return {};
        if (typeof content === 'object') return content;
        if (typeof content === 'string') {
            try { return JSON.parse(content); }
            catch { return { text: content }; }
        }
        return {};
    },

    // 2. Comprehensive text sanitization
    sanitizeText(rawText) {
        if (!rawText) return '';
        let text = rawText;

        // Remove wrapping quotes if they encapsulate the entire string incorrectly
        if (text.startsWith('"') && text.endsWith('"') && text.length > 1) {
            text = text.slice(1, -1);
        }

        // Unescape escaped quotes and standalone newlines (preserving LaTeX commands like \neq, \not, \nu, \nabla)
        text = text.replace(/\\"/g, '"').replace(/\\n(?![a-zA-Z])/g, '\n');

        // Clean raw JSON artifacts that might have leaked
        text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
        if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
            try {
                const parsed = JSON.parse(text);
                text = parsed.text || parsed.content || parsed.explanation || text;
            } catch (e) {
                // Not valid JSON, keep as is
            }
        }

        // Remove duplicate spaces and excessive empty lines
        text = text.replace(/ {2,}/g, ' ');
        text = text.replace(/\n{3,}/g, '\n\n');

        // Strip research citation markers like [95], [88, 89], [91, 95, 96]
        text = text.replace(/\s*\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g, '');

        return text.trim();
    },

    // 3. Remove duplicate heading if it matches the block title
    removeDuplicateHeading(text, title) {
        if (!text) return '';
        let cleaned = text.trim();
        if (title) {
            const cleanTitle = title.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/^-\s*/, '').replace(/^Module\s*\d+(\.\d+)?:\s*/i, '').trim();
            const escapedTitle = this.escapeRegExp(cleanTitle);
            const headingRegex = new RegExp(`^(?:#+\\s+|\\*\\*|__)?(?:Module\\s*\\d+(\\.\\d+)?:\\s*)?${escapedTitle}(?:\\*\\*|__)?\\s*\\n+`, 'i');
            cleaned = cleaned.replace(headingRegex, '').trim();
        }
        // Also strip any top-of-block raw markdown heading if it duplicates the first line
        cleaned = cleaned.replace(/^(?:#+\s*|\*\*\s*)([^\n]+?)(?:\s*\*+|\s*#+)?\n+/, (match, h1) => {
            if (title && (h1.toLowerCase().includes(title.toLowerCase().slice(0, 12)) || title.toLowerCase().includes(h1.toLowerCase().slice(0, 12)))) {
                return '';
            }
            return match;
        });
        return cleaned.trim();
    },

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    // 4. Parse steps from a text blob (for Worked Example)
    parseSteps(text) {
        if (!text) return { intro: '', steps: [] };
        
        // Look for "Step 1:", "1.", "Step 1 -", etc.
        const stepRegex = /(?:Step\s+\d+[:.-]|\b\d+\.)\s+/ig;
        
        // If no steps found, return empty steps array
        if (!stepRegex.test(text)) return { intro: text, steps: [] };

        // Reset regex state
        stepRegex.lastIndex = 0;
        
        let splitText = text.split(stepRegex);
        let intro = '';
        let steps = [];
        
        // The first element might be introductory text
        if (splitText[0].trim()) {
            intro = splitText[0].trim();
        }
        
        // The rest are the actual steps
        for (let i = 1; i < splitText.length; i++) {
            if (splitText[i].trim()) {
                steps.push({ number: i, text: splitText[i].trim() });
            }
        }
        
        return { intro, steps };
    },

    // 5. Parse multiple choice options securely
    parseOptions(optionsRaw) {
        if (!optionsRaw) return [];
        if (Array.isArray(optionsRaw)) {
            return optionsRaw
                .map(o => typeof o === 'string' ? o.replace(/^[A-D][.):-]\s*/i, '').trim() : String(o))
                .filter(Boolean);
        }
        if (typeof optionsRaw === 'object' && optionsRaw !== null) {
            const keys = Object.keys(optionsRaw).sort();
            return keys
                .map(k => {
                    const val = optionsRaw[k];
                    return typeof val === 'string' ? val.replace(/^[A-D][.):-]\s*/i, '').trim() : String(val);
                })
                .filter(Boolean);
        }
        if (typeof optionsRaw === 'string') {
            try {
                const parsed = JSON.parse(optionsRaw);
                return this.parseOptions(parsed);
            } catch {
                if (optionsRaw.includes('\n')) {
                    return optionsRaw.split('\n').map(o => o.replace(/^[A-D][.):-]\s*/i, '').trim()).filter(Boolean);
                }
                if (optionsRaw.includes(',')) {
                    return optionsRaw.split(',').map(o => o.trim()).filter(Boolean);
                }
            }
        }
        return [];
    },

    // 6. Check if block has actual content
    hasContent(block) {
        if (!block) return false;
        
        const textContent = this.extractText(block.content);
        if (!textContent.trim() && !block.title) {
            // Keep media blocks even if text is empty (they will render an asset)
            const mediaTypes = ['suggested_diagram', 'suggested_video', 'image_placeholder', 'video_ref', 'suggested_image', 'suggested_illustration', 'suggested_infographic', 'repository_asset'];
            if (!mediaTypes.includes(block.block_type)) {
                return false;
            }
        }
        return true;
    }
};
