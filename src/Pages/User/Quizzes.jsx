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
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Quizzes</h1>
        {/* <div className="flex space-x-4">
        <select className="bg-white border border-gray-300 rounded-3xl px-4 py-2">
          <option>All Subjects</option>
          <option>Mathematics</option>
          <option>Physics</option>
          <option>Chemistry</option>
        </select>
        <select className="bg-white border border-gray-300 rounded-3xl px-4 py-2">
          <option>All Difficulties</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-3xl shadow-2xl p-6 h-full w-full items-center">
            <h3 className="text-lg font-semibold text-black mb-2">{quiz.title}</h3>
            <p className="text-black mb-4 font-light text-sm">{quiz.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-black font-bold text-sm">
                <Clock className="h-5 w-5 mr-2" />
                <span>{quiz.time_limit} minutes</span>
              </div>
              <div className="flex items-center text-black font-bold text-sm">
                <BarChart className="h-5 w-5 mr-2" />
                <span>{quiz.question_count} questions</span>
              </div>
              {/* <div className="flex items-center text-black font-bold text-sm">
                <Award className="h-5 w-5 mr-2" />
                <span>{quiz.difficulty}</span>
              </div> */}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => countDownAlert(quiz.id)}
                className="bg-custom-blue text-white px-4 py-2 rounded-3xl hover:bg-custom-orange w-full cursor-pointer">
                Start Quiz
              </button>
              {/* <button className="flex-1 border border-custom-blue text-custom-blue px-4 py-2 rounded-3xl hover:bg-indigo-50">
              Practice Mode
            </button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Quizzes