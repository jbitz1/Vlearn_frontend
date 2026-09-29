import React from 'react';
import { Search, FolderTree, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router';

export default function CurriculumGradeSelector({
    curricula = [],
    selectedCurriculum,
    onSelectCurriculum,
    grades = [],
    selectedGrade,
    onSelectGrade,
    searchQuery = '',
    onSearchChange,
    loading = false,
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-5 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                {/* Left: Curriculum switcher */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-custom-blue/10 flex items-center justify-center text-custom-blue">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Curriculum</div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            {curricula.map((curr) => {
                                const isSelected = selectedCurriculum?.id === curr.id;
                                return (
                                    <button
                                        key={curr.id}
                                        type="button"
                                        onClick={() => onSelectCurriculum(curr)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                            isSelected
                                                ? 'bg-custom-blue text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80'
                                        }`}
                                    >
                                        {curr.name}
                                    </button>
                                );
                            })}
                            {curricula.length === 0 && !loading && (
                                <span className="text-sm text-gray-500 italic">No curricula configured</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Search and Curriculum Builder deep link */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter subjects & topics..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-custom-blue/30 focus:border-custom-blue transition"
                        />
                    </div>
                    <Link
                        to="/admin-dashboard/curriculum-builder"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200/80 rounded-xl transition whitespace-nowrap"
                        title="Open Curriculum Builder to modify structure or ingest textbooks"
                    >
                        <FolderTree className="w-3.5 h-3.5 text-gray-500" />
                        <span className="hidden sm:inline">Curriculum Builder</span>
                    </Link>
                </div>
            </div>

            {/* Bottom: Grade / Form pills */}
            <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Grade / Form Level
                    </span>
                    <span className="text-xs text-gray-500">
                        {grades.length} {grades.length === 1 ? 'level' : 'levels'} available
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pb-1">
                    {grades.map((grade) => {
                        const isSelected = selectedGrade?.id === grade.id;
                        return (
                            <button
                                key={grade.id}
                                type="button"
                                onClick={() => onSelectGrade(grade)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                                    isSelected
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'bg-gray-50 text-gray-700 border border-gray-200/60 hover:bg-gray-100 hover:border-gray-300'
                                }`}
                            >
                                <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-custom-orange' : 'text-gray-400'}`} />
                                <span>{grade.name}</span>
                            </button>
                        );
                    })}
                    {grades.length === 0 && !loading && (
                        <div className="text-sm text-gray-400 italic py-1">
                            No grades available for selected curriculum.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
