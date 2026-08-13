import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Target, Book, PenTool, AlertTriangle, PlayCircle, FlaskConical, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

const ensureMathDelimiters = (str) => {
  if (typeof str !== 'string') return str;
  let text = str.replace(/\\+\$/g, '$');
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 0) {
      let p = part;
      p = p.replace(/(?<![a-zA-Z0-9\\])\\(alpha|beta|gamma|lambda|Delta|sigma|mu|Omega|theta|pi|rho|tau|phi|omega)(?![a-zA-Z])/g, '$\\$1$');
      p = p.replace(/(\^\{[^\}]+\}_\{[^\}]+\}(?:\\text\{[^\}]+\})?)/g, '$$1$');
      p = p.replace(/\$\$+/g, '$');
      return p;
    }
    return part;
  }).join('');
};

const MD = ({ children, className = '' }) => {
  const rawContent = Array.isArray(children)
    ? children.map(child => (typeof child === 'string' ? child : String(child ?? ''))).join('')
    : (typeof children === 'string' ? children : String(children ?? ''));

  const content = ensureMathDelimiters(rawContent);

  return (
    <div className={`prose max-w-none text-gray-800 font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
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
                            <span>Answer submitted! You can now continue to the next concept.</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
