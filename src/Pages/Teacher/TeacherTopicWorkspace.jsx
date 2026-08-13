import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, BookOpen, Play, Eye, FileText, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import teacherCurriculumService from '../../services/teacherCurriculumService';

export const TeacherTopicWorkspace = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Teaching Notes states
  const [openNotesLessonId, setOpenNotesLessonId] = useState(null);
  const [notesState, setNotesState] = useState({});
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('misconceptions');

  useEffect(() => {
    const loadTopicData = async () => {
      setIsLoading(true);
      const fetchedTopic = await teacherCurriculumService.getTopicById(topicId);
      setTopic(fetchedTopic);

      const topicLessons = await teacherCurriculumService.getLessonsForTopic(topicId);
      setLessons(topicLessons);

      // Load notes for each lesson
      const initialNotes = {};
      topicLessons.forEach(l => {
        initialNotes[l.id] = teacherCurriculumService.getTeachingNotes(l.id);
      });
      setNotesState(initialNotes);

      setIsLoading(false);
    };

    loadTopicData();
  }, [topicId]);

  const handleOpenLesson = (lessonId) => {
    navigate(`/lesson-viewer/${topicId}?lessonId=${lessonId}`);
  };

  const handleViewAsStudent = (lessonId) => {
    navigate(`/lesson-viewer/${topicId}?lessonId=${lessonId}&mode=preview`);
  };

  const toggleNotesPanel = (lessonId) => {
    if (openNotesLessonId === lessonId) {
      setOpenNotesLessonId(null);
    } else {
      setOpenNotesLessonId(lessonId);
      setNewNoteText('');
    }
  };

  const handleAddNote = (lessonId) => {
    if (!newNoteText.trim()) return;
    const updated = teacherCurriculumService.saveTeachingNote(lessonId, newNoteText.trim(), newNoteCategory);
    setNotesState(prev => ({ ...prev, [lessonId]: updated }));
    setNewNoteText('');
  };

  const handleDeleteNote = (lessonId, noteId) => {
    const updated = teacherCurriculumService.deleteTeachingNote(lessonId, noteId);
    setNotesState(prev => ({ ...prev, [lessonId]: updated }));
  };

  return (
    <div className="space-y-8 min-h-screen">
      {/* Back link */}
      <button
        onClick={() => {
          if (topic?.subject) {
            navigate(`/teacher/subject/${topic.subject}`);
          } else {
            navigate('/teacher/subjects');
          }
        }}
        className="flex items-center text-sm font-bold text-custom-blue hover:underline cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Subject
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          {topic?.name || 'Topic'}
        </h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          {topic?.description || 'Curriculum learning modules.'}
        </p>
      </div>

      {/* Lessons Section */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-6">Lessons</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.length > 0 ? (
              lessons.map((lesson) => {
                const lessonNotes = notesState[lesson.id] || [];
                const isNotesOpen = openNotesLessonId === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-6 flex items-center justify-between flex-wrap gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-custom-blue rounded-2xl">
                          <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                            {lesson.title || lesson.name}
                          </h3>
                          {lesson.description && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleNotesPanel(lesson.id)}
                          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isNotesOpen || lessonNotes.length > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          Teaching Notes ({lessonNotes.length})
                          {isNotesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenLesson(lesson.id)}
                          className="px-6 py-3 bg-custom-blue hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm transition-colors flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" /> Open Lesson
                        </button>
                        <button
                          onClick={() => handleViewAsStudent(lesson.id)}
                          className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold rounded-2xl transition-colors flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Eye className="w-4 h-4" /> View as Student
                        </button>
                      </div>
                    </div>

                    {/* Integrated Teaching Notes Section */}
                    {isNotesOpen && (
                      <div className="border-t border-gray-100 bg-amber-50/40 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-amber-900 uppercase tracking-wide flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-700" />
                            Lesson Preparation Notes (Private to Teacher)
                          </h4>
                        </div>

                        {/* Note Entry */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <select
                            value={newNoteCategory}
                            onChange={(e) => setNewNoteCategory(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-custom-blue"
                          >
                            <option value="misconceptions">Misconceptions Observed</option>
                            <option value="reminders">Reminders for Next Lesson</option>
                            <option value="observations">Classroom Observations</option>
                            <option value="demonstration">Demonstration Ideas</option>
                          </select>
                          <input
                            type="text"
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Add private preparation note..."
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-custom-blue"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddNote(lesson.id);
                            }}
                          />
                          <button
                            onClick={() => handleAddNote(lesson.id)}
                            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Plus className="w-4 h-4" /> Save Note
                          </button>
                        </div>

                        {/* Notes List */}
                        {lessonNotes.length > 0 ? (
                          <div className="space-y-2 pt-2">
                            {lessonNotes.map((note) => (
                              <div
                                key={note.id}
                                className="bg-white border border-amber-100 rounded-2xl p-3.5 flex items-start justify-between gap-4 shadow-2xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                      {note.category || 'reminder'}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">
                                      {note.date}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-800 font-medium">{note.text}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteNote(lesson.id, note.id)}
                                  className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No preparation notes saved for this lesson yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
                No lessons generated for this topic yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTopicWorkspace;
