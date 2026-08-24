import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import BASE_URL from "../../config";
import { GraduationCap, User } from "lucide-react";
import UserContext from "../../Context/UserContext";
import Swal from "sweetalert2";
import ReactPlayer from "react-player";
import { ArrowLeft } from "lucide-react";
import Breadcrumb from "../../Components/Breadcrumb";

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(UserContext); // Consume UserContext
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/courses/${id}/`, {
          headers: {
            Authorization: `Bearer ${token.access}`, // Use the token from context
          },
        });
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      setQuizLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/questions/quizzes/`, {
          headers: {
            Authorization: `Bearer ${token?.access}`, // Use the token from context
          },
        });
        setQuizzes(response.data.results || response.data);
        const courseQuiz = (response.data.results || response.data).find(q => q.video === parseInt(id));
        setQuiz(courseQuiz || null);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setQuiz(null);
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuizzes();
  }, [id]);

  const countDownAlert = (quizId) => {
    if (!quizId) {
      Swal.fire({
        title: "No Quiz Available",
        text: "There is no quiz associated with this course yet.",
        icon: "info",
        customClass: {
          popup: 'rounded-3xl shadow-2xl p-10'
        }
      });
      return;
    }

    let seconds = 5;
    let timerInterval;

    Swal.fire({
      title: "Your test begins in",
      html: `
          <div class="items-center gap-2">
            <b id="countdown" class="text-4xl font-bold text-custom-blue texts-center">${seconds}</b>
            <span class="text-gray-600 items-center text-2xl">seconds</span>
          </div>
        `,
      timer: seconds * 1000,
      timerProgressBar: false,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-3xl shadow-2xl p-10 w-fit'
      },
      allowOutsideClick: false,
      didOpen: () => {
        const countdownElement = document.getElementById("countdown");
        timerInterval = setInterval(() => {
          seconds--;
          if (countdownElement) {
            countdownElement.textContent = seconds;
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        Swal.fire({
          title: "Your quiz starts now!",
          timer: 1500,
          timerProgressBar: false,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-3xl shadow-2xl p-10 w-fit text-custom-orange'
          },
          willClose: () => {
            navigate(`/dashboard/quiz/${quizId}`);
          }
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center items-center">
          <div className="animate-spin border-4 border-t-4 border-custom-blue border-solid rounded-full w-16 h-16 mx-auto"></div>
          <p className="text-custom-orange">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <nav className="sticky top-0 z-50 w-full flex flex-col md:flex-row items-center justify-between p-2 shadow-2xl bg-white">
        <div className="flex items-center gap-2 p-2 md:p-4">
          <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-custom-blue" />
          <Link to="/dashboard" className="hidden md:block">
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">VizLearn</h1>
          </Link>
        </div>

        <div className="flex flex-col items-center text-center px-2 py-1 md:py-0">
          <h1 className="text-xl md:text-3xl font-bold text-custom-blue line-clamp-1">{course?.title}</h1>
          <p className="text-xs md:text-base text-slate-600 line-clamp-1">Course subtitle: {course?.subtitle}</p>
        </div>

        <div className="hidden md:flex items-center text-slate-700 mr-4 p-2 md:p-4">
          <User className="h-5 w-5 mr-1" />
          {user ? (<span className="text-sm md:text-base">{user.username}</span>) : (<User />)}
        </div>
      </nav>

      {/* Main Content */}
      <div className="mt-6 md:mt-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-6 flex justify-between">
          <Breadcrumb />
          <div className="flex justify-start">
            <Link to="/dashboard" className="flex items-center text-custom-blue hover:text-custom-orange transition-colors hover:cursor-pointer">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Back to dashboard</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - Video and Description */}
          <div className="col-span-1 lg:col-span-2 space-y-4 md:space-y-6">
            {/* Video Player */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
              {course?.cloudflare_video_id ? (
                <iframe
                  src={`https://iframe.videodelivery.net/${course.cloudflare_video_id}`}
                  className="w-full h-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              ) : course?.playback_url ? (
                <ReactPlayer
                  url={course.playback_url}
                  controls
                  width="100%"
                  height="100%"
                  playing
                  config={{
                    file: {
                      attributes: {
                        crossOrigin: "anonymous",
                      },
                    },
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  Loading video...
                </div>
              )}
            </div>

            {/* Course Details */}
            <div className="rounded-xl md:rounded-2xl shadow-lg md:shadow-xl px-4 py-3 md:px-8 md:py-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">{course?.title}</h2>
              <p className="text-sm md:text-base text-slate-600 mt-2 mb-3 md:mb-4">{course?.description}</p>
              <p className="text-xs md:text-sm text-slate-500">
                Duration: <span className="font-semibold">{course?.duration}</span>
              </p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-1 space-y-4 md:space-y-6">


            {/* Course Info */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">About the experiment</h2>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-xs md:text-sm text-slate-500">Instructor</p>
                  <p className="text-base md:text-lg font-semibold text-slate-900">{course?.instructor}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500">Category</p>
                  <p className="text-base md:text-lg font-semibold text-slate-900">{course?.category}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500">Uploaded on</p>
                  <p className="text-base md:text-lg font-semibold text-slate-900">
                    {course?.created_at}
                  </p>
                </div>
              </div>
            </div>

            {/* Quiz Section */}
            <div className="backdrop-blur-lg bg-white/80 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 text-center">
              <h3 className="text-custom-blue text-lg md:text-xl">Test your understanding</h3>
              {quizLoading ? (
                <div className="text-center py-3 md:py-4">
                  <div className="animate-spin border-4 border-t-4 border-custom-blue border-solid rounded-full w-8 h-8 mx-auto"></div>
                  <p className="text-custom-blue mt-2 text-sm md:text-base">Checking for quiz...</p>
                </div>
              ) : (
                <button
                  onClick={() => quiz ? countDownAlert(quiz.id) : Swal.fire({
                    title: "No Quiz Available",
                    text: "This course doesn't have a quiz yet.",
                    icon: "info",
                    customClass: {
                      popup: 'rounded-3xl shadow-2xl p-10'
                    }
                  })}
                  className={`bg-custom-blue text-white px-4 py-2 rounded-xl md:rounded-2xl hover:bg-custom-orange w-fit max-w-xs mx-auto flex items-center justify-center mt-3 md:mt-4 ${!quiz ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  disabled={!quiz}
                >
                  Attempt quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;