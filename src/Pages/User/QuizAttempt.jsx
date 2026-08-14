import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from "react-router";
import axios from 'axios';
import BASE_URL from '../../config';
import Swal from 'sweetalert2';
import { Clock, CheckCircle2, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import ProgressCircle from '../../Components/Common/ProgressCircle';

function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(UserContext);
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null); // Changed from questions to quiz
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0); // Track time in seconds
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Start the quiz attempt and fetch questions
  useEffect(() => {
    const startAttempt = async () => {
      try {
        // Record start time immediately
        setQuizStartTime(Date.now());
        

        // Start new attempt (no need for backend to track time)
        const attemptResponse = await axios.post(
          `${BASE_URL}/questions/attempts/start/`,
          { quiz_id: id },
          { headers: { Authorization: `Bearer ${token.access}` } }
        );

        setAttempt(attemptResponse.data);

        // Fetch quiz data
        const quizResponse = await axios.get(
          `${BASE_URL}/questions/quizzes/${id}/`,
          { headers: { Authorization: `Bearer ${token.access}` } }
        );

        setQuiz(quizResponse.data);
        setTimeLeft(quizResponse.data.time_limit * 60);
        setLoading(false);

      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to start quiz');
        setLoading(false);
      }
    };

    startAttempt();
  }, [id, token]);

  // Timer countdown (similar to Quiz component)
  useEffect(() => {
    if (timeLeft === null || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });

      // Update time spent (in seconds)
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  const handleAnswerSelect = (answerId) => {
    if (isAnswered || !quiz) return;

    setSelectedAnswerId(answerId);
    setIsAnswered(true);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers.find(a => a.id === answerId);

    if (selectedAnswer && selectedAnswer.is_correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (!quiz || !selectedAnswerId) return;

    try {
      // Save answer to backend
      const response = await axios.post(
        `${BASE_URL}/questions/answers/`,
        {
          attempt_id: attempt.id,
          question_id: quiz.questions[currentQuestionIndex].id,
          answer_id: selectedAnswerId,
        },
        {
          headers: { Authorization: `Bearer ${token.access}` },
        }
      );
      // Move to next question or finish
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswerId(null);
        setIsAnswered(false);
      } else {
        handleSubmit();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      // First save the current answer if not already saved
      if (selectedAnswerId && !isAnswered) {
        await axios.post(
          `${BASE_URL}/questions/answers/`,
          {
            attempt_id: attempt.id,
            question_id: quiz.questions[currentQuestionIndex].id,
            answer_id: selectedAnswerId,
          },
          { headers: { Authorization: `Bearer ${token.access}` } }
        );
      }
  
      // Calculate percentage correctly
      const percentageScore = quiz.questions.length > 0 
        ? (score / quiz.questions.length) * 100 
        : 0;
  
      // Submit attempt with duration and properly calculated score
      const response = await axios.put(
        `${BASE_URL}/questions/attempts/${attempt.id}/submit/`,
        {
          duration: timeSpent,
          score: percentageScore,  // Send calculated percentage
        },
        { headers: { Authorization: `Bearer ${token.access}` } }
      );
  
      Swal.fire({
        title: 'Quiz Submitted!',
        html: `
          <div class="text-center">
            <h3 class="text-2xl font-bold mb-4">Your Score: ${percentageScore.toFixed(1)}%</h3>
            <p class="text-gray-600">You answered ${score} out of ${quiz.questions.length} questions correctly</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'View Results',
        customClass: {
          popup: 'rounded-3xl shadow-2xl p-10'
        }
      }).then(() => {
        navigate('/dashboard/results');
      });
      
      setShowResult(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!quiz || !quiz.questions) return <div className="min-h-screen flex items-center justify-center">Quiz not found</div>;

  if (showResult) {
    const finalPct = quiz.questions.length > 0 ? Math.round((score / quiz.questions.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-6 text-custom-orange">Quiz Complete!</h2>
          <div className="flex justify-center mb-6">
            <ProgressCircle
              percentage={finalPct}
              size={110}
              strokeWidth={8}
            />
          </div>
          <div className="text-center mb-8">
            <p className="text-xl mb-1 text-gray-700 font-semibold">Your Score</p>
            <p className="text-3xl font-bold text-custom-blue">{score} / {quiz.questions.length}</p>
            <p className="text-sm text-gray-500 mt-2">
              {finalPct >= 70 ? '🎉 Excellent job! You mastered this quiz.' : 'Keep practicing to improve your score!'}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/results')}
            className="w-full py-3 px-6 bg-custom-blue text-white font-bold rounded-3xl hover:bg-custom-orange transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm font-bold text-gray-600">
            Question {currentQuestionIndex + 1}/{quiz.questions.length}
          </div>
          <div className="flex items-center gap-2 text-custom-blue">
            <Clock size={18} />
            <span className="font-mono text-sm sm:text-base font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 leading-snug">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {currentQuestion.answers.map((answer) => (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={isAnswered}
                className={`w-full p-3.5 sm:p-4 text-left rounded-xl sm:rounded-2xl transition-all min-h-[44px] sm:min-h-[3.5rem] flex items-center ${selectedAnswerId === answer.id
                  ? isAnswered
                    ? answer.is_correct
                      ? 'bg-green-100 border-green-500 text-green-900'
                      : 'bg-red-100 border-red-600 text-red-900'
                    : 'bg-indigo-100 border-indigo-500 text-indigo-950'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  } ${isAnswered && answer.is_correct
                    ? 'bg-green-100 border-green-500 text-green-900'
                    : ''
                  } border border-gray-200 ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <span className="text-sm sm:text-base font-medium leading-snug">{answer.text}</span>
                  {isAnswered && selectedAnswerId === answer.id && (
                    answer.is_correct
                      ? <CheckCircle2 className="text-green-600 shrink-0" size={20} />
                      : <XCircle className="text-red-600 shrink-0" size={20} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="text-xs sm:text-lg font-bold text-gray-700">
            Score: {score}/{currentQuestionIndex + 1}
          </div>
          <button
            onClick={handleNextQuestion}
            disabled={!isAnswered}
            className={`py-2.5 px-5 sm:py-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 min-h-[44px] ${isAnswered
              ? 'bg-custom-blue text-white hover:bg-blue-700 shadow-xs cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } transition-colors`}
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizAttempt;