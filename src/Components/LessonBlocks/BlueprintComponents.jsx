import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import BASE_URL from '../../config';
import { ContentNormalizer } from '../../utils/ContentNormalizer';
import {
  Target, Book, PenTool, Lightbulb, AlertTriangle, XCircle, Zap, Star, BrainCircuit, Globe, Hand, FlaskConical, Sparkles, CheckCircle2, PlayCircle, BarChart, Image as ImageIcon, MonitorPlay, Link2, BookOpen, Check, X
} from 'lucide-react';

// ─── Content extraction helper ───────────────────────────────────────────────
const text = (c) => ContentNormalizer.sanitizeText(ContentNormalizer.extractText(c));
const parseContent = (c) => ContentNormalizer.parseContent(c);

const ensureMathDelimiters = (str) => {
  if (typeof str !== 'string') return str;
  let text = str.replace(/\\+\$/g, '$');
  
  // 1. Convert parenthetical math expressions like ((\Delta H^\circ_c)) or ((\text{pH})) into ($...$)
  text = text.replace(/\(\((\s*\\[a-zA-Z]+[^\(\)]*?)\)\)/g, '($$$1$$)');
  text = text.replace(/\(\((\s*\^[0-9]+_[0-9]+[^\(\)]*?)\)\)/g, '($$$1$$)');
  
  // 2. Fix corrupted 'eq \text' -> '\neq \text'
  text = text.replace(/(?<![a-zA-Z0-9\\])eq\s+(\\text\{)/g, '\\neq $1');
  text = text.replace(/(?<![a-zA-Z0-9\\])eq\s+(\\[a-zA-Z]+)/g, '\\neq $1');
  
  // 3. Process non-math parts
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 0) {
      let p = part;
      // Convert single raw Greek letters or standard math symbols outside $ into $symbol$
      p = p.replace(/(?<![a-zA-Z0-9\\])\\(alpha|beta|gamma|lambda|Delta|sigma|mu|Omega|theta|pi|rho|tau|phi|omega|times|rightarrow|leftarrow|approx|neq|leq|geq|pm)(?![a-zA-Z])/g, '$\\$1$');
      // Convert isotope notation e.g. ^{235}_{92}\text{U} outside $ into $...$
      p = p.replace(/(?<!\$)\^\{?([0-9]+)\}?_\{?([0-9]+)\}?(\\text\{[^\}]+\})?(?!\$)/g, '$$^{$1}_{$2}$3$$');
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
    <div className={`prose prose-stone max-w-[70ch] leading-relaxed text-gray-800 font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          p: ({ node, ...props }) => <p className="mb-6 text-gray-800 leading-relaxed font-sans text-lg md:text-xl" {...props} />,
          li: ({ node, ...props }) => <li className="mb-2 text-gray-800 font-sans text-lg md:text-xl" {...props} />,
          pre: ({ node, children, ...props }) => (
            <div className="my-8 bg-slate-950 text-emerald-400 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden font-mono text-xs md:text-sm leading-snug">
              <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-widest font-sans">
                  Visual Graph / Diagram
                </span>
              </div>
              <div className="p-5 md:p-6 overflow-x-auto whitespace-pre font-mono">
                {children}
              </div>
            </div>
          ),
          code: ({ node, inline, children, ...props }) => 
            inline ? (
              <code className="bg-slate-100 border border-slate-200 text-slate-900 px-1.5 py-0.5 rounded text-base font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className="font-mono whitespace-pre text-emerald-400" {...props}>
                {children}
              </code>
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// ─── Component Header Helper ──────────────────────────────────────────────────
const BlockHeader = ({ icon: Icon, label, title, colorClass = "text-gray-500", iconClass = "" }) => (
  <div className="mb-4">
    <div className="flex items-center gap-3 mb-3">
      {Icon && <Icon className={`w-6 h-6 ${iconClass || colorClass}`} strokeWidth={1} />}
      {label && <span className={`text-xs font-bold uppercase tracking-[0.15em] ${colorClass}`}>{label}</span>}
    </div>
    {title && <MD className="text-2xl font-sans font-semibold text-gray-900 !max-w-none">{title}</MD>}
  </div>
);

// ─── Learning Goal ────────────────────────────────────────────────────────────
export const LearningGoalBlock = ({ block }) => {
  const c = parseContent(block.content);
  let goalText = '';
  if (c.goals && Array.isArray(c.goals)) {
    const titlePrefix = c.title ? `**${c.title}**\n\n` : '';
    goalText = titlePrefix + c.goals.map(g => `- ${g}`).join('\n');
  } else if (c.items && Array.isArray(c.items)) {
    const titlePrefix = c.title ? `**${c.title}**\n\n` : '';
    goalText = titlePrefix + c.items.map(it => `- ${it}`).join('\n');
  } else {
    goalText = c.text || c.body || c.content || text(block.content);
  }

  return (
    <div className="my-12 p-8 bg-blue-50/60 border border-blue-100/80 rounded-3xl">
      <BlockHeader icon={Target} label="By the end of this concept" colorClass="text-custom-blue" />
      <MD className="text-gray-900 font-medium text-xl leading-relaxed font-sans max-w-[70ch]">{goalText}</MD>
    </div>
  );
};

// ─── Concept Explanation ──────────────────────────────────────────────────────
export const ConceptExplanationBlock = ({ block }) => {
  const c = parseContent(block.content);
  const rawText = c.body || c.text || c.content || text(block.content);
  const blockTitle = block.title && block.title !== 'None' ? block.title : (c.title || '');
  return (
    <div className="my-12">
      <MD className="text-gray-800 text-xl leading-relaxed font-sans">
        {ContentNormalizer.removeDuplicateHeading(rawText, blockTitle)}
      </MD>
    </div>
  );
};

// ─── Definition Card ──────────────────────────────────────────────────────────
export const DefinitionCardBlock = ({ block }) => {
  const c = parseContent(block.content);
  const term = c.term || (block.title && block.title !== 'None' ? block.title : (c.title || 'Definition'));
  const definition = c.content || c.body || c.text || c.definition || text(block.content);
  return (
    <div className="my-12 bg-amber-50/60 border border-amber-200/60 rounded-3xl p-8">
      <BlockHeader icon={Book} label="Definition" title={term} colorClass="text-amber-800" />
      <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{definition}</MD>
    </div>
  );
};

// ─── Worked Example ───────────────────────────────────────────────────────────
export const WorkedExampleBlock = ({ block }) => {
  const c = parseContent(block.content);
  const rawText = text(block.content);
  
  let intro = '';
  let steps = [];
  
  if (c.steps && Array.isArray(c.steps)) {
    intro = c.intro || c.problem || c.question || '';
    steps = c.steps.map((s, i) => ({ number: i + 1, text: typeof s === 'string' ? s : JSON.stringify(s) }));
  } else {
    const parsed = ContentNormalizer.parseSteps(rawText);
    intro = parsed.intro;
    steps = parsed.steps;
  }
  
  const cleanTitle = (block.title && block.title !== 'None') ? block.title : (c.title || 'Worked Example');
  const cleanIntro = ContentNormalizer.removeDuplicateHeading(intro, cleanTitle);
  
  return (
    <div className="my-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
      <BlockHeader icon={PenTool} label="Worked Example" title={cleanTitle} colorClass="text-custom-blue" />
      
      <div className="mt-8">
        {cleanIntro && <MD className="text-gray-800 text-xl leading-relaxed mb-10">{cleanIntro}</MD>}
        
        {steps.length > 0 ? (
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-5 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-custom-blue text-white font-bold flex items-center justify-center shrink-0 text-base font-sans">
                  {step.number}
                </div>
                <div className="flex-1 mt-1">
                  <MD className="text-gray-800 text-xl leading-relaxed">{step.text}</MD>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MD className="text-gray-800 text-xl leading-relaxed">{rawText}</MD>
        )}
      </div>
    </div>
  );
};

// ─── Analogy ──────────────────────────────────────────────────────────────────
export const AnalogyBlock = ({ block }) => (
  <div className="my-12 bg-purple-50/60 border border-purple-100 rounded-3xl p-8">
    <BlockHeader icon={Lightbulb} label="Think of it this way" colorClass="text-purple-700" />
    <MD className="text-gray-900 text-xl leading-relaxed italic font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Common Misconception ─────────────────────────────────────────────────────
export const CommonMisconceptionBlock = ({ block }) => (
  <div className="my-12 bg-rose-50/60 border border-rose-200/60 rounded-3xl p-8">
    <BlockHeader icon={AlertTriangle} label="Common Misconception" colorClass="text-rose-700" />
    <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Common Mistake (action-oriented) ────────────────────────────────────────
export const CommonMistakeBlock = ({ block }) => (
  <div className="my-12 bg-rose-50/60 border border-rose-200/60 rounded-3xl p-8">
    <BlockHeader icon={XCircle} label="Watch Out" colorClass="text-rose-700" />
    <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Callout ──────────────────────────────────────────────────────────────────
export const CalloutBlock = ({ block }) => (
  <div className="my-12 bg-blue-50/60 border border-blue-200/60 rounded-3xl p-8">
    <BlockHeader icon={Hand} label="Important" colorClass="text-custom-blue" />
    <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Quick Fact ───────────────────────────────────────────────────────────────
export const QuickFactBlock = ({ block }) => (
  <div className="my-12 bg-amber-50/60 border border-amber-200/60 rounded-3xl p-8">
    <BlockHeader icon={Zap} label="Quick Fact" colorClass="text-amber-800" />
    <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Did You Know ─────────────────────────────────────────────────────────────
export const DidYouKnowBlock = ({ block }) => (
  <div className="my-12 bg-amber-50/60 border border-amber-200/60 rounded-3xl p-8">
    <BlockHeader icon={Star} label="Did you know?" colorClass="text-amber-800" />
    <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Memory Tip ───────────────────────────────────────────────────────────────
export const MemoryTipBlock = ({ block }) => (
  <div className="my-12 bg-amber-50/60 border border-amber-200/60 rounded-3xl p-8">
    <BlockHeader icon={BrainCircuit} label="Memory tip" colorClass="text-amber-800" />
    <MD className="text-gray-900 text-xl leading-relaxed italic font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Real World Connection ────────────────────────────────────────────────────
export const RealWorldConnectionBlock = ({ block }) => (
  <div className="my-12 bg-emerald-50/60 border border-emerald-200/60 rounded-3xl p-8">
    <BlockHeader icon={Globe} label="In the real world" colorClass="text-emerald-800" />
    <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

export const RealWorldExampleBlock = ({ block }) => (
  <RealWorldConnectionBlock block={block} />
);

// ─── Reflection ───────────────────────────────────────────────────────────────
export const ReflectionBlock = ({ block }) => (
  <div className="my-16 max-w-[70ch] mx-auto text-center bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
    <BlockHeader label="Pause & Reflect" colorClass="text-amber-800 justify-center" />
    <MD className="text-gray-900 text-2xl font-medium leading-relaxed italic font-sans">{text(block.content)}</MD>
  </div>
);

// ─── Prediction ───────────────────────────────────────────────────────────────
export const PredictionBlock = ({ block }) => (
  <div className="my-16 bg-white border border-amber-200/80 rounded-3xl p-8 shadow-sm max-w-[70ch]">
    <BlockHeader label="Make a Prediction" colorClass="text-amber-800" />
    <MD className="text-gray-900 text-xl leading-relaxed font-sans mb-6">{text(block.content)}</MD>
    <p className="text-amber-700 text-xs font-bold font-sans uppercase tracking-[0.15em]">Keep your answer in mind as you continue.</p>
  </div>
);

// ─── Mini Activity ────────────────────────────────────────────────────────────
export const MiniActivityBlock = ({ block }) => {
  const c = parseContent(block.content);
  const title = c.title || (block.title && block.title !== 'None' ? block.title : 'Try This');
  const instruction = c.content || c.text || c.instruction || text(block.content);
  return (
    <div className="my-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
      <BlockHeader icon={FlaskConical} label="Mini Activity" title={title} colorClass="text-emerald-700" />
      <div className="mt-6">
        <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{instruction}</MD>
      </div>
    </div>
  );
};

// ─── Formula Breakdown ────────────────────────────────────────────────────────
export const FormulaBreakdownBlock = ({ block }) => {
  const c = parseContent(block.content);
  let formula = c.formula || (block.title && block.title !== 'None' ? block.title : '');
  
  let breakdown = c.breakdown || c.content || c.body || c.text || c.explanation || '';
  if (!breakdown && c.variables && typeof c.variables === 'object') {
    breakdown = Object.entries(c.variables)
      .map(([k, v]) => `- **$${k.replace(/^\$+|\$+$/g, '')}$**: ${v}`)
      .join('\n\n');
  }
  if (!breakdown) breakdown = text(block.content);

  // If formula is provided as raw LaTeX without delimiters, wrap in $$ for KaTeX rendering
  if (formula && typeof formula === 'string' && !formula.includes('$')) {
    formula = `$$${formula}$$`;
  }

  return (
    <div className="my-16 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-200/80">
      <BlockHeader label="Key Formula" colorClass="text-custom-blue" />
      {formula && (
        <div className="bg-slate-50 p-6 md:p-10 rounded-3xl text-center mb-8 border border-slate-200/80 flex flex-col items-center justify-center overflow-x-auto">
          <MD className="text-gray-900 text-2xl md:text-3xl font-semibold !max-w-none w-full flex justify-center text-center">{formula}</MD>
        </div>
      )}
      <div>
        <BlockHeader label="What Each Part Means" colorClass="text-gray-500" />
        <MD className="text-gray-800 text-lg md:text-xl font-sans mt-4">{breakdown}</MD>
      </div>
    </div>
  );
};

// ─── Key Takeaway ─────────────────────────────────────────────────────────────
export const KeyTakeawayBlock = ({ block }) => (
  <div className="my-16 bg-emerald-50/70 border border-emerald-200/60 rounded-3xl p-8">
    <BlockHeader icon={Sparkles} label="Key Takeaway" colorClass="text-emerald-800" />
    <MD className="text-emerald-900 font-bold text-2xl leading-relaxed font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Before You Continue ──────────────────────────────────────────────────────
export const BeforeYouContinueBlock = ({ block }) => (
  <div className="my-12 bg-white rounded-3xl p-8 shadow-2xs border border-amber-200">
    <BlockHeader icon={Hand} label="Before you continue" colorClass="text-amber-800" />
    <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{text(block.content)}</MD>
  </div>
);

// ─── Summary ──────────────────────────────────────────────────────────────────
export const SummaryBlock = ({ block }) => (
  <div className="my-16 bg-blue-50/40 border border-blue-100/80 rounded-3xl p-8">
    <BlockHeader label="Summary" colorClass="text-custom-blue" />
    <MD className="text-gray-800 text-xl font-sans">{text(block.content)}</MD>
  </div>
);

// ─── Transition ───────────────────────────────────────────────────────────────
export const TransitionBlock = ({ block }) => (
  <div className="my-20 flex items-center justify-center gap-6 max-w-[70ch] mx-auto">
    <div className="flex-1 h-px bg-gray-200" />
    <p className="text-sm font-sans text-gray-400 text-center max-w-sm leading-relaxed">{text(block.content)}</p>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

// ─── Knowledge Check ──────────────────────────────────────────────────────────
export const KnowledgeCheckBlock = ({ block, onInteract }) => {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);

  const c = parseContent(block.content);
  const options = ContentNormalizer.parseOptions(c.options || c.options_list);
  const checkType = c.check_type || (options.length > 0 ? 'multiple_choice' : 'short_answer');
  const question = c.question || c.content || text(block.content);
  const answer = c.answer || c.correct_answer || c.correct;

  const handleSubmit = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    setRevealed(true);
    if (onInteract) onInteract(block.id);
  };

  const selectedIndex = selected ? selected.charCodeAt(0) - 65 : -1;
  const normalizedAnswer = typeof answer === 'string' ? answer.trim().toUpperCase() : '';
  const isCorrect = selected !== null && (
    selected === answer || 
    selected === normalizedAnswer ||
    (selectedIndex >= 0 && (options[selectedIndex] === answer || String.fromCharCode(65 + selectedIndex) === normalizedAnswer))
  );

  return (
    <div className="my-16 bg-white rounded-3xl shadow-sm p-8 border border-gray-200/80">
      <BlockHeader label="Check Your Understanding" colorClass="text-custom-blue" />
      <MD className="text-gray-900 font-semibold text-2xl mb-10 font-sans max-w-[70ch] leading-snug">{question}</MD>

      {/* Multiple choice */}
      {options.length > 0 && (
        <div className="space-y-4 mb-10">
          {options.map((opt, i) => {
            const label = String.fromCharCode(65 + i);
            const isSelected = selected === label;
            const isRight = revealed && (label === answer || label === normalizedAnswer || opt === answer);
            const isWrong = revealed && isSelected && !isRight;
            
            let cardClasses = 'bg-white border-gray-200 text-gray-800 hover:border-custom-blue hover:bg-blue-50/30';
            let iconElement = <div className="w-6 h-6 rounded-full border border-gray-300 shrink-0 mt-0.5" />;
            
            if (isRight) {
              cardClasses = 'bg-emerald-50/80 border-emerald-500 text-emerald-900';
              iconElement = <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" strokeWidth={1.5} />;
            } else if (isWrong) {
              cardClasses = 'bg-rose-50/80 border-rose-300 text-rose-900';
              iconElement = <XCircle className="w-6 h-6 text-rose-600 shrink-0" strokeWidth={1.5} />;
            } else if (isSelected) {
              cardClasses = 'bg-blue-50/60 border-custom-blue text-gray-900 shadow-[0_0_0_1px_#02a0bf]';
              iconElement = <div className="w-6 h-6 rounded-full border border-custom-blue shrink-0 flex items-center justify-center mt-0.5"><div className="w-3 h-3 rounded-full bg-custom-blue" /></div>;
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => !revealed && setSelected(label)}
                className={`w-full text-left px-6 py-5 rounded-3xl border transition-all flex items-start gap-5 min-h-[4rem] cursor-pointer ${cardClasses}`}
              >
                {iconElement}
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${isRight || isSelected ? 'text-inherit' : 'text-gray-400'}`}>{label}.</span>
                    <MD className="text-xl font-medium font-sans leading-snug">{opt}</MD>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* True / False */}
      {checkType === 'true_false' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {['True', 'False'].map((opt) => {
            const val = opt === 'True';
            const isSelected = selected === val;
            const isRight = revealed && val === answer;
            const isWrong = revealed && isSelected && val !== answer;
            
            let cardClasses = 'bg-white border-gray-200 text-gray-800 hover:border-custom-blue hover:bg-blue-50/30';
            let iconElement = <div className="w-6 h-6 rounded-full border border-gray-300 shrink-0" />;
            
            if (isRight) {
              cardClasses = 'bg-emerald-50/80 border-emerald-500 text-emerald-900';
              iconElement = <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" strokeWidth={1.5} />;
            } else if (isWrong) {
              cardClasses = 'bg-rose-50/80 border-rose-300 text-rose-900';
              iconElement = <XCircle className="w-6 h-6 text-rose-600 shrink-0" strokeWidth={1.5} />;
            } else if (isSelected) {
              cardClasses = 'bg-blue-50/60 border-custom-blue text-gray-900 shadow-[0_0_0_1px_#02a0bf]';
              iconElement = <div className="w-6 h-6 rounded-full border border-custom-blue shrink-0 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-custom-blue" /></div>;
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => !revealed && setSelected(val)}
                className={`flex-1 flex justify-center items-center gap-3 py-6 rounded-3xl border font-bold text-xl font-sans transition-all min-h-[4rem] cursor-pointer ${cardClasses}`}
              >
                {iconElement}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Short answer / predict / explain */}
      {(checkType === 'short_answer' || checkType === 'predict_outcome' || checkType === 'explain_in_words' || checkType === 'fill_blank') && !revealed && (
        <textarea
          className="w-full border border-gray-300 rounded-3xl p-6 text-xl text-gray-900 focus:border-custom-blue focus:ring-1 focus:ring-custom-blue transition resize-none mb-10 font-sans bg-gray-50"
          rows={4}
          placeholder="Write your answer here…"
        />
      )}

      {!revealed ? (
        <button
          type="button"
          onClick={handleSubmit}
          className="px-8 py-4 bg-custom-blue text-white rounded-full text-base font-bold transition font-sans hover:bg-blue-700 flex items-center justify-center cursor-pointer shadow-md w-full sm:w-auto"
        >
          Submit Answer
          <Check className="ml-2 w-5 h-5" strokeWidth={2} />
        </button>
      ) : (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className={`p-8 rounded-3xl flex items-start gap-5 ${isCorrect || !(checkType === 'multiple_choice' || checkType === 'true_false') ? 'bg-emerald-50/80 border border-emerald-200' : 'bg-rose-50/80 border border-rose-200'}`}>
            {(isCorrect || !(checkType === 'multiple_choice' || checkType === 'true_false')) ? (
              <CheckCircle2 className="text-emerald-600 w-8 h-8 shrink-0 mt-0.5" strokeWidth={1} />
            ) : (
              <XCircle className="text-rose-600 w-8 h-8 shrink-0 mt-0.5" strokeWidth={1} />
            )}
            <div>
              <p className={`text-xl font-bold font-sans mb-2 ${(isCorrect || !(checkType === 'multiple_choice' || checkType === 'true_false')) ? 'text-emerald-900' : 'text-rose-900'}`}>
                {(checkType === 'multiple_choice' || checkType === 'true_false') && isCorrect
                  ? 'Correct! Well done.'
                  : (checkType === 'multiple_choice' || checkType === 'true_false') && !isCorrect
                  ? 'Not quite.'
                  : 'Answer noted. Continue when ready.'}
              </p>
              {!(checkType === 'multiple_choice' || checkType === 'true_false') && !isCorrect && (
                <MD className="text-gray-800 text-lg font-sans">The correct answer was {answer}.</MD>
              )}
            </div>
          </div>
          {(c.explanation || (!(checkType === 'multiple_choice' || checkType === 'true_false') && answer)) && (
              <div className="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm">
                  <BlockHeader label="Explanation & Analysis" colorClass="text-gray-500" />
                  <MD className="text-gray-800 text-xl leading-relaxed font-sans max-w-[70ch]">{c.explanation || answer}</MD>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Suggested Media ─────────────────────────────────────────────────────────
const MEDIA_CONFIG = {
  diagram:              { icon: BarChart, label: 'Diagram', color: 'blue',   desc: 'A labelled diagram is attached to this concept.' },
  image:                { icon: ImageIcon, label: 'Image',   color: 'violet', desc: 'An image is attached to this concept.' },
  suggested_diagram:    { icon: BarChart, label: 'Diagram', color: 'blue',   desc: 'A labelled diagram is planned for this concept.' },
  suggested_video:      { icon: PlayCircle, label: 'Video Resource', color: 'red', desc: 'A video resource is planned for this concept.' },
  suggested_image:      { icon: ImageIcon, label: 'Image',   color: 'violet', desc: 'An illustration is planned for this concept.' },
  suggested_simulation: { icon: FlaskConical, label: 'Interactive Simulation', color: 'cyan', desc: 'An interactive simulation is planned for this concept.' },
  suggested_gif:        { icon: MonitorPlay, label: 'Animation', color: 'teal', desc: 'An animation is planned for this concept.' },
  suggested_activity:   { icon: FlaskConical, label: 'Activity', color: 'green', desc: 'A hands-on activity is planned for this concept.' },
  suggested_external_link: { icon: Link2, label: 'Resource', color: 'slate', desc: 'An external resource is planned for this concept.' },
  repository_asset:     { icon: BookOpen, label: 'Repository Asset', color: 'gray', desc: 'A repository asset is linked to this concept.' },
  suggested_illustration: { icon: ImageIcon, label: 'Illustration', color: 'violet', desc: 'An illustration is planned for this concept.' },
  suggested_infographic:  { icon: ImageIcon, label: 'Infographic', color: 'violet', desc: 'An infographic is planned for this concept.' },
  suggested_table:        { icon: BarChart, label: 'Table', color: 'blue', desc: 'A data table is planned for this concept.' },
  suggested_graph:        { icon: BarChart, label: 'Graph', color: 'blue', desc: 'A graph is planned for this concept.' },
  suggested_timeline:     { icon: BarChart, label: 'Timeline', color: 'blue', desc: 'A timeline is planned for this concept.' },
  suggested_flowchart:    { icon: BarChart, label: 'Flowchart', color: 'blue', desc: 'A flowchart is planned for this concept.' },
  suggested_mind_map:     { icon: BarChart, label: 'Mind Map', color: 'blue', desc: 'A mind map is planned for this concept.' },
  image_placeholder:      { icon: ImageIcon, label: 'Image', color: 'violet', desc: 'An image is attached to this concept.' },
  diagram_placeholder:    { icon: BarChart, label: 'Diagram', color: 'blue', desc: 'A diagram is attached to this concept.' },
  video_ref:              { icon: PlayCircle, label: 'Video', color: 'red', desc: 'A video resource is attached to this concept.' },
  simulation_placeholder: { icon: FlaskConical, label: 'Interactive Simulation', color: 'cyan', desc: 'An interactive simulation is attached to this concept.' },
};

const COLOR_MAP = {
  blue:   ['bg-blue-50/60 border-blue-100', 'text-custom-blue', 'text-gray-900', 'text-gray-700'],
  red:    ['bg-rose-50/60 border-rose-100', 'text-rose-600', 'text-gray-900', 'text-gray-700'],
  violet: ['bg-purple-50/60 border-purple-100', 'text-purple-600', 'text-gray-900', 'text-gray-700'],
  cyan:   ['bg-cyan-50/60 border-cyan-100', 'text-cyan-600', 'text-gray-900', 'text-gray-700'],
  teal:   ['bg-teal-50/60 border-teal-100', 'text-teal-600', 'text-gray-900', 'text-gray-700'],
  green:  ['bg-emerald-50/60 border-emerald-100', 'text-emerald-600', 'text-gray-900', 'text-gray-700'],
  slate:  ['bg-slate-50 border-slate-100', 'text-slate-600', 'text-gray-900', 'text-gray-700'],
  gray:   ['bg-gray-50 border-gray-100', 'text-gray-600', 'text-gray-900', 'text-gray-700'],
};

export const SuggestedMediaBlock = ({ block }) => {
  const [imageError, setImageError] = useState(false);
  const [fetchedSvg, setFetchedSvg] = useState(null);
  const cfg = MEDIA_CONFIG[block.block_type] || MEDIA_CONFIG.suggested_image;
  const [bg, iconColor, textColor, subColor] = COLOR_MAP[cfg.color] || COLOR_MAP.blue;
  const c = parseContent(block.content);
  
  const asset = block.assets && block.assets.length > 0 ? block.assets[0] : null;
  const getFileUrl = (fileStr) => {
    if (!fileStr) return null;
    if (fileStr.startsWith('http')) {
      // If Wikimedia Commons image, route through cached backend media proxy to prevent 429 rate limiting
      if (fileStr.includes('upload.wikimedia.org') || fileStr.includes('commons.wikimedia.org')) {
        return `${BASE_URL}/api/curriculum/media-proxy/?url=${encodeURIComponent(fileStr)}`;
      }
      return fileStr;
    }
    const path = fileStr.startsWith('/') ? fileStr : `/media/${fileStr}`;
    return `${BASE_URL}${path}`;
  };
  const assetUrl = getFileUrl(asset?.url) || getFileUrl(asset?.file);
  
  const isVideo = asset 
    ? ['video', 'youtube'].includes(asset.asset_type) 
    : ['suggested_video', 'video_ref'].includes(block.block_type);
  const resolvedUrl = assetUrl || c.resolved_url || c.url || c.resolved_video_id;
  const resolvedImageUrl = !isVideo ? (resolvedUrl || c.resolved_image_url) : c.resolved_image_url;

  // Direct SVG XML support (from metadata, content, or fetched)
  const inlineSvg = asset?.metadata?.svg_content || block?.metadata?.svg_content || c?.svg_content || c?.svg_markup || c?.svg || fetchedSvg;

  // If we have an SVG file URL but no inline SVG yet, proactively fetch it to bypass cross-origin image header restrictions
  useEffect(() => {
    if (!inlineSvg && resolvedImageUrl && (resolvedImageUrl.includes('.svg') || asset?.asset_type === 'diagram' || asset?.source_type === 'ai_generated')) {
      fetch(resolvedImageUrl)
        .then(res => {
          if (res.ok) return res.text();
          throw new Error(`HTTP ${res.status}`);
        })
        .then(text => {
          if (text && text.includes('<svg')) {
            setFetchedSvg(text);
          }
        })
        .catch(err => {
          console.warn('Could not fetch raw SVG, fallback to img tag:', err);
        });
    }
  }, [inlineSvg, resolvedImageUrl, asset?.asset_type, asset?.source_type]);

  // Attribution data from asset metadata or top-level properties
  const commonsUrl = asset?.metadata?.commons_page_url;
  const author = asset?.metadata?.author;
  const licensing = asset?.metadata?.licensing || asset?.licensing;
  const hasAttribution = Boolean(author || licensing || commonsUrl);

  // Render Interactive Simulation Sandbox if this is a simulation block or sandbox title
  if (['suggested_simulation', 'simulation_placeholder'].includes(block.block_type) ||
      (block.title && (block.title.toLowerCase().includes('sandbox') || block.title.toLowerCase().includes('interactive')))) {
    return <InteractiveSimulationBlock block={block} />;
  }

  // 1. Render Inline SVG if available
  if (inlineSvg && !isVideo) {
    return (
      <div className="my-16">
        <figure className="w-full">
          <div
            className="w-full h-auto rounded-3xl shadow-xl overflow-hidden bg-slate-950 flex items-center justify-center p-4 md:p-6 border border-slate-800 transition-all hover:border-slate-700"
            dangerouslySetInnerHTML={{ __html: inlineSvg }}
          />
          {block.title && (
            <figcaption className="text-gray-600 mt-4 text-base text-center font-medium font-sans">
              {block.title}
            </figcaption>
          )}
        </figure>
      </div>
    );
  }

  // 2. Render External Link / Simulation
  if (resolvedImageUrl && !isVideo && !imageError) {
    if (asset?.asset_type === 'external_link' || 
        ['suggested_external_link', 'suggested_activity', 'suggested_simulation', 'simulation_placeholder'].includes(block.block_type) ||
        asset?.asset_type === 'simulation') {
        return (
          <div className="my-16 bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex items-center justify-between">
             <div>
                <BlockHeader label={cfg.label} colorClass="text-gray-400" />
                <p className="font-semibold text-gray-900 text-2xl font-sans mt-2">{block.title}</p>
             </div>
             <a href={resolvedImageUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-custom-blue text-white rounded-full hover:bg-blue-700 transition text-base font-medium font-sans shadow-md">Open Link</a>
          </div>
        );
    }

    const imageElement = (
      <img
        src={resolvedImageUrl}
        alt={block.title || 'Lesson visual'}
        className="w-full h-auto object-cover rounded-3xl shadow-xl"
        onError={() => setImageError(true)}
      />
    );

    return (
      <div className="my-16">
        <figure className="w-full">
          {commonsUrl ? (
            <a
              href={commonsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              title="View original on Wikimedia Commons"
            >
              {imageElement}
            </a>
          ) : (
            imageElement
          )}
          {block.title && (
            <figcaption className="text-gray-600 mt-4 text-base text-center font-medium font-sans">
              {block.title}
            </figcaption>
          )}
          {hasAttribution && (
            <div className="mt-2 text-xs text-gray-400 flex items-center justify-center gap-1.5 flex-wrap font-sans text-center">
              {author && <span>© {author}</span>}
              {licensing && <span>• {licensing}</span>}
              {commonsUrl && (
                <a
                  href={commonsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-gray-400 hover:text-gray-600 transition-colors ml-1 inline-flex items-center"
                >
                  Wikimedia Commons ↗
                </a>
              )}
            </div>
          )}
        </figure>
      </div>
    );
  }

  if (resolvedUrl && isVideo) {
    const isYouTube = resolvedUrl.includes('youtube.com') || resolvedUrl.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(resolvedUrl);
    
    if (isYouTube) {
        let videoId = resolvedUrl;
        if (resolvedUrl.includes('youtube.com') || resolvedUrl.includes('youtu.be')) {
            try {
                const u = new URL(resolvedUrl);
                videoId = u.searchParams.get('v') || u.pathname.split('/').pop() || '';
            } catch { /* ignore */ }
        }
        
        return (
          <div className="my-16 bg-black rounded-3xl overflow-hidden shadow-xl">
            <div className="aspect-video w-full">
              <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
            <div className="px-8 py-5 bg-white flex items-center justify-between border border-t-0 border-gray-200 rounded-b-3xl">
              <span className="text-gray-900 font-semibold text-lg font-sans">{block.title || 'Video Resource'}</span>
              <PlayCircle className="text-gray-400 w-8 h-8 shrink-0" strokeWidth={1} />
            </div>
          </div>
        );
    }
    
    return (
      <div className="my-16 bg-black rounded-3xl overflow-hidden shadow-xl">
        <div className="aspect-video w-full">
          <video controls className="w-full h-full" src={resolvedUrl}>
            Your browser doesn't support video.
          </video>
        </div>
        <div className="px-8 py-5 bg-white flex items-center justify-between border border-t-0 border-gray-200 rounded-b-3xl">
          <span className="text-gray-900 font-semibold text-lg font-sans">{block.title || 'Video Resource'}</span>
          <PlayCircle className="text-gray-400 w-8 h-8 shrink-0" strokeWidth={1} />
        </div>
      </div>
    );
  }

  return (
    <div className={`my-12 ${bg} rounded-3xl p-6 md:p-8 border border-blue-100/40 shadow-xs`}>
      <BlockHeader icon={cfg.icon} label={cfg.label} colorClass={iconColor} />
      <div className="text-gray-500 text-base md:text-lg font-medium font-sans mt-4 flex items-center gap-2">
        <span>Interactive visual coming soon! ✨</span>
      </div>
    </div>
  );
};

// ─── Concept Completion Card ──────────────────────────────────────────────────
export const ConceptCompletionCard = ({ page, nextPageTitle, onNext, onComplete, isLast }) => {
  const summaryBlocks = (page?.blocks || []).filter(b =>
    b.block_type === 'key_takeaway' || b.block_type === 'summary'
  );
  const takeaways = summaryBlocks.flatMap(b => {
    const t = text(b.content);
    return t.split('\n').filter(l => l.trim().replace(/^[•\-*]\s*/, ''));
  }).slice(0, 3);

  return (
    <div className="mt-20 mb-16 bg-slate-900 border border-slate-800 rounded-3xl p-10 md:p-14 text-white shadow-xl">
      <BlockHeader icon={Check} label="Concept Complete" iconClass="text-emerald-400" colorClass="text-emerald-400" />

      {takeaways.length > 0 && (
        <div className="my-10">
          <BlockHeader label="You now understand" colorClass="text-white/50" />
          <ul className="space-y-6">
            {takeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-4 text-white/90 text-xl font-sans max-w-[70ch]">
                <span className="text-custom-blue mt-1 text-2xl">•</span>
                <span>{t.replace(/^[•\-*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLast && nextPageTitle && (
        <div className="pt-10 border-t border-white/10 mt-10">
          <BlockHeader label="Next up" colorClass="text-white/50" />
          <p className="text-3xl font-sans text-white">{nextPageTitle}</p>
        </div>
      )}
    </div>
  );
};

// ─── Comparison Table Block ──────────────────────────────────────────────────
export const ComparisonTableBlock = ({ block }) => {
  const c = parseContent(block?.content);
  const headers = c.headers || ['Feature', 'Concept A', 'Concept B'];
  const rows = c.rows || (c.text ? [[ 'Details', c.text ]] : []);

  return (
    <div className="my-16 bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 p-8">
         <BlockHeader label="Comparative Analysis" title={block?.title || 'Comparison Matrix'} colorClass="text-gray-500" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-lg font-sans">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              {headers.map((h, i) => (
                <th key={i} className="p-6 md:p-8 font-bold text-gray-900">
                  <MD>{String(h)}</MD>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {Array.isArray(row) ? row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-6 md:p-8 text-gray-800 leading-relaxed">
                    <MD>{String(cell)}</MD>
                  </td>
                )) : (
                  <td colSpan={headers.length} className="p-6 md:p-8 text-gray-800 leading-relaxed">
                    <MD>{String(row)}</MD>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Step Process Block ─────────────────────────────────────────────────────
export const StepProcessBlock = ({ block }) => {
  const c = parseContent(block?.content);
  let steps = c.steps || c.items || c.procedure;
  if (!steps && c.rows && Array.isArray(c.rows)) {
    steps = c.rows.map(row => Array.isArray(row) ? row.filter(Boolean).join(' — ') : String(row));
  }
  if (!steps && c.text) {
    steps = c.text.split('\n').filter(s => s.trim());
  }
  if (!steps) steps = [];

  return (
    <div className="my-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
      <BlockHeader label="Sequential Process Flow" title={block?.title || 'Process Flow'} colorClass="text-custom-blue" />
      <div className="space-y-8 mt-10">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-6 p-8 rounded-3xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-custom-blue text-white font-bold flex items-center justify-center shrink-0 text-base font-sans">
              {idx + 1}
            </div>
            <div className="text-gray-800 text-xl leading-relaxed pt-1 font-sans">
              <MD>{typeof step === 'string' ? step : step.title ? `**${step.title}**: ${step.description || ''}` : JSON.stringify(step)}</MD>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Interactive Simulation Sandboxes ────────────────────────────────────────

export const XRaySimulationSandbox = ({ block }) => {
  const [vKV, setVKV] = useState(80);
  const [iMA, setIMA] = useState(20);

  const lambdaMin = (1.2398 / vKV).toFixed(4);
  const fMax = ((1.602e-19 * vKV * 1000) / 6.626e-34).toExponential(2);
  const powerInput = (iMA * 0.001 * vKV * 1000).toFixed(0);
  const heatRate = (0.99 * powerInput).toFixed(0);
  const isHard = vKV >= 50;

  return (
    <div className="my-16 bg-slate-950 rounded-3xl p-6 md:p-10 text-white shadow-2xl border border-slate-800 font-sans">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800 flex-wrap gap-4">
        <div>
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest block">Interactive Physics Sandbox</span>
          <h3 className="text-2xl md:text-3xl font-bold font-sans text-white mt-1">
            {block?.title || 'Interactive X-Ray Tube Sandbox'}
          </h3>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${isHard ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
          {isHard ? '⚡ Hard X-Ray (High Penetration)' : '🟡 Soft X-Ray (Low Penetration)'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-sky-400">Accelerating Voltage (V_acc)</label>
              <span className="text-xl font-extrabold text-sky-300 font-mono">{vKV} kV</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="1"
              value={vKV}
              onChange={(e) => setVKV(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <p className="text-xs text-slate-400 mt-1">Controls photon energy, frequency (f_max), and minimum cutoff wavelength (λ_min).</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-amber-400">Filament Current (I_f)</label>
              <span className="text-xl font-extrabold text-amber-300 font-mono">{iMA} mA</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={iMA}
              onChange={(e) => setIMA(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">Controls electron emission density (beam intensity/quantity per second).</p>
          </div>

          <div className="pt-2">
            <span className="text-xs text-slate-500 font-bold block mb-2 uppercase tracking-wider">Clinical Presets</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setVKV(30); setIMA(10); }}
                className="px-2 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-medium transition cursor-pointer"
              >
                Mammography (30kV)
              </button>
              <button
                type="button"
                onClick={() => { setVKV(80); setIMA(20); }}
                className="px-2 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-medium transition cursor-pointer"
              >
                Chest X-Ray (80kV)
              </button>
              <button
                type="button"
                onClick={() => { setVKV(120); setIMA(40); }}
                className="px-2 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-medium transition cursor-pointer"
              >
                CT Scan (120kV)
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Cutoff Wavelength (λ_min)</span>
              <span className="text-2xl font-bold text-sky-400 font-mono mt-1 block">{lambdaMin} nm</span>
              <span className="text-[10px] text-slate-500 block">λ_min = hc / (e V_acc)</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Max Frequency (f_max)</span>
              <span className="text-xl font-bold text-purple-400 font-mono mt-1 block">{fMax} Hz</span>
              <span className="text-[10px] text-slate-500 block">f_max = e V_acc / h</span>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400 font-semibold block">Heat Rate (99%)</span>
              <span className="text-2xl font-bold text-rose-400 font-mono mt-1 block">{heatRate} W</span>
              <span className="text-[10px] text-slate-500 block">Total Power: {powerInput} W</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex items-center justify-center">
            <svg viewBox="0 0 600 240" className="w-full h-auto">
              <rect width="600" height="240" fill="#090d16" rx="8" />

              <path d="M 60,70 L 200,70 L 230,40 L 400,40 L 430,70 L 540,70 L 540,170 L 430,170 L 400,200 L 230,200 L 200,170 L 60,170 Z" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />

              <rect x="80" y="100" width="30" height="40" fill="#1e293b" rx="2" stroke="#f59e0b" />
              <line x1="110" y1="120" x2="130" y2="120" stroke="#ef4444" strokeWidth="4" />

              <line x1="130" y1="120" x2="430" y2="120" stroke="#38bdf8" strokeWidth={Math.max(2, iMA / 5)} strokeDasharray="6 3" opacity={Math.min(1, iMA / 30)} />

              <polygon points="430,90 460,120 460,150 430,150" fill="#f59e0b" />
              <rect x="460" y="105" width="60" height="30" fill={vKV > 70 ? "#ef4444" : "#b45309"} />

              <path
                d="M 445,120 Q 435,160 455,200 T 445,230 M 455,120 Q 445,160 465,200 T 455,230"
                fill="none"
                stroke="#eab308"
                strokeWidth="3"
                strokeDasharray={vKV > 80 ? "3 3" : "6 4"}
              />

              <text x="450" y="225" fill="#eab308" fontSize="11" fontWeight="700" textAnchor="middle">X-Ray Beam Photons</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CRTSimulationSandbox = ({ block }) => {
  const [vAcc, setVAcc] = useState(2500);
  const [vy, setVy] = useState(50);

  const speed = (Math.sqrt((2 * 1.602e-19 * vAcc) / 9.109e-31)).toExponential(2);
  const deflection = (vy * 0.15).toFixed(1);

  return (
    <div className="my-16 bg-slate-950 rounded-3xl p-6 md:p-10 text-white shadow-2xl border border-slate-800 font-sans">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800 flex-wrap gap-4">
        <div>
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest block">Interactive Physics Sandbox</span>
          <h3 className="text-2xl md:text-3xl font-bold font-sans text-white mt-1">
            {block?.title || 'Interactive CRT Electron Beam Sandbox'}
          </h3>
        </div>
        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
          v = {speed} m/s
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-sky-400">Anode Accelerating Voltage (V_acc)</label>
              <span className="text-xl font-extrabold text-sky-300 font-mono">{vAcc} V</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="50"
              value={vAcc}
              onChange={(e) => setVAcc(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-emerald-400">Y-Plate Deflection Voltage (V_y)</label>
              <span className="text-xl font-extrabold text-emerald-300 font-mono">{vy} V</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={vy}
              onChange={(e) => setVy(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Electron Speed</span>
              <span className="text-xl font-bold text-sky-400 font-mono mt-1 block">{speed} m/s</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Vertical Screen Spot Shift</span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{deflection} mm</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex items-center justify-center">
            <svg viewBox="0 0 600 200" className="w-full h-auto">
              <rect width="600" height="200" fill="#090d16" rx="8" />
              <line x1="50" y1="100" x2="250" y2="100" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 2" />
              <path d={`M 250,100 Q 350,100 550,${100 - vy * 0.8}`} fill="none" stroke="#22c55e" strokeWidth="3" />
              <circle cx="550" cy={100 - vy * 0.8} r="6" fill="#22c55e" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PhotoelectricSimulationSandbox = ({ block }) => {
  const [lambda, setLambda] = useState(300);
  const [intensity, setIntensity] = useState(50);
  const workFunction = 2.26; // Potassium in eV

  const photonE = (1239.8 / lambda).toFixed(2);
  const kMax = Math.max(0, photonE - workFunction).toFixed(2);
  const emitted = photonE >= workFunction;
  const current = emitted ? ((intensity / 100) * 0.32).toFixed(3) : '0.000';

  return (
    <div className="my-16 bg-slate-950 rounded-3xl p-6 md:p-10 text-white shadow-2xl border border-slate-800 font-sans">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800 flex-wrap gap-4">
        <div>
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest block">Interactive Quantum Sandbox</span>
          <h3 className="text-2xl md:text-3xl font-bold font-sans text-white mt-1">
            {block?.title || 'Interactive Photoelectric Sandbox'}
          </h3>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${emitted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
          {emitted ? '⚡ Photoelectrons Emitted' : '⛔ No Emission (f < f_0)'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-purple-400">Light Wavelength (λ)</label>
              <span className="text-xl font-extrabold text-purple-300 font-mono">{lambda} nm</span>
            </div>
            <input
              type="range"
              min="200"
              max="700"
              step="5"
              value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-emerald-400">Light Intensity (Flux)</label>
              <span className="text-xl font-extrabold text-emerald-300 font-mono">{intensity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Photon Energy (E)</span>
              <span className="text-xl font-bold text-purple-400 font-mono mt-1 block">{photonE} eV</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Max KE (K_max)</span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{kMax} eV</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Photoelectric Current</span>
              <span className="text-xl font-bold text-sky-400 font-mono mt-1 block">{current} mA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InteractiveSimulationBlock = ({ block }) => {
  const title = block?.title || '';
  const content = parseContent(block?.content);
  const text = ((content?.text || '') + ' ' + title).toLowerCase();

  if (text.includes('x-ray') || text.includes('xray') || text.includes('coolidge')) {
    return <XRaySimulationSandbox block={block} />;
  }
  if (text.includes('crt') || text.includes('oscilloscope') || text.includes('cathode ray')) {
    return <CRTSimulationSandbox block={block} />;
  }
  if (text.includes('photoelectric') || text.includes('work function') || text.includes('quantum')) {
    return <PhotoelectricSimulationSandbox block={block} />;
  }

  // Fallback to XRaySimulationSandbox for general simulation blocks
  return <XRaySimulationSandbox block={block} />;
};

