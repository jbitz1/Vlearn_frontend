import React from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, Image, Video, Activity, HelpCircle, Database, BookOpen } from 'lucide-react';

export default function QualityBar({ blocks, assets, onPublish, lessonStatus, concepts = [] }) {
    const metrics = computeMetrics(blocks, assets, concepts);
    const allGood = metrics.conceptCoverage === 100 && metrics.mediaCoverage >= 50 && metrics.knowledgeCheckCount > 0;

    return (
        <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 text-xs shadow-sm z-20 overflow-x-auto whitespace-nowrap">
            <span className="font-extrabold text-gray-800 uppercase tracking-widest text-[10px] mr-2">Lesson Health</span>
            
            <Metric icon={Clock} label="Reading Time" value={`${metrics.readingTime} min`} />
            <Metric icon={FileText} label="Words" value={metrics.words} />
            <Metric icon={BookOpen} label="Concepts" value={metrics.conceptsCount} />
            <Metric icon={Image} label="Images" value={metrics.imageCount} />
            <Metric icon={Video} label="Videos" value={metrics.videoCount} />
            <Metric icon={Activity} label="Activities" value={metrics.activityCount} />
            <Metric icon={HelpCircle} label="Checks" value={metrics.knowledgeCheckCount} />
            <Metric icon={Database} label="Repo Coverage" value={`${metrics.repoCoverage}%`} />

            <div className="flex-1 min-w-[20px]" />

            {/* Readiness summary */}
            {allGood ? (
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-bold flex-shrink-0">
                    <CheckCircle size={14} />
                    Ready to Publish: YES
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full font-bold flex-shrink-0">
                    <AlertCircle size={14} />
                    Ready to Publish: NO
                </div>
            )}

            {/* Publish / Republish button */}
            <button
                onClick={onPublish}
                className={`px-5 py-2 rounded-full text-xs font-bold text-white transition-all shadow-sm flex-shrink-0 ${
                    lessonStatus === 'published'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : allGood
                            ? 'bg-custom-blue hover:opacity-90'
                            : 'bg-gray-400 hover:bg-gray-500'
                }`}
            >
                {lessonStatus === 'published' ? 'Republish' : 'Publish'}
            </button>
        </div>
    );
}

function Metric({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-1.5 text-gray-600">
            <Icon size={13} className="text-gray-400" />
            <span className="font-medium text-gray-500">{label}:</span>
            <span className="font-bold text-gray-800">{value}</span>
        </div>
    );
}

function computeMetrics(blocks, assets, concepts) {
    let words = 0;
    blocks.forEach(b => {
        let text = b.content || '';
        if (typeof text === 'object') text = JSON.stringify(text);
        words += text.split(/\s+/).length;
    });

    const readingTime = Math.max(1, Math.ceil(words / 200));
    const conceptsCount = concepts.length > 0 ? concepts.length : blocks.length;
    
    const imageCount = assets.filter(a => ['image', 'diagram', 'gif'].includes(a.asset_type)).length;
    const videoCount = assets.filter(a => ['video', 'youtube'].includes(a.asset_type)).length;
    
    const activityCount = blocks.filter(b => b.block_type === 'experiment').length;
    const knowledgeCheckCount = blocks.filter(b => ['knowledge_check', 'revision_questions'].includes(b.block_type)).length;

    const repoAssets = assets.filter(a => a.source_type === 'knowledge_repository').length;
    const totalAssets = assets.length;
    const repoCoverage = totalAssets === 0 ? 100 : Math.round((repoAssets / totalAssets) * 100);

    const EMPTY_TYPES = ['suggested_diagram', 'suggested_video', 'suggested_image', 'suggested_gif', 'suggested_simulation', 'suggested_external_link', 'image_placeholder', 'video_ref', 'simulation_placeholder'];
    const textBlocks = blocks.filter((b) => !EMPTY_TYPES.includes(b.block_type));
    const filledConcepts = textBlocks.filter((b) => {
        const text = extractText(b.content);
        return text && text.trim().length > 10;
    }).length;

    const attachedAssets = assets.filter((a) => a.status === 'attached').length;

    return {
        words,
        readingTime,
        conceptsCount,
        imageCount,
        videoCount,
        activityCount,
        knowledgeCheckCount,
        repoCoverage,
        conceptCoverage: textBlocks.length === 0 ? 100 : Math.round((filledConcepts / textBlocks.length) * 100),
        mediaCoverage: totalAssets === 0 ? 100 : Math.round((attachedAssets / totalAssets) * 100),
    };
}

function extractText(content) {
    if (!content) return '';
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return parsed?.text || parsed?.content || parsed?.question || content;
        } catch {
            return content;
        }
    }
    return content.text || content.content || content.question || '';
}
