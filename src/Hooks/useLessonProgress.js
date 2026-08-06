import { useState, useEffect } from 'react';

export function useLessonProgress(lessonId, totalPages, isPreview = false, userId = 'anonymous') {
    const storageKey = `vlearn_lesson_progress_${userId}_${lessonId}${isPreview ? '_preview' : ''}`;

    const [state, setState] = useState(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse lesson progress", e);
            }
        }
        return {
            visitedConcepts: [0],
            completedConcepts: [],
            isCompleted: false,
            savedConceptIndex: 0,
            lessonTitle: '',
            topicId: null,
            lastAccessed: Date.now(),
            totalPages: totalPages || 0
        };
    });

    useEffect(() => {
        if (lessonId) {
            localStorage.setItem(storageKey, JSON.stringify(state));
        }
    }, [state, storageKey, lessonId]);

    const markConceptCompleted = (index) => {
        setState(prev => {
            const completed = new Set(prev.completedConcepts);
            completed.add(index);
            return { ...prev, completedConcepts: Array.from(completed) };
        });
    };

    const saveCurrentConcept = (index) => {
        setState(prev => {
            const visited = new Set(prev.visitedConcepts);
            visited.add(index);
            return {
                ...prev,
                savedConceptIndex: index,
                visitedConcepts: Array.from(visited)
            };
        });
    };

    const completeLesson = () => {
        setState(prev => ({ ...prev, isCompleted: true, lastAccessed: Date.now() }));
    };

    const updateMetadata = (title, topicId, tPages) => {
        setState(prev => {
            if (prev.lessonTitle === title && prev.topicId === topicId && prev.totalPages === tPages) return prev;
            return { ...prev, lessonTitle: title, topicId: topicId, totalPages: tPages, lastAccessed: Date.now() };
        });
    };

    const resetProgress = () => {
        setState({
            visitedConcepts: [0],
            completedConcepts: [],
            isCompleted: false,
            savedConceptIndex: 0
        });
    };

    return {
        ...state,
        markConceptCompleted,
        saveCurrentConcept,
        completeLesson,
        updateMetadata,
        resetProgress,
        completionPercentage: totalPages > 0 ? Math.round((state.completedConcepts.length / totalPages) * 100) : 0
    };
}
