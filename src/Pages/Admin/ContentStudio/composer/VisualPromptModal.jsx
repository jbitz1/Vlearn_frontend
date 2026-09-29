import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, Image as ImageIcon, Atom, Video, AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '../../../../config/apiClient';

export default function VisualPromptModal({
    isOpen,
    onClose,
    lessonId,
    lessonTitle = '',
    conceptPageNum,
    targetBlock = null,
    targetAsset = null,
    existingBlocks = [],
    onSuccess,
}) {
    const isUpdate = Boolean(targetBlock);
    const [prompt, setPrompt] = useState('');
    const [visualType, setVisualType] = useState('suggested_diagram');
    const [targetBlockId, setTargetBlockId] = useState('');
    const [placement, setPlacement] = useState('after');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Synchronize initial state when modal opens or target changes
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setSuccessMsg(null);
            setPrompt('');
            if (targetBlock) {
                setTargetBlockId(String(targetBlock.id));
                setPlacement('replace');
                if (targetBlock.block_type && targetBlock.block_type.startsWith('suggested_')) {
                    setVisualType(targetBlock.block_type);
                } else if (targetBlock.block_type === 'simulation') {
                    setVisualType('suggested_simulation');
                } else {
                    setVisualType('suggested_diagram');
                }
            } else {
                setTargetBlockId('');
                setPlacement('after');
                setVisualType('suggested_diagram');
            }
        }
    }, [isOpen, targetBlock]);

    if (!isOpen) return null;

    const currentVisualTitle = targetAsset?.title || targetAsset?.description || (targetBlock?.assets?.[0]?.title) || null;
    const componentName = targetBlock?.title || targetBlock?.component_type || targetBlock?.block_type || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            setError('Please describe what visual changes you require.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const finalPlacement = targetBlock ? 'replace' : placement;
            const finalBlockId = targetBlock ? targetBlock.id : (targetBlockId ? parseInt(targetBlockId, 10) : null);

            const res = await apiClient.post(`/api/curriculum/lessons/${lessonId}/generate-visual/`, {
                prompt: trimmedPrompt,
                visual_type: visualType,
                target_block_id: finalBlockId,
                placement: finalPlacement,
                page_number: conceptPageNum,
            });

            const jobId = res.data?.visual_job_id;
            if (jobId) {
                setSuccessMsg('AI is generating the visualization... Please wait a few seconds.');
                
                // Poll job until completed or failed
                const maxAttempts = 35; // 35 * 2.5s = ~87s
                let completed = false;

                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    await new Promise(r => setTimeout(r, 2500));
                    try {
                        const jobRes = await apiClient.get(`/api/curriculum/visual-generation-jobs/${jobId}/`);
                        const jobData = jobRes.data;

                        if (jobData.status === 'completed') {
                            completed = true;
                            setSuccessMsg('Visualization generated and attached successfully!');
                            setIsSubmitting(false);
                            setTimeout(() => {
                                if (onSuccess) onSuccess();
                                onClose();
                            }, 1200);
                            return;
                        }

                        if (jobData.status === 'failed') {
                            completed = true;
                            setIsSubmitting(false);
                            setError(jobData.error_message || 'Visual generation failed. Please refine your prompt and try again.');
                            setSuccessMsg(null);
                            return;
                        }
                    } catch (pollErr) {
                        console.warn('Visual job poll attempt failed:', pollErr);
                    }
                }

                if (!completed) {
                    setIsSubmitting(false);
                    setSuccessMsg('Generation is taking longer than usual. It will finish processing in the background.');
                    setTimeout(() => {
                        if (onSuccess) onSuccess();
                        onClose();
                    }, 2000);
                    return;
                }
            } else {
                setSuccessMsg(res.data?.detail || 'Visual generation started successfully.');
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                }, 1000);
            }
        } catch (err) {
            console.error('Visual generation request failed:', err);
            const status = err.response?.status;
            const serverDetail = err.response?.data?.detail || err.response?.data?.prompt?.[0];

            if (status === 400) {
                setError(serverDetail || 'Invalid prompt or parameters. Please refine your visual instructions.');
            } else if (status === 401 || status === 403) {
                setError('Unauthorized. Platform administrator privileges are required to generate visuals.');
            } else if (status === 404) {
                setError('The targeted lesson or component could not be found.');
            } else if (status >= 500) {
                setError(serverDetail || 'Visual generation service temporarily unavailable. The existing visual was safely preserved.');
            } else {
                setError(serverDetail || err.message || 'Failed to trigger visual generation.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={isSubmitting ? undefined : onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50/80 via-blue-50/50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-custom-orange/10 text-custom-orange rounded-2xl">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900">
                                {isUpdate ? 'Update Component Visualization' : 'Generate Targeted Visualization'}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {isUpdate 
                                    ? 'Provide specific instructions to refine this card without altering the rest of the lesson'
                                    : 'Insert a new AI-generated visual directly into the lesson hierarchy'
                                }
                            </p>
                        </div>
                    </div>
                    {!isSubmitting && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Focused Context Banner */}
                    <div className="bg-slate-50 border border-gray-200/70 rounded-2xl p-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-gray-500">
                            <span className="font-semibold text-gray-600">Lesson:</span>
                            <span className="font-bold text-gray-900 truncate max-w-[280px]">
                                {lessonTitle || `Lesson #${lessonId}`}
                            </span>
                        </div>
                        {componentName && (
                            <div className="flex items-center justify-between text-gray-500 pt-1 border-t border-gray-200/50">
                                <span className="font-semibold text-gray-600">Component Card:</span>
                                <span className="font-bold text-custom-blue truncate max-w-[280px]">
                                    {componentName}
                                </span>
                            </div>
                        )}
                        {currentVisualTitle && (
                            <div className="flex items-center justify-between text-gray-500 pt-1 border-t border-gray-200/50">
                                <span className="font-semibold text-gray-600">Current Visual:</span>
                                <span className="font-semibold text-emerald-700 truncate max-w-[280px]">
                                    {currentVisualTitle}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Feedback Banners */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Administrator Instruction Field */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            {isUpdate ? 'What would you like to change? *' : 'Visualization Prompt & Requirements *'}
                        </label>
                        <textarea
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isSubmitting}
                            placeholder={isUpdate
                                ? 'e.g. "Replace the current diagram with a labeled cross-section showing the three layers of the leaf. Make the xylem and phloem visually distinct and add clear directional arrows for transpiration."'
                                : 'e.g. "Diagram showing the alpha particle scattering experiment, highlighting beam deflection angles around a heavy nucleus."'
                            }
                            className="w-full px-3.5 py-2.5 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-custom-orange/30 focus:border-custom-orange transition-all placeholder:text-gray-400 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                            required
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Your instructions will be combined with curriculum context and existing component data.
                        </p>
                    </div>

                    {/* Visual Type & Placement Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Visual Format
                            </label>
                            <select
                                value={visualType}
                                onChange={(e) => setVisualType(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-custom-orange/30 disabled:bg-gray-50"
                            >
                                <option value="suggested_diagram">Scientific Diagram / SVG</option>
                                <option value="suggested_simulation">Interactive Simulation</option>
                                <option value="visualization">Pedagogical Infographic / Chart</option>
                            </select>
                        </div>

                        {!isUpdate ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Placement Relative To
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={placement}
                                        onChange={(e) => setPlacement(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-24 px-2 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white disabled:bg-gray-50"
                                    >
                                        <option value="after">After</option>
                                        <option value="before">Before</option>
                                    </select>
                                    <select
                                        value={targetBlockId}
                                        onChange={(e) => setTargetBlockId(e.target.value)}
                                        disabled={isSubmitting}
                                        className="flex-1 px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white truncate disabled:bg-gray-50"
                                    >
                                        <option value="">End of Concept</option>
                                        {existingBlocks.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.title || `${b.block_type} (#${b.order})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-end">
                                <span className="text-[11px] text-gray-400 italic">
                                    Safely replaces current visual only upon successful validation.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !prompt.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-custom-orange hover:bg-custom-orange/90 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Generating visualization...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>{isUpdate ? 'Update Visualization' : 'Generate Visualization'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
