import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Target, Book, PenTool, AlertTriangle, PlayCircle, FlaskConical, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

const ensureMathDelimiters = (str) => {
  if (typeof str !== 'string' || !str) return str;
  let text = str.replace(/\\+\$/g, '$');

  // 1. Convert parenthetical math expressions like ((\Delta H^\circ_c)) into ($...$)
  text = text.replace(/\(\((\s*\\[a-zA-Z]+[^\(\)]*?)\)\)/g, '($$$1$$)');
  text = text.replace(/\(\((\s*\^[0-9]+_[0-9]+[^\(\)]*?)\)\)/g, '($$$1$$)');

  // 2. Normalize common corrupted LaTeX commands anywhere in text
  text = text.replace(/\\(?:xr\\)*xr\\rightarrow\{([^}]+)\}/g, '\\xrightarrow{$1}');
  text = text.replace(/\\(?:xr\\)*rightarrow\{([^}]+)\}/g, '\\xrightarrow{$1}');
  text = text.replace(/\\rightarrow\{([^}]+)\}/g, '\\xrightarrow{$1}');
  text = text.replace(/\\rightarrow\[([^\]]+)\]\{([^}]+)\}/g, '\\xrightarrow[$1]{$2}');
  text = text.replace(/\\(?:xr\\)*xr\\rightarrow\b/g, '\\rightarrow');
  text = text.replace(/\\xr\b/g, '');
  text = text.replace(/(\\\w+|\})\s*\*\s*\{(\([a-zA-Z]+\))\s*\}/g, '$1_$2');
  text = text.replace(/\*\s*\{(\([a-zA-Z]+\))\s*\}/g, '_$1');
  text = text.replace(/\\\_\{/g, '_{');
  text = text.replace(/\\\^\{/g, '^{');

  // 3. Remove isolated dollar signs around operators inside equations
  text = text.replace(/\$(?:\\rightarrow|\\rightleftharpoons|\\leftarrow|\\Delta|\\pm|\\times|\\approx)\$/g, (m) => m.slice(1, -1));

  // 4. Split content by existing display math ($$ ... $$) and inline math ($ ... $) blocks
  // to avoid EVER altering or double-wrapping content that is already inside math mode!
  const segments = text.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g);

  const processed = segments.map((segment, idx) => {
    // Odd index = already a valid $$ ... $$ or $ ... $ math block!
    if (idx % 2 === 1) {
      if (segment.startsWith('$$')) {
        let inner = segment.slice(2, -2).trim();
        inner = inner.replace(/^\$+|\$+$/g, '').trim();
        return `\n\n$$\n${inner}\n$$\n\n`;
      }
      return segment;
    }

    // Even index = regular markdown text outside math
    const lines = segment.split('\n');
    const processedLines = lines.map(line => {
      // Normalize unicode square roots and math operators before equation check
      let cleanTrimmed = trimmed
        .replace(/√\(([^\)]+)\)/g, '\\sqrt{$1}')
        .replace(/√([0-9a-zA-Z]+)/g, '\\sqrt{$1}');

      // Check if this line is an unbracketed standalone chemical / mathematical equation
      const hasMathCommand = /\\(?:propto|implies|iff|frac|sqrt|times|cdot|approx|equiv|sum|int|partial|Delta|rho|alpha|beta|gamma|theta|lambda|sigma|omega|pi|mu|nu|pm|mp|le|ge|leq|geq|neq|ne|quad|qquad|left|right|over|choose|text|circ|degree|rightarrow|leftarrow|rightleftharpoons|xrightarrow|xleftarrow)\b/.test(cleanTrimmed);
      const isStandaloneEquation = (
        hasMathCommand ||
        /^[a-zA-Z0-9_\^\(\)\s\+\-\*\/\.\{\}\\]*(=|∝|→|⇌|\\implies|\\approx)[a-zA-Z0-9_\^\(\)\s\+\-\*\/\.\{\}\\]+$/.test(cleanTrimmed)
      );

      const isProseSentence = /^(?:For|If|When|Where|Note|Since|Then|According|Therefore|Thus|Hence|Step|Given|The|A|An|Let)\b/i.test(cleanTrimmed);

      if (isStandaloneEquation && !isProseSentence) {
        return `\n\n$$\n${cleanTrimmed}\n$$\n\n`;
      }

      // Check if line is a bullet item with an unbracketed equation: e.g. "- \text{C} + \text{O}_2 \rightarrow ..."
      const bulletMatch = line.match(/^(\s*(?:[-*]|\d+\.)\s*)(.*)$/);
      if (bulletMatch) {
        const prefix = bulletMatch[1];
        let rest = bulletMatch[2].trim()
          .replace(/√\(([^\)]+)\)/g, '\\sqrt{$1}')
          .replace(/√([0-9a-zA-Z]+)/g, '\\sqrt{$1}');
        if (hasMathCommand && !/^(?:For|If|When|Where|Note|Since|Then|The|A|An|Let)\b/i.test(rest)) {
          return `${prefix}$${rest}$`;
        }
      }

      // In regular prose, normalize unicode square roots
      let p = line
        .replace(/√\(([^\)]+)\)/g, '$\\sqrt{$1}$')
        .replace(/(?<![\$\w])√([0-9a-zA-Z]+)/g, '$\\sqrt{$1}$');

      // Replace unbracketed LaTeX fractions or square roots in prose
      p = p.replace(/(?<!\$)\\(?:frac|sqrt)\{(?:[^{}]+|\{[^{}]*\})*\}(?:\{(?:[^{}]+|\{[^{}]*\})*\})?(?!\$)/g, (m) => `$${m}$`);

      // Replace unbracketed math operators in prose
      p = p.replace(/(?<![\$\\])\\(times|approx|implies|propto|pm|mp|div|le|ge|leq|geq|neq|ne|cdot|Delta)\b(?!\$)/g, '$$\\$1$$');

      // Replace un-delimited variable subscripts like V_1, T_1, P_1, t_2, R_A, M_r, M_B
      p = p.replace(/(?<![\$\w\\])\b([a-zA-Z])_([0-9a-zA-Z]+)\b(?![\$\w])/g, '$$$1_$2$$');

      // Inline standalone chemical formulas like \text{NaOH} or \text{SO}_2
      p = p.replace(/(?<!\$)(?:\\text\{[a-zA-Z0-9_\(\)\+\-\s]+\}(?:[_\^]\{[^\}]+\})?\s*)+(?!\$)/g, (m) => `$${m.trim()}$`);

      // Replace isolated un-delimited Greek symbols in prose
      p = p.replace(/(?<![\$\\])\\(rho|alpha|beta|gamma|theta|lambda|pi|mu|sigma|omega|Phi)\b(?!\$)/g, '$$\\$1$$');

      // Replace isolated un-delimited degree notations like ^\circ or ^\circ\text{C}
      p = p.replace(/(?<![\$\\])\^\\circ(?:\\text\{C\})?/g, (m) => `$${m}$`);

      return p;
    });

    return processedLines.join('\n');
  });

  let result = processed.join('');
  result = result.replace(/\n{3,}/g, '\n\n');
  return result.trim();
};

