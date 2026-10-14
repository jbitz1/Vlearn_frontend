import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
    CheckSquare, Sparkles, Plus, Search, Filter, Layers, ExternalLink,
    Trash2, Loader2, BookOpen, GraduationCap, AlertCircle, CheckCircle,
    X, RefreshCw, Eye, ArrowRight, HelpCircle, ChevronDown, Check,
    Globe, CheckCircle2
} from 'lucide-react';
import apiClient from '../../config/apiClient';
import Swal from 'sweetalert2';

// ── Custom Searchable DOM Dropdown ──────────────────────────────────────────
// Immune to Linux Chrome / Wayland / X11 native OS select window flashing/closing bugs
function SearchableSelect({
    label,
    value,
    options = [],
    placeholder = 'Select...',
    disabled = false,
    onChange,
    icon: Icon = null,
    searchable = true,
    allLabel = null,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    // Outside click listener
    useEffect(() => {
        if (!isOpen) return;
        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

    // Keyboard support: Escape closes
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const selectedOption = options.find(o => {
        const oId = o.id !== undefined ? o.id : o.value !== undefined ? o.value : o;
        return String(oId) === String(value);
    });

    const displayText = selectedOption
        ? (selectedOption.name || selectedOption.label || selectedOption.title || String(selectedOption))
        : (allLabel || placeholder);

    const filteredOptions = options.filter(o => {
        const name = o.name || o.label || o.title || String(o);
        return name.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    {label}
                </label>
            )}
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(prev => !prev);
                        setSearch('');
                    }
                }}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-left transition-all ${
                    disabled
                        ? 'bg-gray-100/70 border-gray-200 text-gray-400 cursor-not-allowed'
                        : isOpen
                        ? 'bg-white border-custom-blue ring-2 ring-blue-100 text-gray-900 shadow-xs'
                        : 'bg-gray-50 hover:bg-white border-gray-200 text-gray-800 cursor-pointer shadow-2xs'
                }`}
            >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    <span className="truncate">
                        {displayText}
                    </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-custom-blue' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[180px]">
                    {searchable && options.length > 5 && (
                        <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Filter options..."
                                    autoFocus
                                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-custom-blue"
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                        {allLabel && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                    !value || value === 'all'
                                        ? 'bg-blue-50 text-custom-blue font-bold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span className="truncate">{allLabel}</span>
                                {(!value || value === 'all') && <Check className="w-3.5 h-3.5 text-custom-blue shrink-0" />}
                            </button>
                        )}

                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-xs text-gray-400 italic">
                                No matching options
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const optId = opt.id !== undefined ? opt.id : opt.value !== undefined ? opt.value : opt;
                                const optName = opt.name || opt.label || opt.title || String(opt);
                                const isSelected = String(optId) === String(value);

                                return (
                                    <button
                                        key={opt.id || opt.value || idx}
                                        type="button"
                                        onClick={() => {
                                            onChange(String(optId));
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                            isSelected
                                                ? 'bg-blue-50 text-custom-blue font-bold'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="truncate">{optName}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-custom-blue shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RevisionQuizManager() {
    const navigate = useNavigate();

    // Cascading selection state
    const [curricula, setCurricula] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);

    const [selectedCurriculumId, setSelectedCurriculumId] = useState('');
    const [selectedGradeId, setSelectedGradeId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Data list & loading
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Generation modal state
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateForm, setGenerateForm] = useState({
        topic_id: '',
        difficulty: 'intermediate',
        num_questions: 5,
        quiz_type: 'full_paper',
        assessment_framework: 'auto',
        quiz_mode: 'full_paper',
        include_diagrams: true,
        custom_prompt: ''
    });

    // Manual creation modal state
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isCreatingManual, setIsCreatingManual] = useState(false);
    const [manualForm, setManualForm] = useState({
        topic_id: '',
        title: '',
        difficulty: 'intermediate'
    });

    // ── Fetch Initial Curricula ──────────────────────────────────────────────
    useEffect(() => {
        apiClient.get('/api/curriculum/curricula/')
            .then(res => {
                const list = res.data.results || res.data || [];
                setCurricula(list);
                if (list.length > 0 && !selectedCurriculumId) {
                    setSelectedCurriculumId(String(list[0].id));
                }
            })
            .catch(err => console.error('Failed to load curricula:', err));
    }, []);

    // ── Cascading: Fetch Grades ─────────────────────────────────────────────
    useEffect(() => {
        if (selectedCurriculumId) {
            apiClient.get(`/api/curriculum/grades/?curriculum=${selectedCurriculumId}`)
                .then(res => setGrades(res.data.results || res.data || []))
                .catch(err => console.error('Failed to load grades:', err));
        } else {
            setGrades([]);
            setSelectedGradeId('');
        }
    }, [selectedCurriculumId]);

    // ── Cascading: Fetch Subjects ───────────────────────────────────────────
    useEffect(() => {
        if (selectedGradeId) {
            apiClient.get(`/api/curriculum/subjects/?grade=${selectedGradeId}`)
                .then(res => setSubjects(res.data.results || res.data || []))
                .catch(err => console.error('Failed to load subjects:', err));
        } else {
            setSubjects([]);
            setSelectedSubjectId('');
        }
    }, [selectedGradeId]);

    // ── Cascading: Fetch Topics ─────────────────────────────────────────────
    useEffect(() => {
        if (selectedSubjectId) {
            apiClient.get(`/api/curriculum/topics/?subject=${selectedSubjectId}`)
                .then(res => setTopics(res.data.results || res.data || []))
                .catch(err => console.error('Failed to load topics:', err));
        } else {
            setTopics([]);
            setSelectedTopicId('');
        }
    }, [selectedSubjectId]);

    // ── Fetch Quizzes ────────────────────────────────────────────────────────
    const fetchQuizzes = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCurriculumId) params.append('curriculum', selectedCurriculumId);
            if (selectedGradeId) params.append('grade', selectedGradeId);
            if (selectedSubjectId) params.append('subject', selectedSubjectId);
            if (selectedTopicId) params.append('topic', selectedTopicId);
            if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const res = await apiClient.get(`/api/curriculum/revision-quizzes/?${params.toString()}`);
            setQuizzes(res.data.results || res.data || []);
        } catch (err) {
            console.error('Failed to fetch revision quizzes:', err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCurriculumId, selectedGradeId, selectedSubjectId, selectedTopicId, difficultyFilter, statusFilter]);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    // ── Handle AI Generation ────────────────────────────────────────────────
    const handleOpenGenerateModal = () => {
        setGenerateForm(prev => ({
            ...prev,
            topic_id: selectedTopicId || (topics.length > 0 ? String(topics[0].id) : '')
        }));
        setIsGenerateModalOpen(true);
    };

    const handleGenerateSubmit = async (e) => {
        e.preventDefault();
        if (!generateForm.topic_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Topic Required',
                text: 'Please select a topic to ground the revision quiz.'
            });
            return;
        }

        setIsGenerating(true);
        try {
            const res = await apiClient.post('/api/curriculum/revision-quizzes/generate/', {
                topic_id: parseInt(generateForm.topic_id, 10),
                difficulty: generateForm.difficulty,
                num_questions: parseInt(generateForm.num_questions, 10),
                quiz_type: generateForm.quiz_type,
                assessment_framework: generateForm.assessment_framework,
                quiz_mode: generateForm.quiz_mode,
                include_diagrams: generateForm.include_diagrams,
                custom_prompt: generateForm.custom_prompt
            });

            const generatedQuiz = res.data;
            setIsGenerateModalOpen(false);
            fetchQuizzes();

            Swal.fire({
                icon: 'success',
                title: 'Quiz Generated!',
                text: `Successfully created "${generatedQuiz.title}".`,
                showCancelButton: true,
                confirmButtonColor: '#02a0bf',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Open in Content Studio',
                cancelButtonText: 'Stay on Quizzes List'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(`/admin-dashboard/content-studio?lessonId=${generatedQuiz.id}`);
                }
            });
        } catch (err) {
            console.error('Quiz generation error:', err);
            const msg = err.response?.data?.error || err.message || 'Generation failed.';
            Swal.fire({
                icon: 'error',
                title: 'Generation Failed',
                text: msg
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Handle Manual Creation ──────────────────────────────────────────────
    const handleOpenManualModal = () => {
        setManualForm({
            topic_id: selectedTopicId || (topics.length > 0 ? String(topics[0].id) : ''),
            title: '',
            difficulty: 'intermediate'
        });
        setIsManualModalOpen(true);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualForm.topic_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Topic Required',
                text: 'Please select a topic for the revision quiz.'
            });
            return;
        }

        setIsCreatingManual(true);
        try {
            const res = await apiClient.post('/api/curriculum/revision-quizzes/create_manual/', {
                topic_id: parseInt(manualForm.topic_id, 10),
                title: manualForm.title.trim() || undefined,
                difficulty: manualForm.difficulty
            });

            const newQuiz = res.data;
            setIsManualModalOpen(false);
            fetchQuizzes();
            navigate(`/admin-dashboard/content-studio?lessonId=${newQuiz.id}`);
        } catch (err) {
            console.error('Manual quiz creation error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: err.response?.data?.error || 'Failed to create quiz draft.'
            });
        } finally {
            setIsCreatingManual(false);
        }
    };

    // ── Handle Delete Quiz ──────────────────────────────────────────────────
    const handleDeleteQuiz = (quiz) => {
        Swal.fire({
            title: 'Delete Revision Quiz?',
            text: `Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete Quiz'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await apiClient.delete(`/api/curriculum/revision-quizzes/${quiz.id}/`);
                    setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted',
                        text: 'Revision quiz has been deleted.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (err) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Delete Failed',
                        text: err.response?.data?.detail || 'Could not delete quiz.'
                    });
                }
            }
        });
    };

    // ── Handle Publish / Unpublish Quiz ─────────────────────────────────────
    const handleTogglePublish = async (quiz, shouldPublish) => {
        try {
            const endpoint = shouldPublish ? 'publish' : 'unpublish';
            const res = await apiClient.post(`/api/curriculum/revision-quizzes/${quiz.id}/${endpoint}/`);
            setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, status: res.data.status } : q));
            Swal.fire({
                icon: 'success',
                title: shouldPublish ? 'Published!' : 'Unpublished',
                text: shouldPublish ? 'Quiz is now accessible to students.' : 'Quiz reverted to draft.',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Action Failed',
                text: err.response?.data?.error || err.response?.data?.detail || 'Failed to update quiz status.'
            });
        }
    };

    // ── Filtered Quizzes Search ─────────────────────────────────────────────
    const filteredQuizzes = quizzes.filter(q => {
        if (!searchQuery) return true;
        const qTitle = (q.title || '').toLowerCase();
        const qTopic = (q.topic_name || '').toLowerCase();
        const qSubj = (q.subject_name || '').toLowerCase();
        const term = searchQuery.toLowerCase();
        return qTitle.includes(term) || qTopic.includes(term) || qSubj.includes(term);
    });

    const getDifficultyBadge = (difficulty) => {
        const diff = (difficulty || 'intermediate').toLowerCase();
        if (diff === 'beginner') {
            return (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Beginner
                </span>
            );
        }
        if (diff === 'advanced') {
            return (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Advanced
                </span>
            );
        }
        return (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-custom-blue border border-blue-200">
                Intermediate
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const s = (status || 'draft').toLowerCase();
        if (s === 'published') {
            return (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-800">
                    Published
                </span>
            );
        }
        if (s === 'review') {
            return (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                    Review
                </span>
            );
        }
        return (
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                Draft
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-8 space-y-6">
            {/* ── Top Header ──────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-custom-blue">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                Revision Quizzes
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                Grounded assessments generated from topic curriculum knowledge and misconceptions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenManualModal}
                        className="px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4 text-gray-500" /> Create Blank
                    </button>
                    <button
                        onClick={handleOpenGenerateModal}
                        className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-custom-blue hover:bg-blue-600 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
                    >
                        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" /> Generate with AI
                    </button>
                </div>
            </div>

            {/* ── Filters & Selectors Bar ─────────────────────────────────── */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    {/* Curriculum Selector */}
                    <SearchableSelect
                        label="Curriculum"
                        icon={Layers}
                        value={selectedCurriculumId}
                        options={curricula}
                        placeholder="All Curricula"
                        allLabel="All Curricula"
                        searchable={false}
                        onChange={(val) => {
                            setSelectedCurriculumId(val);
                            setSelectedGradeId('');
                            setSelectedSubjectId('');
                            setSelectedTopicId('');
                        }}
                    />

                    {/* Grade Selector */}
                    <SearchableSelect
                        label="Grade / Level"
                        icon={GraduationCap}
                        value={selectedGradeId}
                        options={grades}
                        disabled={!selectedCurriculumId}
                        placeholder={!selectedCurriculumId ? "Select curriculum first" : "All Grades"}
                        allLabel="All Grades"
                        searchable={grades.length > 5}
                        onChange={(val) => {
                            setSelectedGradeId(val);
                            setSelectedSubjectId('');
                            setSelectedTopicId('');
                        }}
                    />

                    {/* Subject Selector */}
                    <SearchableSelect
                        label="Subject"
                        icon={BookOpen}
                        value={selectedSubjectId}
                        options={subjects}
                        disabled={!selectedGradeId}
                        placeholder={!selectedGradeId ? "Select grade first" : "All Subjects"}
                        allLabel="All Subjects"
                        searchable={subjects.length > 5}
                        onChange={(val) => {
                            setSelectedSubjectId(val);
                            setSelectedTopicId('');
                        }}
                    />

                    {/* Topic Selector */}
                    <SearchableSelect
                        label="Topic"
                        icon={CheckSquare}
                        value={selectedTopicId}
                        options={topics}
                        disabled={!selectedSubjectId}
                        placeholder={!selectedSubjectId ? "Select subject first" : "All Topics"}
                        allLabel="All Topics"
                        searchable={true}
                        onChange={(val) => setSelectedTopicId(val)}
                    />
                </div>

                {/* Sub Filters & Search */}
                <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative w-full">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search quizzes by title or topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-custom-blue transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-visible">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-500">Difficulty:</span>
                            <SearchableSelect
                                value={difficultyFilter}
                                options={[
                                    { id: 'all', name: 'All Difficulties' },
                                    { id: 'beginner', name: 'Beginner' },
                                    { id: 'intermediate', name: 'Intermediate' },
                                    { id: 'advanced', name: 'Advanced' },
                                ]}
                                placeholder="All Difficulties"
                                searchable={false}
                                onChange={(val) => setDifficultyFilter(val || 'all')}
                                className="w-36"
                            />
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-500">Status:</span>
                            <SearchableSelect
                                value={statusFilter}
                                options={[
                                    { id: 'all', name: 'All Statuses' },
                                    { id: 'published', name: 'Published' },
                                    { id: 'draft', name: 'Draft' },
                                    { id: 'review', name: 'Review' },
                                ]}
                                placeholder="All Statuses"
                                searchable={false}
                                onChange={(val) => setStatusFilter(val || 'all')}
                                className="w-32"
                            />
                        </div>

                        <button
                            onClick={fetchQuizzes}
                            title="Refresh Quizzes"
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Quizzes Grid / List ─────────────────────────────────────── */}
            {isLoading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
                    <Loader2 className="w-8 h-8 text-custom-blue animate-spin mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-600">Loading revision quizzes...</p>
                </div>
            ) : filteredQuizzes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-custom-blue flex items-center justify-center mx-auto">
                        <CheckSquare className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800">No Revision Quizzes Found</h3>
                        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mt-1">
                            {selectedTopicId || selectedSubjectId
                                ? 'No quizzes have been created or generated for the selected topic yet.'
                                : 'Select a topic and generate or create revision assessments for students.'}
                        </p>
                    </div>
                    <div className="pt-2">
                        <button
                            onClick={handleOpenGenerateModal}
                            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-custom-blue hover:bg-blue-600 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                            Generate with AI
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredQuizzes.map((quiz) => {
                        const questionCount = quiz.question_count || (quiz.blocks ? quiz.blocks.filter(b => b.block_type === 'knowledge_check').length : 0);
                        const difficulty = quiz.difficulty || quiz.immutable_metadata?.difficulty || 'intermediate';
                        const framework = quiz.immutable_metadata?.assessment_framework || 'kcse';
                        const isFullPaper = (quiz.immutable_metadata?.quiz_mode === 'full_paper');

                        return (
                            <div
                                key={quiz.id}
                                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    {/* Top tags row */}
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {getDifficultyBadge(difficulty)}
                                            {getStatusBadge(quiz.status)}
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                                framework.toLowerCase() === 'cbc'
                                                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                            }`}>
                                                {framework.toUpperCase()}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                                isFullPaper
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {isFullPaper ? 'Full Paper' : 'Practice'}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                                            {questionCount} Qs
                                        </span>
                                    </div>

                                    {/* Title & Topic */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                                            {quiz.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5 font-medium truncate">
                                            <BookOpen className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                            <span className="truncate">
                                                {quiz.topic_name || `Topic ${quiz.topic}`}
                                            </span>
                                            {quiz.subject_name && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-gray-400 truncate">{quiz.subject_name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom action bar */}
                                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => navigate(`/student/lesson-viewer/?lessonId=${quiz.id}&preview=true`)}
                                            title="Preview Student Experience"
                                            className="p-2 text-gray-500 hover:text-custom-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {quiz.status === 'published' ? (
                                            <button
                                                onClick={() => handleTogglePublish(quiz, false)}
                                                title="Unpublish Quiz (Revert to Draft)"
                                                className="p-2 text-emerald-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleTogglePublish(quiz, true)}
                                                title="Publish Quiz to Students"
                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Globe className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteQuiz(quiz)}
                                            title="Delete Quiz"
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/admin-dashboard/content-studio?lessonId=${quiz.id}`)}
                                        className="px-3.5 py-1.5 text-xs font-bold text-custom-blue bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>Content Studio</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modal: AI Quiz Generator ─────────────────────────────────── */}
            {isGenerateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 animate-in fade-in zoom-in-95 duration-150 relative">
                        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-custom-blue" />
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                                    Generate Revision Quiz with AI
                                </h2>
                            </div>
                            <button
                                onClick={() => !isGenerating && setIsGenerateModalOpen(false)}
                                disabled={isGenerating}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGenerateSubmit} className="p-6 space-y-4">
                            {/* If no topics are loaded, allow user to pick Grade and Subject first */}
                            {topics.length === 0 && (
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                        Select Grade & Subject to load curriculum topics:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <SearchableSelect
                                            value={selectedGradeId}
                                            options={grades}
                                            placeholder="Select Grade..."
                                            disabled={isGenerating}
                                            searchable={grades.length > 5}
                                            onChange={(val) => {
                                                setSelectedGradeId(val);
                                                setSelectedSubjectId('');
                                                setSelectedTopicId('');
                                            }}
                                        />
                                        <SearchableSelect
                                            value={selectedSubjectId}
                                            options={subjects}
                                            placeholder="Select Subject..."
                                            disabled={isGenerating || !selectedGradeId}
                                            searchable={subjects.length > 5}
                                            onChange={(val) => {
                                                setSelectedSubjectId(val);
                                                setSelectedTopicId('');
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Topic select */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Topic Grounding <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    value={generateForm.topic_id}
                                    options={topics}
                                    placeholder={topics.length === 0 ? "Select grade & subject above first..." : "Select a topic..."}
                                    disabled={isGenerating || topics.length === 0}
                                    searchable={true}
                                    onChange={(val) => setGenerateForm(prev => ({ ...prev, topic_id: val }))}
                                />
                                <p className="text-[11px] text-gray-500 mt-1">
                                    OpenAI will extract database knowledge chunks and misconceptions for this topic.
                                </p>
                            </div>

                            {/* Curriculum Framework & Quiz Mode */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Assessment Framework
                                    </label>
                                    <SearchableSelect
                                        value={generateForm.assessment_framework}
                                        options={[
                                            { id: 'auto', name: 'Auto-Detect (CBC / KCSE)' },
                                            { id: 'kcse', name: 'KCSE / 8-4-4 National Exam' },
                                            { id: 'cbc', name: 'CBC Framework (KJSEA / Senior Sec)' },
                                        ]}
                                        disabled={isGenerating}
                                        searchable={false}
                                        onChange={(val) => setGenerateForm(prev => ({ ...prev, assessment_framework: val }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Assessment Mode
                                    </label>
                                    <SearchableSelect
                                        value={generateForm.quiz_mode}
                                        options={[
                                            { id: 'full_paper', name: 'Full Exam Paper (Delayed Marking)' },
                                            { id: 'practice', name: 'Practice Mode (Instant Feedback)' },
                                        ]}
                                        disabled={isGenerating}
                                        searchable={false}
                                        onChange={(val) => setGenerateForm(prev => ({ ...prev, quiz_mode: val }))}
                                    />
                                </div>
                            </div>

                            {/* Difficulty & Question count */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Difficulty Level
                                    </label>
                                    <SearchableSelect
                                        value={generateForm.difficulty}
                                        options={[
                                            { id: 'beginner', name: 'Beginner (Foundations)' },
                                            { id: 'intermediate', name: 'Intermediate (Standard)' },
                                            { id: 'advanced', name: 'Advanced (Deep Analysis)' },
                                        ]}
                                        disabled={isGenerating}
                                        searchable={false}
                                        onChange={(val) => setGenerateForm(prev => ({ ...prev, difficulty: val }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Number of Questions
                                    </label>
                                    <SearchableSelect
                                        value={String(generateForm.num_questions)}
                                        options={[
                                            { id: '3', name: '3 Questions (Quick Check)' },
                                            { id: '5', name: '5 Questions (Recommended)' },
                                            { id: '10', name: '10 Questions (Comprehensive)' },
                                            { id: '15', name: '15 Questions (Full Paper)' },
                                        ]}
                                        disabled={isGenerating}
                                        searchable={false}
                                        onChange={(val) => setGenerateForm(prev => ({ ...prev, num_questions: Number(val) }))}
                                    />
                                </div>
                            </div>

                            {/* Question Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Question Format
                                </label>
                                <SearchableSelect
                                    value={generateForm.quiz_type}
                                    options={[
                                        { id: 'full_paper', name: 'Full Exam Paper (Theory, MCQs & Diagrams)' },
                                        { id: 'kcse_structured', name: 'KCSE Theory & Structured (KNEC Scheme)' },
                                        { id: 'cbc_scenario_structured', name: 'CBC Situational Scenario & Inquiry' },
                                        { id: 'mixed', name: 'Mixed (MCQ + True/False + Structured)' },
                                        { id: 'multiple_choice', name: 'Multiple Choice (4 Options)' },
                                        { id: 'true_false', name: 'True / False' },
                                        { id: 'short_answer', name: 'Short Answer / Conceptual' },
                                    ]}
                                    disabled={isGenerating}
                                    searchable={false}
                                    onChange={(val) => setGenerateForm(prev => ({ ...prev, quiz_type: val }))}
                                />
                            </div>

                            {/* Include Diagrams Checkbox */}
                            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(generateForm.include_diagrams)}
                                        onChange={(e) => setGenerateForm(prev => ({ ...prev, include_diagrams: e.target.checked }))}
                                        disabled={isGenerating}
                                        className="mt-0.5 rounded text-custom-blue focus:ring-custom-blue w-4 h-4"
                                    />
                                    <div className="text-xs">
                                        <span className="font-bold text-gray-800">Include Diagram Stimuli & Linked Questions</span>
                                        <p className="text-gray-500 text-[11px] mt-0.5">
                                            Generates vector illustrations (experimental apparatus, electrical circuits, ray diagrams, or data charts) for linked questions.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Custom Prompt */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Custom Guidance / Focus Prompt <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={generateForm.custom_prompt}
                                    onChange={(e) => setGenerateForm({ ...generateForm, custom_prompt: e.target.value })}
                                    disabled={isGenerating}
                                    placeholder="e.g. Focus on common pitfalls in calculation formulas, emphasize diagrams and real-world CBC scenarios..."
                                    className="w-full text-xs font-medium px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-custom-blue"
                                />
                            </div>

                            {/* Submit & Status */}
                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsGenerateModalOpen(false)}
                                    disabled={isGenerating}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isGenerating || !generateForm.topic_id}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-custom-blue hover:bg-blue-600 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Grounding & Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                                            <span>Generate Quiz</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal: Manual Blank Quiz ─────────────────────────────────── */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 relative">
                        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
                            <h2 className="text-base font-bold text-gray-900">
                                Create Blank Revision Quiz
                            </h2>
                            <button
                                onClick={() => setIsManualModalOpen(false)}
                                disabled={isCreatingManual}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                            {/* If no topics are loaded, allow user to pick Grade and Subject first */}
                            {topics.length === 0 && (
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                        Select Grade & Subject to load topics:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <SearchableSelect
                                            value={selectedGradeId}
                                            options={grades}
                                            placeholder="Select Grade..."
                                            disabled={isCreatingManual}
                                            searchable={grades.length > 5}
                                            onChange={(val) => {
                                                setSelectedGradeId(val);
                                                setSelectedSubjectId('');
                                                setSelectedTopicId('');
                                            }}
                                        />
                                        <SearchableSelect
                                            value={selectedSubjectId}
                                            options={subjects}
                                            placeholder="Select Subject..."
                                            disabled={isCreatingManual || !selectedGradeId}
                                            searchable={subjects.length > 5}
                                            onChange={(val) => {
                                                setSelectedSubjectId(val);
                                                setSelectedTopicId('');
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Topic <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    value={manualForm.topic_id}
                                    options={topics}
                                    placeholder={topics.length === 0 ? "Select grade & subject above first..." : "Select a topic..."}
                                    disabled={isCreatingManual || topics.length === 0}
                                    searchable={true}
                                    onChange={(val) => setManualForm(prev => ({ ...prev, topic_id: val }))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Quiz Title <span className="text-gray-400 font-normal">(Leave blank for default)</span>
                                </label>
                                <input
                                    type="text"
                                    value={manualForm.title}
                                    onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                                    placeholder="e.g. Ecology Final Revision Practice"
                                    className="w-full text-xs font-medium px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-custom-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Difficulty Level
                                </label>
                                <SearchableSelect
                                    value={manualForm.difficulty}
                                    options={[
                                        { id: 'beginner', name: 'Beginner' },
                                        { id: 'intermediate', name: 'Intermediate' },
                                        { id: 'advanced', name: 'Advanced' },
                                    ]}
                                    disabled={isCreatingManual}
                                    searchable={false}
                                    onChange={(val) => setManualForm(prev => ({ ...prev, difficulty: val }))}
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingManual || !manualForm.topic_id}
                                    className="px-5 py-2 text-xs font-bold text-white bg-custom-blue hover:bg-blue-600 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {isCreatingManual ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <span>Create & Open Studio</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
