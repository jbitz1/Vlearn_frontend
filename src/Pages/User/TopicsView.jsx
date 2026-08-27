import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ChevronLeft, BookOpen } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import apiClient from '../../config/apiClient';
import studentCurriculumService from '../../services/studentCurriculumService';
import ProgressCircle from '../../Components/Common/ProgressCircle';

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
            const allProgress = studentCurriculumService.getAllTopicsProgress(user?.id);
            setTopicProgress(allProgress);
        };
        fetchProgress();
    }, [user?.id]);

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
                className="text-custom-blue hover:underline font-semibold flex items-center mb-8 cursor-pointer"
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
                    {topics.length > 0 ? topics.map(topic => {
                        const progress = topicProgress[topic.id] || studentCurriculumService.getTopicProgress(topic.id, user?.id, topic.lesson_count || 0);

                        return (
                            <Link 
                                to={`/student/lesson-viewer/${topic.id}?from=student`} 
                                key={topic.id}
                                className="block bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="bg-blue-50 p-3 rounded-2xl text-custom-blue shrink-0">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-800">{topic.name}</h3>
                                            <p className="text-gray-500 text-sm mt-0.5">{topic.description || 'Curriculum Topic'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 shrink-0">
                                        <ProgressCircle
                                            percentage={progress.pct}
                                            size={44}
                                            strokeWidth={4}
                                        />

                                        <div className="text-right flex flex-col items-end">
                                            {progress.isCompleted ? (
                                                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">
                                                    Completed
                                                </span>
                                            ) : progress.pct > 0 ? (
                                                <span className="text-xs text-custom-blue font-bold hover:underline">
                                                    Resume Lesson &rarr;
                                                </span>
                                            ) : (
                                                <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide hover:bg-green-100 transition-colors shadow-sm">
                                                    Start Lesson
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    }) : (
                        <p className="text-gray-500">No topics available for this subject yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};
