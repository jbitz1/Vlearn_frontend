import React, { useState } from 'react';
import apiClient from '../../../../config/apiClient';
import BASE_URL from '../../../../config';
import {
    BarChart2, Video, Image as ImageIcon, Play, Layers,
    ExternalLink, Upload, Youtube, Link2, Database,
    CheckCircle, Clock, XCircle, ChevronDown, ChevronUp,
    AlertTriangle, Lightbulb, Trash2
} from 'lucide-react';

// Map suggested component types to display metadata
const ASSET_TYPE_META = {
    diagram:       { icon: BarChart2,    color: 'text-pink-600',   bg: 'bg-pink-50',   border: 'border-pink-200',  label: 'Diagram' },
    image:         { icon: ImageIcon,    color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200',  label: 'Image' },
    video:         { icon: Video,        color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',   label: 'Video' },
    youtube:       { icon: Youtube,      color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',   label: 'YouTube' },
    gif:           { icon: Play,         color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',label: 'GIF / Animation' },
    simulation:    { icon: Layers,       color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200',  label: 'Simulation' },
    external_link: { icon: ExternalLink, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',  label: 'External Link' },
    repository_asset:{ icon: Database,   color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',label: 'Repository Asset' },
};

const STATUS_META = {
    pending:  { icon: Clock,        label: 'Missing',  color: 'text-amber-600',  bg: 'bg-amber-50' },
    attached: { icon: CheckCircle,  label: 'Attached', color: 'text-emerald-600',bg: 'bg-emerald-50' },
    archived: { icon: XCircle,      label: 'Archived', color: 'text-gray-500',   bg: 'bg-gray-50' },
};

function getAttachMode(assetType) {
    if (assetType === 'youtube') return ['youtube', 'url'];
    if (assetType === 'external_link') return ['url'];
    if (assetType === 'simulation') return ['url', 'upload'];
    if (['diagram', 'image', 'gif'].includes(assetType)) return ['upload', 'url', 'repository'];
    if (assetType === 'video') return ['upload', 'url', 'youtube', 'repository'];
    if (assetType === 'repository_asset') return ['repository'];
    return ['upload', 'url'];
}

/**
 * MediaSlot — renders a single LessonAsset as an actionable placeholder.
 * When attached, renders a preview of the media instead of the placeholder.
 */
export function MediaSlot({ asset, lessonId, blockId, onAssetUpdated }) {
    const [expanded, setExpanded] = useState(asset.status === 'pending');
    const [mode, setMode] = useState(asset.asset_type === 'repository_asset' ? 'repository' : null); // 'upload' | 'url' | 'youtube' | 'repository'
    const [urlInput, setUrlInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const meta = ASSET_TYPE_META[asset.asset_type] || ASSET_TYPE_META.image;
    const statusMeta = STATUS_META[asset.status] || STATUS_META.pending;
    const Icon = meta.icon;
    const StatusIcon = statusMeta.icon;
    const attachModes = getAttachMode(asset.asset_type);

    const handleUrlAttach = async () => {
        if (!urlInput.trim()) return;
        setError(null);
        try {
            const payload = {
                url: urlInput.trim(),
                storage_type: 'url',
                status: 'attached',
            };
            if (!asset.id) {
                payload.lesson = lessonId;
                payload.blocks = [blockId];
                payload.asset_type = asset.asset_type;
                payload.title = asset.title;
                payload.description = asset.description;
                await apiClient.post(`/api/curriculum/lesson-assets/`, payload);
            } else {
                await apiClient.patch(`/api/curriculum/lesson-assets/${asset.id}/`, payload);
            }
            onAssetUpdated();
            setMode(null);
            setUrlInput('');
        } catch {
            setError('Failed to save URL. Please try again.');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError(null);
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('storage_type', 'file');
        formData.append('status', 'attached');
        
        try {
            if (!asset.id) {
                formData.append('lesson', lessonId);
                formData.append('asset_type', asset.asset_type);
                formData.append('title', asset.title || '');
                formData.append('description', asset.description || '');
                const res = await apiClient.post(`/api/curriculum/lesson-assets/`, formData);
                await apiClient.post(`/api/curriculum/lesson-assets/${res.data.id}/attach_to_block/`, { block_id: blockId });
            } else {
                await apiClient.patch(`/api/curriculum/lesson-assets/${asset.id}/`, formData);
            }
            onAssetUpdated();
        } catch {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleMarkLater = async () => {
        try {
            if (!asset.id) {
                await apiClient.post(`/api/curriculum/lesson-assets/`, {
                    lesson: lessonId,
                    blocks: [blockId],
                    asset_type: asset.asset_type,
                    title: asset.title,
                    description: asset.description,
                    status: 'pending'
                });
            } else {
                await apiClient.patch(`/api/curriculum/lesson-assets/${asset.id}/`, { status: 'pending' });
            }
            setExpanded(false);
            setMode(null);
            onAssetUpdated();
        } catch {
            // non-critical
        }
    };

    const handleRepositoryAttach = async (item, isVideo) => {
        try {
            const payload = isVideo ? {
                url: item.playback_url,
                source_type: 'external',
                storage_type: 'url',
                status: 'attached',
                title: item.title,
                asset_type: 'video',
                metadata: {
                    cloudflare_video_id: item.cloudflare_video_id,
                    duration: item.duration,
                }
            } : {
                knowledge_chunk: item.id,
                source_type: 'knowledge_repository',
                status: 'attached',
                url: item.image || null,
            };

            if (!asset.id) {
                payload.lesson = lessonId;
                payload.blocks = [blockId];
                if (!isVideo) {
                    payload.asset_type = asset.asset_type;
                    payload.title = asset.title;
                    payload.description = asset.description;
                }
                await apiClient.post(`/api/curriculum/lesson-assets/`, payload);
            } else {
                await apiClient.patch(`/api/curriculum/lesson-assets/${asset.id}/`, payload);
            }
            onAssetUpdated();
            setMode(null);
        } catch {
            setError('Failed to attach repository asset.');
        }
    };

    return (
        <div className={`rounded-xl border-2 ${
            asset.status === 'attached' ? 'border-emerald-200 bg-emerald-50/30' : `${meta.border} ${meta.bg}`
        } overflow-hidden transition-all`}>
            {/* Slot header */}
            <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setExpanded((v) => !v)}
            >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.bg} border ${meta.border}`}>
                    <Icon size={16} className={meta.color} />
                </span>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${meta.color}`}>
                        {asset.title || meta.label}
                    </p>
                    {asset.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{asset.description}</p>
                    )}
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta.bg} ${statusMeta.color}`}>
                    <StatusIcon size={11} />
                    {statusMeta.label}
                </div>
                {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>

            {expanded && (
                <div className="border-t border-gray-100 p-4 bg-white space-y-4">

                    {/* AI instruction */}
                    {asset.metadata?.admin_instruction && (
                        <div className="flex items-start gap-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
                            <Lightbulb size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-indigo-900 mb-1">AI Recommendation</p>
                                <div className="text-sm text-indigo-800 leading-relaxed whitespace-pre-line">
                                    {asset.metadata.admin_instruction}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Current preview if attached */}
                    {asset.status === 'attached' && (asset.url || asset.file) && (
                        <AttachedPreview asset={asset} />
                    )}

                    {/* Action bar */}
                    {asset.status !== 'attached' && !mode && (
                        <div className="flex flex-wrap gap-2">
                            {attachModes.includes('upload') && (
                                <label className="cursor-pointer px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                                    <Upload size={12} />
                                    Upload File
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,.gif,.pdf" />
                                </label>
                            )}
                            {attachModes.includes('youtube') && (
                                <button
                                    onClick={() => setMode('youtube')}
                                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1.5"
                                >
                                    <Youtube size={12} /> YouTube URL
                                </button>
                            )}
                            {attachModes.includes('url') && (
                                <button
                                    onClick={() => setMode('url')}
                                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5"
                                >
                                    <Link2 size={12} /> Paste URL
                                </button>
                            )}
                            {attachModes.includes('repository') && (
                                <button
                                    onClick={() => setMode('repository')}
                                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1.5"
                                >
                                    <Database size={12} /> Repository
                                </button>
                            )}
                            <button
                                onClick={handleMarkLater}
                                className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                            >
                                Add Later
                            </button>
                        </div>
                    )}

                    {/* URL / YouTube input */}
                    {(mode === 'url' || mode === 'youtube') && (
                        <div className="space-y-2">
                            <input
                                type="url"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-custom-blue"
                                placeholder={mode === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://...'}
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUrlAttach}
                                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-custom-blue text-white hover:opacity-90"
                                >
                                    Attach
                                </button>
                                <button
                                    onClick={() => { setMode(null); setUrlInput(''); }}
                                    className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Repository browser */}
                    {mode === 'repository' && (
                        <RepositoryBrowser
                            onSelect={handleRepositoryAttach}
                            onCancel={() => setMode(null)}
                            isVideo={['video', 'youtube', 'repository_asset'].includes(asset.asset_type)}
                        />
                    )}

                    {/* Upload state */}
                    {uploading && (
                        <div className="text-xs text-gray-500 animate-pulse">Uploading...</div>
                    )}

                    {/* Replace button if already attached */}
                    {asset.status === 'attached' && (
                        <div className="flex gap-2">
                            <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                                <Upload size={11} /> Replace
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                            <button
                                onClick={() => setMode('url')}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
                            >
                                <Link2 size={11} /> Change URL
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await apiClient.patch(`/api/curriculum/lesson-assets/${asset.id}/`, {
                                            status: 'pending',
                                            url: null,
                                            storage_type: 'url'
                                        });
                                        onAssetUpdated();
                                    } catch {
                                        setError('Failed to remove media.');
                                    }
                                }}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                            >
                                <Trash2 size={11} /> Remove
                            </button>
                        </div>
                    )}

                    {error && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle size={12} /> {error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Shows a preview of the attached asset.
 */
function AttachedPreview({ asset }) {
    const getFileUrl = (fileStr) => {
        if (!fileStr) return null;
        if (fileStr.startsWith('http')) return fileStr;
        const path = fileStr.startsWith('/') ? fileStr : `/media/${fileStr}`;
        return `${BASE_URL}${path}`;
    };
    const url = getFileUrl(asset.url) || getFileUrl(asset.file);

    if (!url) return null;

    if (asset.asset_type === 'youtube') {
        const videoId = extractYouTubeId(url);
        if (videoId) {
            return (
                <div className="rounded-lg overflow-hidden aspect-video bg-black">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="YouTube preview"
                    />
                </div>
            );
        }
    }

    if (['image', 'diagram', 'gif'].includes(asset.asset_type)) {
        return (
            <div className="rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt={asset.title || 'Asset'} className="w-full h-auto max-h-48 object-contain bg-gray-50" />
            </div>
        );
    }

    if (asset.asset_type === 'video') {
        return (
            <video controls className="w-full rounded-lg max-h-48" src={url}>
                Your browser doesn't support video.
            </video>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-custom-blue hover:underline"
        >
            <ExternalLink size={12} />
            {url}
        </a>
    );
}

/**
 * Simple repository browser: fetches knowledge chunks or videos.
 */
function RepositoryBrowser({ onSelect, onCancel, isVideo = false }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        setLoading(true);
        if (isVideo) {
            apiClient.get(`/experiment_videos//`)
                .then((r) => setItems(r.data.results || r.data || []))
                .catch(() => setItems([]))
                .finally(() => setLoading(false));
        } else {
            apiClient.get(`/api/curriculum/knowledge-chunks/?chunk_type=diagram&page_size=20`)
                .then((r) => setItems(r.data.results || r.data || []))
                .catch(() => setItems([]))
                .finally(() => setLoading(false));
        }
    }, [isVideo]);

    const select = (item) => {
        onSelect(item, isVideo);
    };

    if (loading) return <p className="text-xs text-gray-400">Loading repository...</p>;
    if (items.length === 0) return (
        <div className="text-xs text-gray-500 text-center py-4">
            No {isVideo ? 'videos' : 'diagrams'} found in repository.
            <button onClick={onCancel} className="block mx-auto mt-2 text-custom-blue underline">Cancel</button>
        </div>
    );

    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600">Repository {isVideo ? 'Videos' : 'Diagrams'}</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => select(item)}
                        className="w-full text-left flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 text-xs text-gray-700"
                    >
                        <Database size={12} className="text-purple-500 flex-shrink-0" />
                        <span className="truncate">{isVideo ? item.title : (item.section_title || `Chunk ${item.id}`)}</span>
                    </button>
                ))}
            </div>
            <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 underline">Cancel</button>
        </div>
    );
}

function extractYouTubeId(url) {
    try {
        const u = new URL(url);
        return u.searchParams.get('v') || u.pathname.split('/').pop() || null;
    } catch {
        return null;
    }
}
