import { useEffect, useState } from "react"
import apiClient from "../../config/apiClient";
import { Users, ListVideo, UserCheck, BookOpen, FileText, Activity } from "lucide-react";
import { Link } from "react-router";

function AdminDashboard() {
    const [enrolledLearners, setEnrolledLearners] = useState(0)
    const [videoCount, setVideoCount] = useState(0)
    const [activeUsers, setActiveUsers] = useState(0)
    
    const [learningUnits, setLearningUnits] = useState([]);
    const [draftLessons, setDraftLessons] = useState([]);
    const [generationJobs, setGenerationJobs] = useState([]);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const [userRes, videoRes, activeUsersRes] = await Promise.all([
                    apiClient.get('/users-count/'),
                    apiClient.get('/video-count/'),
                    apiClient.get('/api/subscriptions/subscribed-users/count/'),
                ]);
                setEnrolledLearners(userRes.data);
                setVideoCount(videoRes.data);
                setActiveUsers(activeUsersRes.data);
            } catch (err) {
                console.error('Error fetching analytics data:', err);
            }
        };

        const fetchCurriculumData = async () => {
            try {
                const [luRes, lessonRes, jobRes] = await Promise.all([
                    apiClient.get('/api/curriculum/learning-units/?page_size=5'),
                    apiClient.get('/api/curriculum/lessons/?status=draft&page_size=5'),
                    apiClient.get('/api/curriculum/generation-jobs/?page_size=5'),
                ]);

                setLearningUnits(luRes.data.results || luRes.data || []);
                setDraftLessons((lessonRes.data.results || lessonRes.data || []).filter(l => l.status === 'draft'));
                setGenerationJobs(jobRes.data.results || jobRes.data || []);
            } catch (err) {
                console.error('Error fetching curriculum data:', err);
            }
        };

        fetchAnalyticsData();
        fetchCurriculumData();
    }, []);

    return (
        <div className="p-4 overflow-y-auto h-screen pb-20">
            <h2 className="text-custom-blue text-3xl font-semibold mb-2 text-center md:text-left">Dashboard</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 md:border-b border-gray-300 w-full px-4 md:px-8 pb-6 mb-8">
                <div className="bg-custom-blue px-6 py-6 rounded-3xl relative w-full">
                    <Users strokeWidth={1} className="text-white w-10 h-10 md:w-12 md:h-12 absolute top-4 right-4" />
                    <h1 className="text-white text-5xl md:text-6xl font-semibold mb-6">
                        {enrolledLearners.user_count || 0}
                    </h1>
                    <p className="text-white font-extralight tracking-wide text-lg md:text-xl">
                        Enrolled learners
                    </p>
                </div>

                <div className="bg-custom-orange px-6 py-6 rounded-3xl relative w-full">
                    <UserCheck strokeWidth={1} className="text-white w-10 h-10 md:w-12 md:h-12 absolute top-4 right-4" />
                    <h1 className="text-white text-5xl md:text-6xl font-semibold mb-6">
                        {activeUsers.subscribed_users || 0}
                    </h1>
                    <p className="text-white font-extralight tracking-wide text-lg md:text-xl">
                        Subscribed learners
                    </p>
                </div>

                <div className="bg-custom-blue px-6 py-6 rounded-3xl relative w-full">
                    <ListVideo strokeWidth={1} className="text-white w-10 h-10 md:w-12 md:h-12 absolute top-4 right-4" />
                    <h1 className="text-white text-5xl md:text-6xl font-semibold mb-6">
                        {videoCount.count || 0}
                    </h1>
                    <p className="text-white font-extralight tracking-wide text-lg md:text-xl">
                        Available Science experiments
                    </p>
                </div>
            </div>

            {/* Curriculum Activity Section */}
            <div className="px-4 md:px-8">
                <h2 className="text-gray-700 text-2xl font-semibold mb-6">Curriculum Activity</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Learning Units */}
                    <div className="bg-white p-4 rounded shadow border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <BookOpen className="text-custom-blue" />
                            <h3 className="font-bold text-lg text-gray-700">Learning Units</h3>
                        </div>
                        {learningUnits.length === 0 ? <p className="text-gray-500 text-sm">No learning units found.</p> : (
                            <ul className="space-y-3">
                                {learningUnits.map(lu => (
                                    <li key={lu.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <span className="font-medium text-gray-800 text-sm truncate">{lu.name}</span>
                                        <Link to={`/admin-dashboard/content-studio/${lu.id}`} className="text-xs bg-custom-blue text-white px-2 py-1 rounded hover:opacity-90">Studio</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Draft Lessons */}
                    <div className="bg-white p-4 rounded shadow border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <FileText className="text-custom-orange" />
                            <h3 className="font-bold text-lg text-gray-700">Draft Lessons</h3>
                        </div>
                        {draftLessons.length === 0 ? <p className="text-gray-500 text-sm">No drafts found.</p> : (
                            <ul className="space-y-3">
                                {draftLessons.map(lesson => (
                                    <li key={lesson.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <span className="font-medium text-gray-800 text-sm truncate">{lesson.title || `Lesson ${lesson.id}`}</span>
                                        <Link to={`/admin-dashboard/content-studio/${lesson.learning_unit}`} className="text-xs bg-custom-orange text-white px-2 py-1 rounded hover:opacity-90">Edit</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Generation Jobs */}
                    <div className="bg-white p-4 rounded shadow border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <Activity className="text-custom-blue" />
                            <h3 className="font-bold text-lg text-gray-700">Generation Jobs</h3>
                        </div>
                        {generationJobs.length === 0 ? <p className="text-gray-500 text-sm">No recent jobs.</p> : (
                            <ul className="space-y-3">
                                {generationJobs.map(job => (
                                    <li key={job.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800 text-sm">Job #{job.id} - {job.job_type}</span>
                                            <span className={`text-xs font-semibold ${job.status === 'completed' ? 'text-green-600' : job.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                {job.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
