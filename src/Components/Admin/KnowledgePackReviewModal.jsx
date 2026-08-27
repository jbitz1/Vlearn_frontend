import React, { useState } from 'react';
import { X, Check, Trash2, GripVertical, AlertCircle, ListTree, Plus } from 'lucide-react';
import apiClient from '../../config/apiClient';

export default function KnowledgePackReviewModal({ knowledgePack, onClose, onApprove, onDelete }) {
    const [structure, setStructure] = useState(knowledgePack.extracted_structure || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTitleChange = (topicIndex, unitIndex, newTitle) => {
        const newStructure = [...structure];
        if (unitIndex === null) {
            newStructure[topicIndex].title = newTitle;
        } else {
            newStructure[topicIndex].children[unitIndex].title = newTitle;
        }
        setStructure(newStructure);
    };

    const handleDelete = (topicIndex, unitIndex) => {
        const newStructure = [...structure];
        if (unitIndex === null) {
            newStructure.splice(topicIndex, 1);
        } else {
            newStructure[topicIndex].children.splice(unitIndex, 1);
        }
        setStructure(newStructure);
    };

    const handlePageChange = (topicIndex, unitIndex, newPage) => {
        const newStructure = [...structure];
        const val = parseInt(newPage) || 0;
        if (unitIndex === null) {
            newStructure[topicIndex].start_page = val;
        } else {
            newStructure[topicIndex].children[unitIndex].start_page = val;
        }
        setStructure(newStructure);
    };

    const handleAddTopic = () => {
        setStructure([...structure, { id: Date.now().toString(), title: 'New Topic', start_page: 1, type: 'topic', children: [] }]);
    };

    const handleAddUnit = (topicIndex) => {
        const newStructure = [...structure];
        newStructure[topicIndex].children.push({ id: Date.now().toString(), title: 'New Unit', start_page: 1, type: 'unit' });
        setStructure(newStructure);
    };

    const handleApprove = async () => {
        try {
            setLoading(true);
            setError('');
            await apiClient.post(`/api/curriculum/knowledge-packs/${knowledgePack.id}/approve/`, {
                structure: structure
            });
            onApprove();
        } catch (err) {
            console.error('Error approving knowledge pack:', err);
            setError(err.response?.data?.detail || 'Failed to approve knowledge pack.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExtraction = async () => {
        if (!window.confirm('Are you sure you want to delete this extracted Knowledge Pack? This will delete all extracted chunks and remove the textbook.')) {
            return;
        }
        try {
            setLoading(true);
            setError('');
            await apiClient.delete(`/api/curriculum/knowledge-packs/${knowledgePack.id}/`);
            if (onDelete) {
                onDelete(knowledgePack.id);
            } else {
                onClose();
            }
        } catch (err) {
            console.error('Error deleting knowledge pack:', err);
            setError(err.response?.data?.detail || 'Failed to delete knowledge pack.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ListTree className="w-5 h-5 text-custom-blue" />
                            Review Extracted Structure
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review and edit the topics and learning units extracted from the textbook.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    
                    {structure.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200 border-dashed">
                            No structured content could be extracted deterministically.
                            <br />
                            You can approve an empty structure and build it manually, or delete this extraction.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {structure.map((topic, tIndex) => (
                                <div key={topic.id || tIndex} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-gray-100 p-3 flex items-center gap-3 border-b border-gray-200 group">
                                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move shrink-0" />
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={topic.title}
                                                onChange={(e) => handleTitleChange(tIndex, null, e.target.value)}
                                                className="flex-1 bg-white border border-gray-200 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-custom-blue rounded px-2 py-1"
                                                placeholder="Topic Title"
                                            />
                                            <div className="flex items-center gap-1.5 shrink-0 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                                                <span className="text-xs font-semibold text-blue-700">Start Page:</span>
                                                <input
                                                    type="number"
                                                    value={topic.start_page || ''}
                                                    onChange={(e) => handlePageChange(tIndex, null, e.target.value)}
                                                    className="w-16 bg-white border border-gray-300 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-custom-blue rounded px-2 py-0.5"
                                                    placeholder="1"
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(tIndex, null)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete Topic"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="p-3 pl-10 space-y-2">
                                        {topic.children?.length === 0 && (
                                            <div className="text-sm text-gray-400 italic py-2">No learning units extracted for this topic.</div>
                                        )}
                                        {topic.children?.map((unit, uIndex) => (
                                            <div key={unit.id || uIndex} className="flex items-center gap-3 group">
                                                <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0"></div>
                                                <div className="flex-1 flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={unit.title}
                                                        onChange={(e) => handleTitleChange(tIndex, uIndex, e.target.value)}
                                                        className="flex-1 text-sm bg-white border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-custom-blue rounded px-2 py-1"
                                                        placeholder="Learning Unit Title"
                                                    />
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <span className="text-xs text-gray-500">Page:</span>
                                                        <input
                                                            type="number"
                                                            value={unit.start_page || ''}
                                                            onChange={(e) => handlePageChange(tIndex, uIndex, e.target.value)}
                                                            className="w-16 bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-custom-blue rounded px-2 py-1"
                                                            placeholder="1"
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(tIndex, uIndex)}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete Unit"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => handleAddUnit(tIndex)}
                                            className="text-xs text-custom-blue hover:text-blue-700 font-medium flex items-center gap-1 py-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Learning Unit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <button 
                        onClick={handleAddTopic}
                        className="mt-4 text-sm bg-white border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium flex items-center justify-center gap-2 w-full py-3 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Topic
                    </button>
                </div>

                <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
                    <button 
                        onClick={handleDeleteExtraction}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                        disabled={loading}
                        title="Permanently delete this extraction and textbook"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Extraction
                    </button>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleApprove}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-custom-blue hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Approve & Populate
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