const normalizeMarkdownText = (rawStr) => {
  if (!rawStr || typeof rawStr !== 'string') return rawStr;
  let text = rawStr;
  // Convert lines starting with bullet character (• or \u2022) to markdown list item (- )
  text = text.replace(/^[ \t]*[•\u2022][ \t]*/gm, '- ');
  // Convert inline bullets separated by spaces or punctuation into new line list items
  text = text.replace(/([^\n])[ \t]+[•\u2022][ \t]+/g, '$1\n- ');
  // Strip accidental 4+ space indentation that turns regular text into <pre><code> blocks
  text = text.replace(/^[ \t]{4,}(?![*\-\d]\s)([^\n]+)/gm, '$1');
  // Ensure a blank line before the first list item IF preceded by a regular paragraph line
  text = text.replace(/^([^\n\-\*\d\>#][^\n]*)\n(- |\* )/gm, '$1\n\n$2');
  return ensureMathDelimiters(text);
};

const MD = ({ children, className = '' }) => {
  const rawContent = Array.isArray(children)
    ? children.map(child => (typeof child === 'string' ? child : String(child ?? ''))).join('')
    : (typeof children === 'string' ? children : String(children ?? ''));

  const content = normalizeMarkdownText(rawContent);

  return (
    <div className={`prose max-w-none text-gray-800 font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          p: ({ node, ...props }) => <p className="mb-4 sm:mb-6 text-gray-800 leading-relaxed font-sans text-base sm:text-lg md:text-xl" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 sm:ml-8 mb-4 sm:mb-6 space-y-2 text-gray-800 font-sans text-base sm:text-lg md:text-xl" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 sm:ml-8 mb-4 sm:mb-6 space-y-2 text-gray-800 font-sans text-base sm:text-lg md:text-xl" {...props} />,
          li: ({ node, ...props }) => <li className="text-gray-800 font-sans text-base sm:text-lg md:text-xl leading-relaxed pl-1" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const getMarkdownText = (content) => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
        return content.text || content.content || content.procedure || JSON.stringify(content);
    }
    return String(content || '');
};

export const OverviewBlock = ({ block }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-8 rounded-2xl my-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <Target className="text-indigo-500 w-8 h-8 shrink-0" />
            <h2 className="text-2xl font-extrabold text-indigo-900 m-0">{block.title || 'Learning Goal'}</h2>
        </div>
        <div className="prose prose-lg text-indigo-800 leading-relaxed max-w-none">
            <MD>{getMarkdownText(block.content)}</MD>
        </div>
    </div>
);

export const ObjectiveBlock = ({ block }) => (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-8 rounded-2xl my-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <Target className="text-emerald-500 w-8 h-8 shrink-0" />
            <h2 className="text-2xl font-extrabold text-emerald-900 m-0">{block.title || 'Learning Objectives'}</h2>
        </div>
        <div className="prose prose-lg text-emerald-800 leading-relaxed max-w-none">
            <MD>{getMarkdownText(block.content)}</MD>
        </div>
    </div>
);

export const DefinitionBlock = ({ block }) => (
    <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl my-8 shadow-sm flex gap-4">
        <Book className="text-amber-500 w-8 h-8 shrink-0" />
        <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-2">{block.title || 'Definition'}</h3>
            <div className="prose text-amber-800 max-w-none">
                <MD>{getMarkdownText(block.content)}</MD>
            </div>
        </div>
    </div>
);

export const CoreExplanationBlock = ({ block }) => {
    let text = block.content;
    let resourceUrl = null;
    let resourceTitle = null;

    if (typeof text === 'string') {
        try {
            const parsed = JSON.parse(text);
            text = parsed.text || parsed.content || parsed.procedure || "";
            resourceUrl = parsed.resource_url;
            resourceTitle = parsed.resource_title;
        } catch (e) { }
    } else if (typeof text === 'object' && text !== null) {
        resourceUrl = text.resource_url;
        resourceTitle = text.resource_title;
        text = text.text || text.content || text.procedure || JSON.stringify(text);
    }

    const isExample = block.title && block.title.toLowerCase().includes('example');
    
    if (isExample) {
        return (
            <div className="my-10 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                    <PenTool className="text-gray-500 w-6 h-6 shrink-0" />
                    <h2 className="text-lg font-bold text-gray-800 m-0">{block.title}</h2>
                </div>
                <div className="p-6 prose prose-lg max-w-none text-gray-700">
                    <MD>{text}</MD>
                </div>
            </div>
        );
    }

    const isCallout = block.title && (block.title.toLowerCase().includes('important') || block.title.toLowerCase().includes('tip'));
    if (isCallout) {
        return (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-2xl my-8 shadow-sm flex gap-4">
                <AlertTriangle className="text-rose-500 w-8 h-8 shrink-0" />
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-rose-900 mb-2">{block.title}</h3>
                    <div className="prose text-rose-800 max-w-none">
                        <MD>{text}</MD>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-10">
            {block.title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{block.title}</h2>}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <MD>{text}</MD>
            </div>
            {resourceUrl && (
                <div className="mt-8 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-gray-900">
                    <div className="px-5 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                        <span className="font-semibold text-gray-200 text-sm flex items-center gap-2">
                            <PlayCircle className="text-red-500 w-4 h-4 shrink-0" /> {resourceTitle || 'Attached Video Resource'}
                        </span>
                    </div>
                    <iframe 
                        src={`https://customer-f3f5ea5649bdbda7222f0b9365a22845.cloudflarestream.com/${resourceUrl}/iframe`}
                        className="w-full aspect-video"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export const ExperimentBlock = ({ block }) => {
    const content = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
    return (
        <div className="bg-purple-50 border border-purple-100 p-8 rounded-2xl my-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <FlaskConical className="text-purple-500 w-8 h-8 shrink-0" />
                <h2 className="text-xl font-bold text-purple-900 m-0">{block.title || 'Experiment'}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-bold text-purple-800 mb-2 uppercase text-xs tracking-wider">Purpose</h3>
                    <p className="text-purple-900 bg-white/60 p-4 rounded-xl border border-purple-100">{content.purpose}</p>
                    
                    <h3 className="font-bold text-purple-800 mt-6 mb-2 uppercase text-xs tracking-wider">Expected Observations</h3>
                    <p className="text-purple-900 bg-white/60 p-4 rounded-xl border border-purple-100">{content.expected_observations}</p>
                </div>
                <div>
                    <h3 className="font-bold text-purple-800 mb-2 uppercase text-xs tracking-wider">Procedure</h3>
                    <div className="prose prose-sm max-w-none text-purple-900 bg-white/60 p-4 rounded-xl border border-purple-100">
                        <MD>{getMarkdownText(content.procedure)}</MD>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SummaryBlock = ({ block }) => (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 p-8 rounded-2xl my-12 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-gray-500 w-8 h-8 shrink-0" />
            <h2 className="text-xl font-bold text-gray-800 m-0">{block.title || 'Key Takeaways'}</h2>
        </div>
        <div className="prose prose-lg text-gray-700 max-w-none">
            <MD>{getMarkdownText(block.content)}</MD>
        </div>
    </div>
);

export const RevisionQuestionsBlock = ({ block, onInteract }) => {
    const [interacted, setInteracted] = React.useState(false);
    
    const handleInteract = (e) => {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        setInteracted(true);
        if (onInteract) onInteract(block.id);
    };

    return (
        <div className="bg-white border border-indigo-100 p-8 rounded-2xl my-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
            <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="text-indigo-500 w-8 h-8 shrink-0" />
                <h2 className="text-xl font-bold text-indigo-900 m-0">{block.title || 'Knowledge Check'}</h2>
            </div>
            
            {!interacted ? (
                <div className="space-y-6">
                    <div className="prose prose-lg text-gray-800 max-w-none">
                        <MD>{getMarkdownText(block.content)}</MD>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Your Answer</label>
                        <textarea 
                            className="w-full p-4 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white"
                            rows="3"
                            placeholder="Think about your answer and write it here..."
                        ></textarea>
                    </div>
                    <button 
                        type="button"
                        onClick={handleInteract}
                        className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md w-full sm:w-auto cursor-pointer"
                    >
                        Submit & Check Answer
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-slide-up-fade">
                    <div className="prose prose-lg text-gray-800 max-w-none">
                        <MD>{getMarkdownText(block.content)}</MD>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200">
                        <p className="text-emerald-800 font-semibold flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" /> 
                            <span>Answer submitted! You can now continue to the next section.</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
