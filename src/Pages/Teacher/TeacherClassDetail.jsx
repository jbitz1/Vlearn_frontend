import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Users, BookOpen, Play, User as UserIcon } from 'lucide-react';
import teacherCurriculumService from '../../services/teacherCurriculumService';

export const TeacherClassDetail = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClassDetail = async () => {
      setIsLoading(true);
      const allStreams = await teacherCurriculumService.getMyStreams();
      const matched = allStreams.find(s => String(s.stream_id || s.id) === String(streamId)) || {
        stream_name: 'Form 4 North',
        school_class_name: 'Form 4',
        school_name: 'Elite High School',
        students: [
          { id: 1, first_name: 'Jason', last_name: 'Bitega' },
          { id: 2, first_name: 'Mary', last_name: 'Wanjiku' },
          { id: 3, first_name: 'John', last_name: 'Mwangi' }
        ]
      };

      setStream(matched);

      // Fetch topics for curriculum section
      const subjectId = matched.subjects?.[0]?.id || 1;
      const fetchedTopics = await teacherCurriculumService.getTopicsForSubject(subjectId);
      setTopics(fetchedTopics);

      setIsLoading(false);
    };

    loadClassDetail();
  }, [streamId]);

  const students = stream?.students || [];

  return (
    <div className="space-y-8 min-h-screen">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-bold text-custom-blue hover:underline cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </button>

      {/* Class Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-50 text-custom-blue rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              {stream?.school_class_name ? `${stream.school_class_name} ${stream.stream_name}` : stream?.stream_name || 'Class Stream'}
            </h1>
            <p className="text-gray-500 font-medium text-sm">
              {stream?.school_name || 'School Stream'}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-3xl animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded-3xl animate-pulse"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* SECTION 1: STUDENT LIST (Roster only, no analytics) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-custom-blue" />
                Student List
              </h2>
              <span className="text-xs bg-blue-50 text-custom-blue font-extrabold px-2.5 py-1 rounded-full">
                {students.length} Learners
              </span>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
              {students.length > 0 ? (
                students.map((student, idx) => (
                  <div
                    key={student.id || idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-custom-blue font-extrabold flex items-center justify-center text-sm shrink-0">
                      {(student.first_name?.[0] || 'S').toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-gray-900 text-sm truncate">
                        {student.first_name} {student.last_name}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No students enrolled in this stream.</p>
              )}
            </div>
          </div>

          {/* SECTION 2: CURRENT CURRICULUM */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-custom-blue" />
              Current Curriculum
            </h2>

            <div className="space-y-4">
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{topic.name}</h3>
                      <p className="text-gray-500 text-xs mt-1">{topic.description || 'Curriculum topic'}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/lesson-viewer/${topic.id}`)}
                      className="px-5 py-2.5 bg-custom-blue hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Teach Lesson
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-100">
                  No curriculum topics found.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default TeacherClassDetail;
