import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ChevronLeft, BookOpen } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import apiClient from '../../config/apiClient';

export const TopicsView = () => {
    const { subjectId } = useParams();
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useContext(UserContext);
    const navigate = useNavigate();

    const [topicProgress, setTopicProgress] = useState({});

    useEffect(() => {
        const fetchProgress = () => {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('vlearn_lesson_progress_'));
            const progressMap = {};
            keys.forEach(k => {
                try {
                    const data = JSON.parse(localStorage.getItem(k));
                    if (data && data.topicId) {
                        const pct = data.totalPages > 0 ? Math.round(((data.completedConcepts?.length || 0) / data.totalPages) * 100) : 0;
                        progressMap[data.topicId] = {
                            isCompleted: data.isCompleted,
                            pct
                        };
                    }
                } catch {}
            });
            setTopicProgress(progressMap);
        };
        fetchProgress();
    }, []);

    useEffect(() => {
        const fetchTopics = async () => {
            if (!token?.access) {
                setError('Please log in to view topics.');
                setIsLoading(false);
                return;
            }
            try {
                const response = await apiClient.get(
                    `/api/curriculum/topics/?subject=${subjectId}`
                );
                const allTopics = response.data.results || response.data;
                setTopics(allTopics.filter(t => t.has_published_lesson));
            } catch {
                setError('Failed to fetch topics. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopics();
    }, [subjectId, token]);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="text-custom-blue hover:underline font-semibold flex items-center mb-8"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
                    </button>

                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            {topics.length > 0 ? topics[0].subject_name : 'Topics'}
                        </h1>
                        <p className="text-gray-600 mt-2">Select a topic to start learning.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-4xl">
                            {topics.length > 0 ? topics.map(topic => (
                                <Link 
                                    to={`/lesson-viewer/${topic.id}`} 
                                    key={topic.id}
                                    className="block bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 p-3 rounded-full text-custom-blue">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{topic.name}</h3>
                                                <p className="text-gray-500 text-sm">{topic.description || 'Curriculum Topic'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right flex flex-col items-end">
                                            {topicProgress[topic.id] ? (
                                                topicProgress[topic.id].isCompleted ? (
                                                    <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">
                                                            {topicProgress[topic.id].pct}% Progress
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-semibold hover:text-custom-blue">Resume Lesson &rarr;</span>
                                                    </div>
                                                )
                                            ) : (
                                                <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide hover:bg-green-100 transition-colors shadow-sm">
                                                    Start Lesson
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <p className="text-gray-500">No topics available for this subject yet.</p>
                            )}
                        </div>
                    )}
        </div>
    );
};
