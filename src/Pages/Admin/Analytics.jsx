import { useEffect, useState } from "react"
import BASE_URL from "../../config"
import axios from "axios";
import { Users, ListVideo , UserCheck} from "lucide-react";

function Analytics() {
    const [enrolledLearners, setEnrolledLearners] = useState(0)
    const [videoCount, setVideoCount] = useState(0)
    const [activeUsers, setActiveUsers] = useState(0)

    //fetching analytics
    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const [userRes, videoRes, activeUsersRes] = await Promise.all([
                    axios.get(`${BASE_URL}/users-count/`),
                    axios.get(`${BASE_URL}/video-count/`),
                    axios.get(`${BASE_URL}/api/subscriptions/subscribed-users/count/`)
                ]);

                setEnrolledLearners(userRes.data);
                setVideoCount(videoRes.data);
                setActiveUsers(activeUsersRes.data)
            } catch (err) {
                console.error("Error fetching analytics data:", err);
            }
        };

        fetchAnalyticsData();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-custom-blue text-3xl font-semibold mb-2 text-center md:text-left">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 mx-auto md:mx-0 gap-10 md:border-b border-gray-300 pb-6 w-full">
                <div className="bg-custom-blue px-8 py-6 w-72 h-44 rounded-3xl relative">
                    <Users strokeWidth={1} className="text-white w-12 h-12 absolute top-4 right-4" />
                    <h1 className="text-white text-6xl font-semibold mb-8">
                        {enrolledLearners.user_count}
                    </h1>
                    <p className="text-white font-extralight tracking-wide text-xl">
                        Enrolled learners
                    </p>
                </div>
                <div className="bg-custom-orange px-8 py-6 w-72 h-44 rounded-3xl relative">
                    <UserCheck strokeWidth={1} className="text-white w-12 h-12 absolute top-4 right-4" />
                    <h1 className="text-white text text-6xl font-semibold mb-8">
                        {activeUsers.subscribed_users}
                    </h1>
                    <p className="text-white font-extralight tracking-wide text-xl w-full">
                        Subscribed learners
                    </p>
                </div>

                <div className="bg-custom-blue px-8 py-6 w-72 h-44 rounded-3xl relative">
                    <ListVideo strokeWidth={1} className="text-white w-12 h-12 absolute top-4 right-4" />
                    <h1 className="text-white text text-6xl font-semibold mb-4">
                        {videoCount.count}
                    </h1>
                    <p className="text-white font-extralight tracking-wide text-xl w-full">
                        Available Science experiments
                    </p>
                </div>



            </div>
        </div>
    )
}

export default Analytics
