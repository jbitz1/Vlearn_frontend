import React, { useState, useCallback } from 'react';
import { Wand2, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = '/api/curriculum';

/**
 * VisualizationEditor
 * ───────────────────
 * Lets the admin enter a free-text prompt and trigger an on-demand
 * SVG / Mermaid visual generation job for the current lesson block.
 *
 * The component:
 * 1. Accepts a text prompt from the admin.
 * 2. POSTs to POST /api/curriculum/lesson-blocks/{id}/generate-visual/
 * 3. Polls GET /api/curriculum/visual-generation-jobs/{id}/ until done.
 * 4. Renders the generated SVG/Mermaid inline on completion.
 */
export default function VisualizationEditor({ block, onChange, onSave }) {
    const [prompt, setPrompt] = useState(
        block.content?.prompt || ''
    );
    const [status, setStatus] = useState('idle'); // idle | generating | completed | failed
    const [errorMsg, setErrorMsg] = useState('');
    const [generatedCode, setGeneratedCode] = useState(
        block.content?.generated_code || ''
    );
    const [visualFormat, setVisualFormat] = useState(
        block.content?.visual_format || ''
    );

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const pollJob = useCallback(async (jobId) => {
        const maxAttempts = 30; // 30 × 3s = ~90s max
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(r => setTimeout(r, 3000));
            try {
                const res = await fetch(`${API_BASE}/visual-generation-jobs/${jobId}/`, {
                    headers: { ...getAuthHeaders() }
                });
                if (!res.ok) continue;
                const data = await res.json();
                if (data.status === 'completed') {
                    const code = data.result_asset_metadata?.generated_code || '';
                    const fmt = data.result_asset_metadata?.visual_format || 'svg';
                    setGeneratedCode(code);
                    setVisualFormat(fmt);
                    setStatus('completed');
                    // Persist into block content
                    const updated = {
                        ...block,
                        content: {
                            ...block.content,
                            prompt,
                            generated_code: code,
                            visual_format: fmt,
                            visual_job_id: jobId,
                        }
                    };
                    onChange(updated);
                    onSave(updated);
                    return;
                }
                if (data.status === 'failed') {
                    setStatus('failed');
                    setErrorMsg(data.error_message || 'Generation failed.');
                    return;
                }
                // still 'pending' or 'generating' — keep polling
            } catch {
                // network hiccup — keep trying
            }
        }
        setStatus('failed');
        setErrorMsg('Timed out waiting for visual generation.');
    }, [block, onChange, onSave, prompt]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setStatus('generating');
        setErrorMsg('');
        setGeneratedCode('');
        try {
            const res = await fetch(`${API_BASE}/lesson-blocks/${block.id}/generate-visual/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ prompt }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `HTTP ${res.status}`);
            }
            const { visual_job_id } = await res.json();
            pollJob(visual_job_id);
        } catch (err) {
            setStatus('failed');
            setErrorMsg(err.message || 'Failed to start visual generation.');
        }
    };

    const handleRetry = () => {
        setStatus('idle');
        setGeneratedCode('');
        setErrorMsg('');
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-indigo-100">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Wand2 size={16} className="text-indigo-600" />
                </span>
                <div>
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">AI Visualization</p>
                    <p className="text-xs text-gray-500">Describe the visual — AI will generate an SVG or Mermaid diagram.</p>
                </div>
            </div>

            {/* Prompt input */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Visual Prompt</label>
                <textarea
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-indigo-400"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A labelled diagram showing the sodium-potassium pump across a cell membrane, with arrows indicating ion movement..."
                    disabled={status === 'generating'}
                />
            </div>

            {/* Action button */}
            {status !== 'generating' && (
                <button
                    onClick={status === 'completed' ? handleRetry : handleGenerate}
                    disabled={!prompt.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${!prompt.trim()
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : status === 'completed'
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                >
                    {status === 'completed' ? (
                        <><RefreshCw size={14} /> Regenerate</>
                    ) : (
                        <><Wand2 size={14} /> Generate Visual</>
                    )}
                </button>
            )}

            {/* Generating spinner */}
            {status === 'generating' && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <Loader2 size={18} className="text-indigo-500 animate-spin shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-indigo-700">Generating visual…</p>
                        <p className="text-xs text-indigo-500">This may take 15–60 seconds.</p>
                    </div>
                </div>
            )}

            {/* Success — render generated visual */}
            {status === 'completed' && generatedCode && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Visual generated successfully</span>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-4">
                        {visualFormat === 'svg' ? (
                            <div
                                className="w-full"
                                dangerouslySetInnerHTML={{ __html: generatedCode }}
                            />
                        ) : (
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                                {generatedCode}
                            </pre>
                        )}
                    </div>
                </div>
            )}

            {/* Error */}
            {status === 'failed' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-red-700">Generation failed</p>
                        <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
                        <button
                            onClick={handleRetry}
                            className="text-xs text-red-600 hover:text-red-800 font-medium mt-1 underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
