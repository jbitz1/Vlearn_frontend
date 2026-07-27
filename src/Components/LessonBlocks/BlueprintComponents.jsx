import React, { useState } from 'react';
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

const MD = ({ children, className = '' }) => (
  <div className={`prose prose-stone max-w-none leading-relaxed text-gray-800 font-sans ${className}`}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ node, ...props }) => <p className="mb-4 text-gray-800 leading-relaxed font-sans" {...props} />,
        li: ({ node, ...props }) => <li className="mb-2 text-gray-800 font-sans" {...props} />,
        code: ({ node, inline, ...props }) => 
          inline ? (
            <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
          ) : (
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono">
              <code {...props} />
            </pre>
          ),
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

// ─── Learning Goal ────────────────────────────────────────────────────────────
export const LearningGoalBlock = ({ block }) => (
  <div className="flex items-start gap-3 bg-custom-cream border-t-2 border-custom-terracotta px-5 py-6 my-6 shadow-sm">
    <Target className="text-custom-terracotta w-6 h-6 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold text-custom-terracotta uppercase tracking-widest mb-2 font-sans">By the end of this concept</p>
      <p className="text-gray-900 font-medium text-base leading-relaxed font-serif">{text(block.content)}</p>
    </div>
  </div>
);

// ─── Concept Explanation ──────────────────────────────────────────────────────
export const ConceptExplanationBlock = ({ block }) => (
  <div className="my-8">
    {block.title && <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">{block.title}</h3>}
    <MD className="text-gray-800 text-lg leading-relaxed font-sans">{ContentNormalizer.removeDuplicateHeading(text(block.content), block.title)}</MD>
  </div>
);

// ─── Definition Card ──────────────────────────────────────────────────────────
export const DefinitionCardBlock = ({ block }) => {
  const c = parseContent(block.content);
  const term = c.term || block.title || 'Definition';
  const definition = c.content || c.text || text(block.content);
  return (
    <div className="my-6 border-l-4 border-custom-ochre bg-white rounded-r-xl pl-5 pr-5 py-5 flex gap-4 shadow-sm">
      <Book className="text-custom-ochre w-6 h-6 mt-1 shrink-0" />
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">Definition</p>
        <p className="font-bold text-gray-900 text-lg mb-2 font-serif">{term}</p>
        <p className="text-gray-700 text-base leading-relaxed">{definition}</p>
      </div>
    </div>
  );
};

// ─── Worked Example ───────────────────────────────────────────────────────────
export const WorkedExampleBlock = ({ block }) => {
  const content = text(block.content);
  const parsedContent = parseContent(block.content);
  
  // Try to get structured data first (new Learning Experience schema)
  let intro = '';
  let steps = [];
  
  if (parsedContent.steps && Array.isArray(parsedContent.steps)) {
    intro = parsedContent.intro || parsedContent.problem || '';
    steps = parsedContent.steps.map((s, i) => ({ number: i + 1, text: s }));
  } else {
    // Fall back to regex detection for backward compatibility
    const parsed = ContentNormalizer.parseSteps(content);
    intro = parsed.intro;
    steps = parsed.steps;
  }
  
  const cleanTitle = block.title || 'Worked Example';
  const cleanIntro = ContentNormalizer.removeDuplicateHeading(intro, cleanTitle);
  
  return (
    <div className="my-8 bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-custom-cream border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <PenTool className="text-custom-forest w-5 h-5 shrink-0" />
        <p className="text-xs font-bold text-custom-forest uppercase tracking-widest font-sans">Worked Example</p>
        <span className="text-sm font-semibold text-gray-800 ml-1 font-sans">— {cleanTitle}</span>
      </div>
      <div className="px-6 py-6">
        {cleanIntro && <MD className="text-gray-800 text-base leading-relaxed mb-6">{cleanIntro}</MD>}
        
        {steps.length > 0 ? (
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-custom-forest">{step.number}</span>
                </div>
                <div className="flex-1 mt-1">
                  <MD className="text-gray-800 text-base leading-relaxed">{step.text}</MD>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MD className="text-gray-800 text-base leading-relaxed">{content}</MD>
        )}
      </div>
    </div>
  );
};

// ─── Analogy ──────────────────────────────────────────────────────────────────
export const AnalogyBlock = ({ block }) => (
  <div className="my-6 bg-white border border-gray-200/60 rounded-xl px-6 py-5 flex gap-4 shadow-sm relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-custom-ochre" />
    <Lightbulb className="text-custom-ochre w-6 h-6 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 font-sans">Think of it this way</p>
      <p className="text-gray-800 text-base leading-relaxed italic font-serif">"{text(block.content)}"</p>
    </div>
  </div>
);

// ─── Common Misconception ─────────────────────────────────────────────────────
export const CommonMisconceptionBlock = ({ block }) => (
  <div className="my-6 bg-[#FAF7F5] border border-[#E8DFD8] rounded-xl px-6 py-5 flex gap-4 shadow-sm">
    <AlertTriangle className="text-custom-terracotta w-6 h-6 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold text-custom-terracotta uppercase tracking-widest mb-2 font-sans">Common Misconception</p>
      <p className="text-gray-800 text-base leading-relaxed">{text(block.content)}</p>
    </div>
  </div>
);

// ─── Common Mistake (action-oriented) ────────────────────────────────────────
export const CommonMistakeBlock = ({ block }) => (
  <div className="my-6 bg-[#FAF7F5] border border-[#E8DFD8] rounded-xl px-6 py-5 flex gap-4 shadow-sm">
    <XCircle className="text-custom-terracotta w-6 h-6 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold text-custom-terracotta uppercase tracking-widest mb-2 font-sans">Watch Out</p>
      <p className="text-gray-800 text-base leading-relaxed">{text(block.content)}</p>
    </div>
  </div>
);

// ─── Callout ──────────────────────────────────────────────────────────────────
export const CalloutBlock = ({ block }) => (
  <div className="my-6 bg-white border-l-4 border-custom-forest rounded-r-xl px-6 py-5 shadow-sm">
    <p className="text-xs font-bold text-custom-forest uppercase tracking-widest mb-2 font-sans">Important</p>
    <p className="text-gray-800 text-base leading-relaxed">{text(block.content)}</p>
  </div>
);

// ─── Quick Fact ───────────────────────────────────────────────────────────────
export const QuickFactBlock = ({ block }) => (
  <div className="my-4 bg-white border border-gray-200/60 rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm">
    <Zap className="text-custom-ochre w-5 h-5 mt-0.5 shrink-0" />
    <p className="text-gray-800 text-base font-medium leading-relaxed">{text(block.content)}</p>
  </div>
);

// ─── Did You Know ─────────────────────────────────────────────────────────────
export const DidYouKnowBlock = ({ block }) => (
  <div className="my-4 bg-white border border-gray-200/60 rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm">
    <Star className="text-custom-ochre w-5 h-5 mt-0.5 shrink-0" />
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">Did you know?</p>
      <p className="text-gray-800 text-base leading-relaxed">{text(block.content)}</p>
    </div>
  </div>
);

// ─── Memory Tip ───────────────────────────────────────────────────────────────
export const MemoryTipBlock = ({ block }) => (
  <div className="my-4 bg-custom-cream border border-custom-ochre/30 rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm">
    <BrainCircuit className="text-custom-ochre w-5 h-5 mt-0.5 shrink-0" />
    <div>
      <p className="text-[10px] font-bold text-custom-ochre uppercase tracking-widest mb-1 font-sans">Memory tip</p>
      <p className="text-gray-800 text-base leading-relaxed font-serif italic">{text(block.content)}</p>
    </div>
  </div>
);

// ─── Real World Connection ────────────────────────────────────────────────────
export const RealWorldConnectionBlock = ({ block }) => (
  <div className="my-6 bg-[#F5F8F6] border border-[#E3EBE6] rounded-xl px-6 py-5 flex gap-4 shadow-sm">
    <Globe className="text-custom-forest w-6 h-6 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold text-custom-forest uppercase tracking-widest mb-2 font-sans">In the real world</p>
      <p className="text-gray-800 text-base leading-relaxed">{text(block.content)}</p>
    </div>
  </div>
);

// ─── Real World Example (legacy) ─────────────────────────────────────────────
export const RealWorldExampleBlock = ({ block }) => (
  <RealWorldConnectionBlock block={block} />
);

// ─── Reflection ───────────────────────────────────────────────────────────────
export const ReflectionBlock = ({ block }) => (
  <div className="my-8 bg-white border border-gray-200/60 rounded-xl px-6 py-6 shadow-sm">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-sans">Pause & Reflect</p>
    <p className="text-gray-900 text-lg font-medium leading-relaxed italic font-serif">"{text(block.content)}"</p>
  </div>
);

// ─── Prediction ───────────────────────────────────────────────────────────────
export const PredictionBlock = ({ block }) => (
  <div className="my-8 border-2 border-dashed border-gray-300 bg-white rounded-xl px-6 py-6 shadow-sm">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 font-sans">Make a Prediction</p>
    <p className="text-gray-900 text-lg leading-relaxed font-serif">{text(block.content)}</p>
    <p className="text-gray-400 text-xs mt-4 font-sans uppercase tracking-widest">Keep your answer in mind as you continue.</p>
  </div>
);

// ─── Mini Activity ────────────────────────────────────────────────────────────
export const MiniActivityBlock = ({ block }) => {
  const c = parseContent(block.content);
  const title = c.title || block.title || 'Try This';
  const instruction = c.content || c.text || text(block.content);
  return (
    <div className="my-8 bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-[#F5F8F6] border-b border-[#E3EBE6] px-6 py-4 flex items-center gap-3">
        <FlaskConical className="text-custom-forest w-5 h-5 shrink-0" />
        <p className="text-xs font-bold text-custom-forest uppercase tracking-widest font-sans">Mini Activity</p>
        <span className="text-sm font-semibold text-gray-800 ml-1 font-sans">— {title}</span>
      </div>
      <div className="px-6 py-5">
        <p className="text-gray-800 text-base leading-relaxed">{instruction}</p>
      </div>
    </div>
  );
};

// ─── Formula Breakdown ────────────────────────────────────────────────────────
export const FormulaBreakdownBlock = ({ block }) => {
  const c = parseContent(block.content);
  const formula = c.formula || block.title || '';
  const breakdown = c.content || c.text || text(block.content);
  return (
    <div className="my-8 bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gray-900 px-6 py-6 text-center">
        <p className="text-white font-mono text-2xl font-bold tracking-wide">{formula}</p>
      </div>
      <div className="px-6 py-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-sans">Variable Breakdown</p>
        <MD className="text-gray-700 text-sm font-mono">{breakdown}</MD>
      </div>
    </div>
  );
};

// ─── Key Takeaway ─────────────────────────────────────────────────────────────
export const KeyTakeawayBlock = ({ block }) => (
  <div className="my-8 bg-custom-forest rounded-xl px-8 py-6 flex items-start gap-4 shadow-md">
    <Sparkles className="text-custom-ochre w-6 h-6 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 font-sans">Key Takeaway</p>
      <p className="text-white font-semibold text-lg leading-relaxed font-serif">{text(block.content)}</p>
    </div>
  </div>
);

// ─── Before You Continue ──────────────────────────────────────────────────────
export const BeforeYouContinueBlock = ({ block }) => (
  <div className="my-6 bg-white border-2 border-custom-terracotta/20 rounded-xl px-6 py-5 flex gap-4 shadow-sm">
    <Hand className="text-custom-terracotta w-6 h-6 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold text-custom-terracotta uppercase tracking-widest mb-2 font-sans">Before you continue</p>
      <p className="text-gray-800 text-base leading-relaxed">{text(block.content)}</p>
    </div>
  </div>
);

// ─── Summary ──────────────────────────────────────────────────────────────────
export const SummaryBlock = ({ block }) => (
  <div className="my-8 bg-white border-t-4 border-gray-300 rounded-b-xl px-8 py-8 shadow-sm">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 font-sans">Summary</p>
    <MD className="text-gray-800 text-base font-serif">{text(block.content)}</MD>
  </div>
);

// ─── Transition ───────────────────────────────────────────────────────────────
export const TransitionBlock = ({ block }) => (
  <div className="my-6 flex items-center gap-3 text-gray-400">
    <div className="flex-1 h-px bg-gray-200" />
    <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">{text(block.content)}</p>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

// ─── Knowledge Check ──────────────────────────────────────────────────────────
export const KnowledgeCheckBlock = ({ block, onInteract }) => {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);

  const c = parseContent(block.content);
  const checkType = c.check_type || 'short_answer';
  const question = c.content || c.question || text(block.content);
  const options = ContentNormalizer.parseOptions(c.options);
  const answer = c.answer;

  const handleSubmit = () => {
    setRevealed(true);
    if (onInteract) onInteract(block.id);
  };

  const selectedIndex = selected ? selected.charCodeAt(0) - 65 : -1;
  const isCorrect = selected !== null && (
    selected === answer || 
    (selectedIndex >= 0 && options[selectedIndex] === answer)
  );

  return (
    <div className="my-10 bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-sm relative">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-custom-terracotta" />
      <div className="px-8 py-8">
        <p className="text-[10px] font-bold text-custom-terracotta uppercase tracking-widest mb-4 font-sans">Check Your Understanding</p>
        <p className="text-gray-900 font-medium text-lg mb-6 font-serif">{question}</p>

        {/* Multiple choice */}
        {checkType === 'multiple_choice' && options.length > 0 && (
          <div className="space-y-3 mb-6">
            {options.map((opt, i) => {
              const label = String.fromCharCode(65 + i);
              const isSelected = selected === label;
              const isRight = revealed && (label === answer || opt === answer);
              const isWrong = revealed && isSelected && !isRight;
              return (
                <button
                  key={i}
                  onClick={() => !revealed && setSelected(label)}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-base font-medium transition-all ${
                    isRight ? 'bg-[#F5F8F6] border-[#606C38] text-[#283618]' :
                    isWrong ? 'bg-red-50 border-red-300 text-red-900' :
                    isSelected ? 'bg-orange-50 border-custom-terracotta text-custom-terracotta' :
                    'bg-white border-gray-200 text-gray-700 hover:border-custom-terracotta/50 hover:bg-orange-50/20'
                  }`}
                >
                  <span className="font-bold mr-3 text-gray-400">{label}.</span>{opt}
                  {isRight && <Check className="inline-block ml-3 w-5 h-5 text-custom-forest" />}
                  {isWrong && <X className="inline-block ml-3 w-5 h-5 text-red-500" />}
                </button>
              );
            })}
          </div>
        )}

        {/* True / False */}
        {checkType === 'true_false' && (
          <div className="flex gap-4 mb-6">
            {['True', 'False'].map((opt) => {
              const val = opt === 'True';
              const isSelected = selected === val;
              const isRight = revealed && val === answer;
              const isWrong = revealed && isSelected && val !== answer;
              return (
                <button
                  key={opt}
                  onClick={() => !revealed && setSelected(val)}
                  className={`flex-1 py-4 rounded-xl border font-semibold text-base transition-all ${
                    isRight ? 'bg-[#F5F8F6] border-[#606C38] text-[#283618]' :
                    isWrong ? 'bg-red-50 border-red-300 text-red-900' :
                    isSelected ? 'bg-orange-50 border-custom-terracotta text-custom-terracotta' :
                    'bg-white border-gray-200 text-gray-700 hover:border-custom-terracotta/50 hover:bg-orange-50/20'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Short answer / predict / explain */}
        {(checkType === 'short_answer' || checkType === 'predict_outcome' || checkType === 'explain_in_words' || checkType === 'fill_blank') && !revealed && (
          <textarea
            className="w-full border border-gray-300 rounded-xl p-4 text-base text-gray-800 focus:border-custom-terracotta focus:ring-1 focus:ring-custom-terracotta transition resize-none mb-6 font-sans"
            rows={4}
            placeholder="Write your answer here…"
          />
        )}

        {!revealed ? (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-custom-terracotta text-white rounded-xl text-sm font-bold hover:bg-custom-terracotta-dark transition shadow-sm font-sans uppercase tracking-wide"
          >
            Submit Answer
          </button>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-[#F5F8F6] border border-[#E3EBE6] rounded-xl flex items-center gap-3">
              <CheckCircle2 className="text-custom-forest w-6 h-6 shrink-0" />
              <p className="text-custom-forest text-base font-semibold">
                {(checkType === 'multiple_choice' || checkType === 'true_false') && isCorrect
                  ? 'Correct! Well done.'
                  : (checkType === 'multiple_choice' || checkType === 'true_false') && !isCorrect
                  ? `Not quite — the correct answer is ${answer}.`
                  : 'Answer noted. Continue when ready.'}
              </p>
            </div>
            {!(checkType === 'multiple_choice' || checkType === 'true_false') && (answer || c.explanation) && (
                <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 font-sans">Suggested Answer / Explanation</p>
                    <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap font-serif">{answer || c.explanation}</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Suggested Media (pending asset) ─────────────────────────────────────────
const MEDIA_CONFIG = {
  suggested_diagram:    { icon: BarChart, label: 'Diagram', color: 'blue',   desc: 'A labelled diagram is planned for this concept.' },
  suggested_video:      { icon: PlayCircle, label: 'Video',   color: 'red',    desc: 'A short video is planned for this concept.' },
  suggested_image:      { icon: ImageIcon, label: 'Image',   color: 'violet', desc: 'An illustration is planned for this concept.' },
  suggested_simulation: { icon: FlaskConical, label: 'Interactive Simulation', color: 'cyan', desc: 'An interactive simulation is planned for this concept.' },
  suggested_gif:        { icon: MonitorPlay, label: 'Animation', color: 'teal', desc: 'An animation is planned for this concept.' },
  suggested_activity:   { icon: FlaskConical, label: 'Activity', color: 'green', desc: 'A hands-on activity is planned for this concept.' },
  suggested_external_link: { icon: Link2, label: 'Resource', color: 'slate', desc: 'An external resource is planned for this concept.' },
  repository_asset:     { icon: BookOpen, label: 'Repository Asset', color: 'gray', desc: 'A repository asset is linked to this concept.' },
  // Extra/manual/legacy types mapping
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
  blue:   ['bg-white', 'border-gray-200', 'text-gray-600',  'text-gray-800', 'text-gray-500'],
  red:    ['bg-white', 'border-gray-200', 'text-custom-terracotta', 'text-gray-800', 'text-gray-500'],
  violet: ['bg-white', 'border-gray-200', 'text-custom-ochre','text-gray-800','text-gray-500'],
  cyan:   ['bg-white', 'border-gray-200', 'text-custom-blue', 'text-gray-800', 'text-gray-500'],
  teal:   ['bg-white', 'border-gray-200', 'text-custom-forest', 'text-gray-800', 'text-gray-500'],
  green:  ['bg-white', 'border-gray-200', 'text-custom-forest', 'text-gray-800','text-gray-500'],
  slate:  ['bg-white', 'border-gray-200', 'text-gray-600', 'text-gray-800','text-gray-500'],
  gray:   ['bg-white', 'border-gray-200', 'text-gray-600', 'text-gray-800', 'text-gray-500'],
};

export const SuggestedMediaBlock = ({ block }) => {
  const cfg = MEDIA_CONFIG[block.block_type] || MEDIA_CONFIG.suggested_image;
  const [bg, border, iconColor, textColor, subColor] = COLOR_MAP[cfg.color] || COLOR_MAP.blue;
  const c = parseContent(block.content);
  const instruction = c.instruction || c.purpose || c.description || cfg.desc;
  
  const asset = block.assets && block.assets.length > 0 ? block.assets[0] : null;
  const getFileUrl = (fileStr) => {
    if (!fileStr) return null;
    if (fileStr.startsWith('http')) return fileStr;
    const path = fileStr.startsWith('/') ? fileStr : `/media/${fileStr}`;
    return `${BASE_URL}${path}`;
  };
  const assetUrl = getFileUrl(asset?.url) || getFileUrl(asset?.file);
  
  const isVideo = asset 
    ? ['video', 'youtube'].includes(asset.asset_type) 
    : ['suggested_video', 'video_ref'].includes(block.block_type);
  const resolvedUrl = assetUrl || c.resolved_url || c.url || c.resolved_video_id;
  const resolvedImageUrl = !isVideo ? (resolvedUrl || c.resolved_image_url) : c.resolved_image_url;

  if (resolvedImageUrl && !isVideo) {
    if (asset?.asset_type === 'external_link' || 
        ['suggested_external_link', 'suggested_activity', 'suggested_simulation', 'simulation_placeholder'].includes(block.block_type) ||
        asset?.asset_type === 'simulation') {
        return (
          <div className="my-6 bg-white border border-gray-200/60 rounded-xl overflow-hidden shadow-sm">
             <div className="px-6 py-5 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">{cfg.label}</p>
                   <p className="font-semibold text-gray-800 text-base mt-1 font-sans">{block.title}</p>
                </div>
                <a href={resolvedImageUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition">Open Link</a>
             </div>
          </div>
        );
    }
    return (
      <div className="my-10 flex flex-col items-center">
        <figure className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200/60 w-full overflow-hidden">
          <img src={resolvedImageUrl} alt={block.title} className="w-full h-auto object-cover rounded-xl" />
          {block.title && <figcaption className="text-gray-500 mt-4 mb-2 text-sm text-center font-medium font-sans">{block.title}</figcaption>}
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
          <div className="my-10 bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <div className="aspect-video w-full">
              <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
            <div className="px-5 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-800 font-semibold text-sm font-sans">{block.title || 'Video Resource'}</span>
              <PlayCircle className="text-gray-400 w-5 h-5 shrink-0" />
            </div>
          </div>
        );
    }
    
    return (
      <div className="my-10 bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <div className="aspect-video w-full">
          <video controls className="w-full h-full" src={resolvedUrl}>
            Your browser doesn't support video.
          </video>
        </div>
        <div className="px-5 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
          <span className="text-gray-800 font-semibold text-sm font-sans">{block.title || 'Video Resource'}</span>
          <PlayCircle className="text-gray-400 w-5 h-5 shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className={`my-8 ${bg} border ${border} rounded-xl overflow-hidden shadow-sm`}>
      <div className="px-6 py-5 flex items-start gap-4">
        <cfg.icon className={`${iconColor} w-6 h-6 mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className={`text-[10px] font-bold ${iconColor} uppercase tracking-widest font-sans`}>{cfg.label}</p>
          </div>
          {block.title && <p className={`font-semibold ${textColor} text-base mb-2 font-sans`}>{block.title}</p>}
          <div className={`${subColor} text-sm leading-relaxed whitespace-pre-wrap font-sans`}>{instruction}</div>
        </div>
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
    <div className="mt-12 mb-8 bg-custom-forest border border-custom-forest-light rounded-2xl px-8 py-8 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Check className="text-white w-5 h-5" />
        </div>
        <p className="font-bold text-white text-xl font-serif">Concept Complete</p>
      </div>

      {takeaways.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 font-sans">You now understand</p>
          <ul className="space-y-2">
            {takeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-white/90 text-base font-sans">
                <span className="text-custom-ochre mt-0.5">•</span>
                <span>{t.replace(/^[•\-*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLast && nextPageTitle && (
        <p className="text-sm text-white/70 border-t border-white/10 pt-5 mt-2 font-sans">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Next up:</span> <br/>
          <span className="text-lg font-serif text-white">{nextPageTitle}</span>
        </p>
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
    <div className="my-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-custom-cream px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h4 className="font-bold text-gray-900 text-base font-serif">{block?.title || 'Comparison Matrix'}</h4>
        <span className="text-xs font-semibold px-2.5 py-1 bg-custom-terracotta/10 text-custom-terracotta rounded-full">Comparative Analysis</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {headers.map((h, i) => (
                <th key={i} className="p-3.5 font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-gray-100 hover:bg-gray-50/50">
                {Array.isArray(row) ? row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-3.5 text-gray-800">{cell}</td>
                )) : (
                  <td colSpan={headers.length} className="p-3.5 text-gray-800">{String(row)}</td>
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
  const steps = c.steps || (c.text ? c.text.split('\n').filter(s => s.trim()) : []);

  return (
    <div className="my-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h4 className="font-bold text-gray-900 text-base font-serif mb-6 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-custom-terracotta inline-block"></span>
        {block?.title || 'Sequential Process Flow'}
      </h4>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-custom-forest text-white font-bold flex items-center justify-center text-sm shrink-0">
              {idx + 1}
            </div>
            <div className="text-gray-800 text-sm leading-relaxed pt-1">
              {typeof step === 'string' ? step : step.title || step.description || JSON.stringify(step)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
