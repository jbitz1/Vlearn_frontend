import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Plus, FolderTree, BookOpen, Layers, Target, Library, UploadCloud, Loader2, AlertCircle, Image as ImageIcon, PenTool, Trash2, Sparkles } from 'lucide-react';
import apiClient from '../../config/apiClient';
import KnowledgePackReviewModal from '../../Components/Admin/KnowledgePackReviewModal';

export default function CurriculumBuilder() {
    const navigate = useNavigate();

    // Data states
    const [curricula, setCurricula] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [learningUnits, setLearningUnits] = useState([]);

    // Selection states (with persistence)
    const [selectedCurriculum, setSelectedCurriculum] = useState(() => JSON.parse(localStorage.getItem('vlearn_cb_curriculum')) || null);
    const [selectedGrade, setSelectedGrade] = useState(() => JSON.parse(localStorage.getItem('vlearn_cb_grade')) || null);
    const [selectedSubject, setSelectedSubject] = useState(() => JSON.parse(localStorage.getItem('vlearn_cb_subject')) || null);
    const [selectedTopic, setSelectedTopic] = useState(() => JSON.parse(localStorage.getItem('vlearn_cb_topic')) || null);
    const [selectedUnit, setSelectedUnit] = useState(() => JSON.parse(localStorage.getItem('vlearn_cb_unit')) || null);

    useEffect(() => localStorage.setItem('vlearn_cb_curriculum', JSON.stringify(selectedCurriculum)), [selectedCurriculum]);
    useEffect(() => localStorage.setItem('vlearn_cb_grade', JSON.stringify(selectedGrade)), [selectedGrade]);
    useEffect(() => localStorage.setItem('vlearn_cb_subject', JSON.stringify(selectedSubject)), [selectedSubject]);
    useEffect(() => localStorage.setItem('vlearn_cb_topic', JSON.stringify(selectedTopic)), [selectedTopic]);
    useEffect(() => localStorage.setItem('vlearn_cb_unit', JSON.stringify(selectedUnit)), [selectedUnit]);
    
    // Repository Stats & Lesson State
    const [repoStats, setRepoStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [unitLesson, setUnitLesson] = useState(null);
    const [loadingLesson, setLoadingLesson] = useState(false);
    const [creatingManual, setCreatingManual] = useState(false);

    // Form states
    const [newNames, setNewNames] = useState({
        curriculum: '', grade: '', subject: '', topic: '', unit: ''
    });

    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadingPack, setUploadingPack] = useState(false);
    const [activePack, setActivePack] = useState(null); // The pack being processed/reviewed
    const [uploadMode, setUploadMode] = useState('normal'); // 'normal' | 'ai_ingestion'
    const [subjectPacks, setSubjectPacks] = useState([]);

    // Poll for status if a pack is processing
    useEffect(() => {
        let interval;
        if (activePack && activePack.status === 'processing') {
            interval = setInterval(async () => {
                try {
                    const res = await apiClient.get(`/api/curriculum/knowledge-packs/${activePack.id}/`);
                    setActivePack(res.data);
                } catch (err) {
                    console.error("Error polling pack:", err);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [activePack]);

    // Fetch repository stats and lesson status
    useEffect(() => {
        if (selectedUnit) {
            setLoadingStats(true);
            setLoadingLesson(true);
            apiClient.get(`/api/curriculum/learning-units/${selectedUnit.id}/repository_stats/`)
                .then(res => setRepoStats(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingStats(false));

            apiClient.get(`/api/curriculum/lessons/?learning_unit=${selectedUnit.id}`)
                .then(res => {
                    const lessons = res.data.results || res.data || [];
                    setUnitLesson(lessons.length > 0 ? lessons[0] : null);
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingLesson(false));
        } else {
            setRepoStats(null);
            setUnitLesson(null);
        }
    }, [selectedUnit]);

    const handleCreateManualInCurriculumBuilder = async () => {
        if (!selectedUnit) return;
        try {
            setCreatingManual(true);
            await apiClient.post(`/api/curriculum/learning-units/${selectedUnit.id}/create_manual_lesson/`);
            navigate(`/admin-dashboard/content-studio/${selectedUnit.id}`);
        } catch (err) {
            console.error("Failed to create manual lesson:", err);
            alert("Failed to create manual lesson.");
        } finally {
            setCreatingManual(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchData('/api/curriculum/curricula/', setCurricula);
    }, []);

    // Cascading fetches
    useEffect(() => {
        if (selectedCurriculum) {
            fetchData(`/api/curriculum/grades/?curriculum=${selectedCurriculum.id}`, setGrades);
        } else {
            setGrades([]);
        }
    }, [selectedCurriculum]);

    useEffect(() => {
        if (selectedGrade) {
            fetchData(`/api/curriculum/subjects/?grade=${selectedGrade.id}`, setSubjects);
        } else {
            setSubjects([]);
        }
    }, [selectedGrade]);

    useEffect(() => {
        if (selectedSubject) {
            fetchData(`/api/curriculum/topics/?subject=${selectedSubject.id}`, setTopics);
            apiClient.get(`/api/curriculum/knowledge-packs/?subject=${selectedSubject.id}`).then(res => setSubjectPacks(res.data.results || res.data)).catch(console.error);
        } else {
            setTopics([]);
            setSubjectPacks([]);
        }
    }, [selectedSubject]);

    useEffect(() => {
        if (selectedTopic) {
            fetchData(`/api/curriculum/learning-units/?topic=${selectedTopic.id}&page_size=100`, (data) => {
                setLearningUnits(data.filter(lu => lu.topic === selectedTopic.id || (lu.topic && lu.topic.id === selectedTopic.id)));
            });
        } else {
            setLearningUnits([]);
        }
    }, [selectedTopic]);

    const fetchData = async (url, setter) => {
        try {
            setLoading(true);
            const response = await apiClient.get(url);
            setter(response.data.results || response.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (type, parentId, payload) => {
        const endpointMap = {
            curriculum: '/api/curriculum/curricula/',
            grade: '/api/curriculum/grades/',
            subject: '/api/curriculum/subjects/',
            topic: '/api/curriculum/topics/',
            unit: '/api/curriculum/learning-units/'
        };
        
        try {
            setLoading(true);
            const response = await apiClient.post(endpointMap[type], payload);
            
            // Refresh the specific column
            if (type === 'curriculum') fetchData('/api/curriculum/curricula/', setCurricula);
            if (type === 'grade') fetchData(`/api/curriculum/grades/?curriculum=${selectedCurriculum.id}`, setGrades);
            if (type === 'subject') fetchData(`/api/curriculum/subjects/?grade=${selectedGrade.id}`, setSubjects);
            if (type === 'topic') fetchData(`/api/curriculum/topics/?subject=${selectedSubject.id}`, setTopics);
            if (type === 'unit') {
                fetchData(`/api/curriculum/learning-units/?topic=${selectedTopic.id}&page_size=100`, (data) => {
                    setLearningUnits(data.filter(lu => lu.topic === selectedTopic.id || (lu.topic && lu.topic.id === selectedTopic.id)));
                });
            }
            
            setNewNames(prev => ({ ...prev, [type]: '' }));
        } catch (error) {
            console.error(`Error creating ${type}:`, error);
            alert(`Failed to create ${type}. Please check the console.`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type, id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        
        const endpointMap = {
            curriculum: `/api/curriculum/curricula/${id}/`,
            grade: `/api/curriculum/grades/${id}/`,
            subject: `/api/curriculum/subjects/${id}/`,
            topic: `/api/curriculum/topics/${id}/`,
            unit: `/api/curriculum/learning-units/${id}/`
        };

        try {
            setLoading(true);
            await apiClient.delete(endpointMap[type]);
            
            // Refresh parent
            if (type === 'curriculum') {
                setSelectedCurriculum(null);
                fetchData('/api/curriculum/curricula/', setCurricula);
            }
            if (type === 'grade') {
                setSelectedGrade(null);
                fetchData(`/api/curriculum/grades/?curriculum=${selectedCurriculum.id}`, setGrades);
            }
            if (type === 'subject') {
                setSelectedSubject(null);
                fetchData(`/api/curriculum/subjects/?grade=${selectedGrade.id}`, setSubjects);
            }
            if (type === 'topic') {
                setSelectedTopic(null);
                fetchData(`/api/curriculum/topics/?subject=${selectedSubject.id}`, setTopics);
            }
            if (type === 'unit') {
                setSelectedUnit(null);
                fetchData('/api/curriculum/learning-units/', (data) => {
                    setLearningUnits(data.filter(lu => lu.topic === selectedTopic.id || (lu.topic && lu.topic.id === selectedTopic.id)));
                });
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            alert(`Failed to delete ${type}.`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedSubject) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', selectedSubject.id);
        formData.append('mode', uploadMode);

        try {
            setUploadingPack(true);
            const response = await apiClient.post('/api/curriculum/knowledge-packs/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setActivePack(response.data);
            e.target.value = null; // reset
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload textbook.");
        } finally {
            setUploadingPack(false);
        }
    };

    const handleReprocessPack = async (packId) => {
        try {
            const res = await apiClient.post(`/api/curriculum/knowledge-packs/${packId}/reprocess/`);
            setActivePack(res.data);
        } catch (err) {
            console.error("Failed to reprocess pack:", err);
            alert("Failed to reprocess textbook.");
        }
    };

    const Column = ({ title, icon: Icon, items, selectedItem, onSelect, type, parentId, placeholder }) => (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <Icon className="w-5 h-5 text-custom-orange" />
                <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
                {items.length === 0 && !loading && (
                    <div className="text-sm text-gray-400 p-4 text-center">No items found.</div>
                )}
                {items.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className={`p-3 text-sm rounded-lg cursor-pointer mb-1 flex items-center justify-between group transition-colors ${
                            selectedItem?.id === item.id 
                            ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                            : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                        }`}
                    >
                        <span className="truncate flex-1">{item.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(type, item.id, item.name); }}
                                className="p-1 hover:text-red-500 text-gray-400"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronRight className={`w-4 h-4 ${selectedItem?.id === item.id ? 'text-blue-500' : 'text-gray-300'}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                    <input 
                        type={type === 'grade' ? 'text' : 'text'}
                        placeholder={placeholder}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-custom-blue"
                        value={newNames[type]}
                        onChange={(e) => setNewNames(prev => ({...prev, [type]: e.target.value}))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newNames[type].trim() && (type === 'curriculum' || parentId)) {
                                const payload = { name: newNames[type] };
                                if (type === 'grade') {
                                    payload.curriculum = parentId;
                                    payload.level = items.length + 1; // Auto-increment level
                                }
                                if (type === 'subject') payload.grade = parentId;
                                if (type === 'topic') {
                                    payload.subject = parentId;
                                    payload.order = items.length + 1;
                                }
                                if (type === 'unit') {
                                    payload.topic = parentId;
                                    payload.order = items.length + 1;
                                }
                                handleCreate(type, parentId, payload);
                            }
                        }}
                    />
                    <button 
                        onClick={() => {
                            if (newNames[type].trim() && (type === 'curriculum' || parentId)) {
                                const payload = { name: newNames[type] };
                                if (type === 'grade') {
                                    payload.curriculum = parentId;
                                    payload.level = items.length + 1;
                                }
                                if (type === 'subject') payload.grade = parentId;
                                if (type === 'topic') {
                                    payload.subject = parentId;
                                    payload.order = items.length + 1;
                                }
                                if (type === 'unit') {
                                    payload.topic = parentId;
                                    payload.order = items.length + 1;
                                }
                                handleCreate(type, parentId, payload);
                            }
                        }}
                        disabled={!newNames[type].trim() || (type !== 'curriculum' && !parentId)}
                        className="p-1.5 bg-custom-orange text-white rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Knowledge Pack Logic at Subject level */}
                {type === 'subject' && selectedSubject && (
                    <div className="mt-2">
                        <input 
                            type="file" 
                            accept=".pdf"
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload}
                        />

                        {subjectPacks.length > 0 && (
                            <div className="mb-3 mt-4">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Recent Repository</div>
                                {subjectPacks.map(pack => (
                                    <div key={pack.id} className="text-xs text-gray-600 py-1.5 flex items-center justify-between gap-1 group">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="truncate text-gray-700 font-medium" title={pack.file ? pack.file.split('/').pop() : `Pack ${pack.id}`}>
                                                {pack.file ? pack.file.split('/').pop() : `Pack ${pack.id}`}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReprocessPack(pack.id); }}
                                            className="text-[10px] text-custom-blue hover:text-blue-800 font-medium shrink-0 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition-colors"
                                            title="Re-extract topics using updated parser"
                                        >
                                            Re-extract
                                        </button>
                                    </div>
                                ))}
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 border-b border-gray-200 pb-1 mb-2">Upload New</div>
                            </div>
                        )}
                        
                        {/* Upload mode toggle */}
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-2 text-[11px] font-semibold">
                            <button
                                onClick={() => setUploadMode('normal')}
                                className={`flex-1 py-1.5 px-2 transition-colors ${uploadMode === 'normal'
                                    ? 'bg-custom-blue text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                title="Upload PDF and set up topics manually"
                            >
                                📚 Normal
                            </button>
                            <button
                                onClick={() => setUploadMode('ai_ingestion')}
                                className={`flex-1 py-1.5 px-2 transition-colors ${uploadMode === 'ai_ingestion'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                title="AI auto-generates Topics & Units from the textbook"
                            >
                                ✨ AI Ingestion
                            </button>
                        </div>
                        {uploadMode === 'ai_ingestion' && (
                            <p className="text-[10px] text-indigo-600 bg-indigo-50 rounded px-2 py-1 mb-2 border border-indigo-100">
                                AI will automatically infer Topics & Learning Units from the uploaded textbook. You can review and edit them before approval.
                            </p>
                        )}

                        {activePack ? (
                            activePack.status === 'processing' ? (
                                <div className="w-full flex items-center justify-center gap-2 text-xs bg-blue-50 text-blue-600 py-1.5 rounded border border-blue-200">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Processing Textbook...
                                </div>
                            ) : activePack.status === 'review' ? (
                                <button 
                                    onClick={() => setActivePack({...activePack, showReview: true})}
                                    className="w-full flex items-center justify-center gap-2 text-xs bg-custom-orange text-white py-1.5 rounded hover:bg-orange-600 transition-colors"
                                >
                                    Review Extraction
                                </button>
                            ) : (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingPack}
                                    className="w-full flex items-center justify-center gap-2 text-xs bg-custom-blue text-white py-1.5 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <UploadCloud className="w-3 h-3" />
                                    {uploadingPack ? 'Uploading...' : 'Upload Textbook (PDF)'}
                                </button>
                            )
                        ) : (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPack || !selectedSubject}
                                className="w-full flex items-center justify-center gap-2 text-xs bg-custom-blue text-white py-1.5 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <UploadCloud className="w-3 h-3" />
                                {uploadingPack ? 'Uploading...' : 'Upload New Textbook'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-white">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Curriculum Builder</h1>
                <p className="text-gray-500 mt-1">Design your curriculum hierarchy and transition seamlessly into the Content Studio.</p>
            </div>
            
            <div className="flex-1 flex overflow-x-auto bg-gray-100">
                {Column({ 
                    title: "Curricula",
                    icon: FolderTree,
                    items: curricula,
                    selectedItem: selectedCurriculum,
                    onSelect: (item) => {
                        setSelectedCurriculum(item);
                        setSelectedGrade(null);
                        setSelectedSubject(null);
                        setSelectedTopic(null);
                        setSelectedUnit(null);
                    },
                    type: "curriculum",
                    placeholder: "New Curriculum..."
                })}
                
                {selectedCurriculum && (
                    Column({ 
                        title: "Grades / Forms",
                        icon: Layers,
                        items: grades,
                        selectedItem: selectedGrade,
                        onSelect: (item) => {
                            setSelectedGrade(item);
                            setSelectedSubject(null);
                            setSelectedTopic(null);
                            setSelectedUnit(null);
                        },
                        type: "grade",
                        parentId: selectedCurriculum.id,
                        placeholder: "New Grade (e.g. Year 10)"
                    })
                )}
                
                {selectedGrade && (
                    Column({ 
                        title: "Subjects",
                        icon: BookOpen,
                        items: subjects,
                        selectedItem: selectedSubject,
                        onSelect: (item) => {
                            setSelectedSubject(item);
                            setSelectedTopic(null);
                            setSelectedUnit(null);
                        },
                        type: "subject",
                        parentId: selectedGrade.id,
                        placeholder: "New Subject..."
                    })
                )}

                {selectedSubject && (
                    Column({ 
                        title: "Topics",
                        icon: Target,
                        items: topics,
                        selectedItem: selectedTopic,
                        onSelect: (item) => {
                            setSelectedTopic(item);
                            setSelectedUnit(null);
                        },
                        type: "topic",
                        parentId: selectedSubject.id,
                        placeholder: "New Topic..."
                    })
                )}

                {selectedTopic && (
                    Column({ 
                        title: "Learning Units",
                        icon: Library,
                        items: learningUnits,
                        selectedItem: selectedUnit,
                        onSelect: setSelectedUnit,
                        type: "unit",
                        parentId: selectedTopic.id,
                        placeholder: "New Learning Unit..."
                    })
                )}
                
                {selectedUnit && (
                    <div className="flex flex-col w-80 bg-white border-l border-gray-200 h-full overflow-hidden shrink-0 shadow-lg z-10">
                        <div className="p-4 border-b border-gray-200 bg-blue-50">
                            <h3 className="font-bold text-blue-900 flex items-center gap-2"><Library className="w-4 h-4" /> Repository Explorer</h3>
                            <p className="text-xs text-blue-700 mt-1">Coverage for: {selectedUnit.name}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingStats ? (
                                <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                    Loading repository stats...
                                </div>
                            ) : repoStats ? (
                                <>
                                    <div className="bg-gray-50 rounded p-3 text-sm border border-gray-200">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-500">Repository Version</span>
                                            <span className="font-mono text-xs bg-gray-200 px-1 rounded">{repoStats.repository_version}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-500">Total Assets</span>
                                            <span className="font-semibold">{repoStats.total_chunks}</span>
                                        </div>
                                        {repoStats.avg_ocr_confidence != null && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">OCR Confidence</span>
                                                <span className="text-green-600">{(repoStats.avg_ocr_confidence * 100).toFixed(1)}%</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {repoStats.has_warnings && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm flex gap-2 items-start">
                                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            <p>No knowledge assets linked to this unit. AI generation may lack context.</p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">Extracted Assets</h4>
                                        {Object.entries(repoStats.type_counts).length === 0 ? (
                                            <p className="text-xs text-gray-500 italic">No assets available.</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {Object.entries(repoStats.type_counts).map(([ctype, count]) => (
                                                    <div key={ctype} className="flex justify-between text-sm items-center">
                                                        <span className="capitalize text-gray-600 flex items-center gap-1.5">
                                                            {ctype === 'diagram' ? <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> : <BookOpen className="w-3.5 h-3.5 text-gray-400" />}
                                                            {ctype.replace('_', ' ')}
                                                        </span>
                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {loadingLesson ? (
                                        <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2 py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-custom-blue" />
                                            Checking lesson status...
                                        </div>
                                    ) : unitLesson ? (
                                        <button 
                                            onClick={() => navigate(`/admin-dashboard/content-studio/${selectedUnit.id}`)}
                                            className="w-full mt-6 flex items-center justify-center gap-2 bg-custom-blue text-white py-2.5 rounded shadow hover:bg-blue-700 transition-all font-medium text-sm"
                                        >
                                            <PenTool className="w-4 h-4" />
                                            Open Content Studio
                                        </button>
                                    ) : (
                                        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                                            <div className="text-xs font-semibold text-gray-700 mb-2">Lesson Actions:</div>
                                            <button 
                                                onClick={() => navigate(`/admin-dashboard/content-studio/${selectedUnit.id}`)}
                                                className="w-full flex items-center justify-center gap-2 bg-custom-blue text-white py-2.5 rounded shadow hover:bg-blue-700 transition-all font-medium text-sm"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Generate with AI
                                            </button>
                                            <button 
                                                onClick={handleCreateManualInCurriculumBuilder}
                                                disabled={creatingManual}
                                                className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 py-2.5 rounded shadow-sm hover:bg-gray-50 transition-all font-medium text-sm disabled:opacity-50"
                                            >
                                                {creatingManual ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                                ) : (
                                                    <PenTool className="w-4 h-4 text-custom-orange" />
                                                )}
                                                Create Manually
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>
                    </div>
                )}
                
                {!selectedCurriculum && (
                    <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center">
                        <div>
                            <FolderTree className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Select or create a Curriculum to begin building.</p>
                        </div>
                    </div>
                )}
            </div>

            {activePack?.showReview && (
                <KnowledgePackReviewModal
                    knowledgePack={activePack}
                    onClose={() => setActivePack({...activePack, showReview: false})}
                    onApprove={() => {
                        setActivePack(null);
                        // Refresh topics
                        if (selectedSubject) {
                            fetchData(`/api/curriculum/topics/?subject=${selectedSubject.id}`, setTopics);
                        }
                    }}
                    onDelete={(deletedPackId) => {
                        setActivePack(null);
                        setSubjectPacks((prev) => prev.filter((p) => p.id !== deletedPackId));
                    }}
                />
            )}
        </div>
    );
}
