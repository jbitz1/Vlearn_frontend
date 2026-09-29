import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Loader2, AlertCircle, BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import apiClient from '../../config/apiClient';

import CurriculumGradeSelector from './CourseManagement/CurriculumGradeSelector';
import SubjectProgressCard from './CourseManagement/SubjectProgressCard';
import SubjectDetail from './CourseManagement/SubjectDetail';
import LessonDisaggregationDrawer from './CourseManagement/LessonDisaggregationDrawer';

export default function CourseManagement() {
    const location = useLocation();
    const navigate = useNavigate();

    // Data state
    const [curricula, setCurricula] = useState([]);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);
    const [grades, setGrades] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjectHierarchy, setSubjectHierarchy] = useState(null);

    // Inspection Drawer state
    const [inspectLessonId, setInspectLessonId] = useState(null);

    // UI state
    const [loadingCurricula, setLoadingCurricula] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingHierarchy, setLoadingHierarchy] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Parse URL search params for deep linking from Admin Dashboard
    useEffect(() => {
        const fetchInitialHierarchy = async () => {
            setLoadingCurricula(true);
            try {
                const res = await apiClient.get('/api/curriculum/curricula/');
                const list = res.data?.results || res.data || [];
                setCurricula(list);

                const params = new URLSearchParams(location.search);
                const currParamId = params.get('curriculum');
                const initialCurr = currParamId ? list.find(c => String(c.id) === currParamId) : list[0];

                if (initialCurr) {
                    setSelectedCurriculum(initialCurr);
                }
            } catch (err) {
                console.error('Failed to load curricula:', err);
                setError('Failed to load curricula.');
            } finally {
                setLoadingCurricula(false);
            }
        };

        fetchInitialHierarchy();
    }, []);

    // When selectedCurriculum changes, fetch its grades
    useEffect(() => {
        if (!selectedCurriculum) return;

        const fetchGrades = async () => {
            try {
                const res = await apiClient.get(`/api/curriculum/grades/?curriculum=${selectedCurriculum.id}`);
                const list = res.data?.results || res.data || [];
                // Sort by level asc
                list.sort((a, b) => (a.level || 0) - (b.level || 0));
                setGrades(list);

                const params = new URLSearchParams(location.search);
                const gradeParamId = params.get('grade');
                const initialGrade = gradeParamId ? list.find(g => String(g.id) === gradeParamId) : list[0];

                setSelectedGrade(initialGrade || null);
            } catch (err) {
                console.error('Failed to load grades:', err);
            }
        };

        fetchGrades();
    }, [selectedCurriculum]);

    const fetchGradeSummary = async (gradeId) => {
        const targetId = gradeId || selectedGrade?.id;
        if (!targetId) return;
        setLoadingSubjects(true);
        setError(null);
        try {
            const res = await apiClient.get(`/api/curriculum/course-management/grade-summary/?grade=${targetId}`);
            const subjList = res.data?.subjects || [];
            setSubjects(subjList);
            return subjList;
        } catch (err) {
            console.error('Failed to load grade summary:', err);
            setError('Failed to load course progress summary for this grade level.');
        } finally {
            setLoadingSubjects(false);
        }
    };

    // When selectedGrade changes, fetch subject progress summary
    useEffect(() => {
        if (!selectedGrade) {
            setSubjects([]);
            setSelectedSubject(null);
            return;
        }

        const run = async () => {
            const subjList = await fetchGradeSummary(selectedGrade.id);
            if (subjList) {
                // Check if URL specifies a subject deep link
                const params = new URLSearchParams(location.search);
                const subjParamId = params.get('subject');
                if (subjParamId) {
                    const match = subjList.find(s => String(s.id) === subjParamId);
                    if (match) setSelectedSubject(match);
                } else {
                    setSelectedSubject(null);
                }
            }
        };

        run();
    }, [selectedGrade]);

    // When a subject is opened, fetch its topic -> learning unit hierarchy
    useEffect(() => {
        if (!selectedSubject) {
            setSubjectHierarchy(null);
            return;
        }

        const fetchHierarchy = async () => {
            setLoadingHierarchy(true);
            try {
                const res = await apiClient.get(`/api/curriculum/course-management/subject-hierarchy/?subject=${selectedSubject.id}`);
                setSubjectHierarchy(res.data);
            } catch (err) {
                console.error('Failed to load subject hierarchy:', err);
            } finally {
                setLoadingHierarchy(false);
            }
        };

        fetchHierarchy();
    }, [selectedSubject]);

    // Refresh hierarchy data after lesson generation or status updates
    const refreshHierarchy = async () => {
        if (!selectedSubject) return;
        try {
            const res = await apiClient.get(`/api/curriculum/course-management/subject-hierarchy/?subject=${selectedSubject.id}`);
            setSubjectHierarchy(res.data);
        } catch (err) {
            console.error('Failed to refresh hierarchy:', err);
        }
    };

    const handleSelectSubject = (subj) => {
        setSelectedSubject(subj);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToOverview = () => {
        setSelectedSubject(null);
        setSubjectHierarchy(null);
        if (selectedGrade) {
            fetchGradeSummary(selectedGrade.id);
        }
    };

    // Filter subjects by search query
    const filteredSubjects = subjects.filter(s => {
        if (!searchQuery) return true;
        return s.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Course Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track curriculum hierarchy progression, monitor generated and published units, and inspect lesson components.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedSubject && (
                        <button
                            type="button"
                            onClick={refreshHierarchy}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                            <span>Refresh</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Curriculum & Grade Selector Bar (Sticky Top) */}
            <CurriculumGradeSelector
                curricula={curricula}
                selectedCurriculum={selectedCurriculum}
                onSelectCurriculum={(c) => {
                    setSelectedCurriculum(c);
                    setSelectedSubject(null);
                }}
                grades={grades}
                selectedGrade={selectedGrade}
                onSelectGrade={(g) => {
                    setSelectedGrade(g);
                    setSelectedSubject(null);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                loading={loadingCurricula}
            />

            {/* Main Content Area: Subject Detail OR Subject Cards Grid */}
            {selectedSubject ? (
                <SubjectDetail
                    subject={selectedSubject}
                    hierarchy={subjectHierarchy}
                    loading={loadingHierarchy}
                    onBack={handleBackToOverview}
                    onInspectLesson={(lessonId) => setInspectLessonId(lessonId)}
                    onRefresh={refreshHierarchy}
                    searchQuery={searchQuery}
                />
            ) : (
                <div>
                    {/* Grid Title & Overall Grade KPIs */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">
                                {selectedGrade ? `${selectedGrade.name} Subjects` : 'Subjects'}
                            </h2>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {filteredSubjects.length} {filteredSubjects.length === 1 ? 'Course' : 'Courses'}
                            </span>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loadingSubjects && (
                        <div className="py-20 text-center bg-white rounded-2xl border border-gray-200">
                            <Loader2 className="w-8 h-8 text-custom-blue animate-spin mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-600">Calculating course progression metrics...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loadingSubjects && filteredSubjects.length === 0 && (
                        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                {searchQuery ? 'No matching subjects found' : 'No subjects available'}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                                {searchQuery
                                    ? `No subjects match the filter "${searchQuery}". Clear your search to view all.`
                                    : 'There are no subjects configured for this grade level.'}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
                                >
                                    Clear Search Filter
                                </button>
                            )}
                        </div>
                    )}

                    {/* Subjects Grid */}
                    {!loadingSubjects && filteredSubjects.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredSubjects.map((subject) => (
                                <SubjectProgressCard
                                    key={subject.id}
                                    subject={subject}
                                    onOpen={handleSelectSubject}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Slide-Over Lesson Disaggregation Drawer */}
            <LessonDisaggregationDrawer
                lessonId={inspectLessonId}
                isOpen={Boolean(inspectLessonId)}
                onClose={() => setInspectLessonId(null)}
            />
        </div>
    );
}