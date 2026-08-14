import React, { useState, useEffect, useContext } from 'react';
import { Clock, Award, BarChart } from 'lucide-react';
import axios from 'axios';
import BASE_URL from '../../config';
import { useNavigate } from "react-router";
import Swal from 'sweetalert2';
import UserContext from '../../Context/UserContext';

function Quizzes() {

  const navigate = useNavigate()
  const {token} = useContext(UserContext)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/questions/quizzes/`, 
          {
            headers: { Authorization: `Bearer ${token.access}` },
          }
        );
        console.log(response.data)
        setQuizzes(response.data.results || response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Ensure loading stops
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) return <p
  className='min-h-screen flex items-center justify-center'>Loading quizzes...</p>;
  if (error) return <p>Error: {error}</p>;

  const countDownAlert = (quizId) => {
    let seconds =5; // Set countdown time in seconds
    let timerInterval;

    Swal.fire({
      title: "Your test begins in",
      html: `
        <div class="items-center gap-2">
          <b id="countdown" class="text-4xl font-bold text-custom-blue texts-center">${seconds}</b>
          <span class="text-black items-center text-2xl">seconds</span>
        </div>
      `,
      timer: seconds * 1000, // Convert to milliseconds
      timerProgressBar: false,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-3xl shadow-2xl p-10 w-fit'
      },
      allowOutsideClick: false,
      didOpen: () => {
        const countdownElement = Swal.getHtmlContainer().querySelector("#countdown");
        timerInterval = setInterval(() => {
          seconds--;
          countdownElement.textContent = seconds;
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        Swal.fire({
          title: "Your quiz starts now!",
          timer: 1500, // Show for 1.5 seconds
          timerProgressBar: false,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-3xl shadow-2xl p-10 w-fit text-custom-orange'
          },
          willClose: () => {
            navigate(`/student/quiz/${quizId}`);
          }
        });
      }
    });
  }

  return (
    <div className="pl-14 pr-4 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Available Quizzes</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-2xl sm:rounded-3xl shadow-xs sm:shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{quiz.title}</h3>
              <p className="text-gray-500 mb-4 font-normal text-xs sm:text-sm line-clamp-2">{quiz.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-700 font-bold text-xs sm:text-sm">
                  <Clock className="h-4 w-4 mr-2 text-custom-blue shrink-0" />
                  <span>{quiz.time_limit} minutes</span>
                </div>
                <div className="flex items-center text-gray-700 font-bold text-xs sm:text-sm">
                  <BarChart className="h-4 w-4 mr-2 text-custom-blue shrink-0" />
                  <span>{quiz.question_count} questions</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => countDownAlert(quiz.id)}
                className="bg-custom-blue text-white px-4 py-2.5 rounded-xl sm:rounded-2xl hover:bg-blue-700 font-bold text-xs sm:text-sm w-full cursor-pointer transition-colors flex items-center justify-center min-h-[44px]"
              >
                Start Quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Quizzes