import { useState, useEffect } from 'react';
import { Users, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import teacherCurriculumService from '../../services/teacherCurriculumService';

export const TeacherClassesView = () => {
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStreams = async () => {
      setIsLoading(true);
      const data = await teacherCurriculumService.getMyStreams();
      setStreams(data);
      setIsLoading(false);
    };

    loadStreams();
  }, []);

  return (
    <div className="space-y-8 min-h-screen">
      <div>
        <button
          onClick={() => navigate('/teacher')}
          className="flex items-center text-sm font-bold text-custom-blue hover:underline mb-4 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <h1 className="text-3xl font-black text-gray-900">My Classes</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Assigned teaching streams and rosters.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <div
              key={stream.stream_id || stream.id}
              onClick={() => navigate(`/teacher/class/${stream.stream_id || stream.id}`)}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 bg-blue-50 text-custom-blue rounded-2xl group-hover:bg-custom-blue group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-custom-blue transition-colors">
                  {stream.school_class_name ? `${stream.school_class_name} ${stream.stream_name}` : stream.stream_name}
                </h2>
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  {stream.school_name || 'Assigned Stream'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-extrabold text-custom-blue">
                <span>Open Class →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
          No assigned classes found.
        </div>
      )}
    </div>
  );
};

export default TeacherClassesView;
