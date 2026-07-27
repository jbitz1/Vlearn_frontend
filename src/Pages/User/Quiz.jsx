// import React, { useState, useEffect, useContext } from 'react';
// import { Timer, CheckCircle2, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
// import { useParams } from "react-router";
// import axios from 'axios';
// import BASE_URL from '../config';
// import UserContext from '../Context/UserContext';

// function Quiz() {
//   const { id } = useParams();
//   const {token} = useContext(UserContext)
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswerId, setSelectedAnswerId] = useState(null);
//   const [score, setScore] = useState(0);
//   const [showResult, setShowResult] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(30);
//   const [isAnswered, setIsAnswered] = useState(false);
//   const [quiz, setQuiz] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchQuestion = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}/quizzes/${id}/`,
//           {
//             headers: { Authorization: `Bearer ${token.access}` },
//           }
//         );
//         setQuiz(response.data);
//         console.log(response.data)
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchQuestion();
//   }, [id]);

//   useEffect(() => {
//     if (!quiz || timeLeft <= 0 || isAnswered) return;

//     const timer = setInterval(() => {
//       setTimeLeft(prev => prev - 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft, isAnswered, quiz]);

//   useEffect(() => {
//     if (timeLeft === 0 && !isAnswered && quiz) {
//       handleNextQuestion();
//     }
//   }, [timeLeft, isAnswered]);

//   const handleAnswerSelect = (answerId) => {
//     if (isAnswered || !quiz) return;

//     setSelectedAnswerId(answerId);
//     setIsAnswered(true);

//     const currentQuestion = quiz.questions[currentQuestionIndex];
//     const selectedAnswer = currentQuestion.answers.find(a => a.id === answerId);

//     if (selectedAnswer && selectedAnswer.is_correct) {
//       setScore(score + 1);
//     }
//   };

//   const handleNextQuestion = () => {
//     if (!quiz) return;

//     if (currentQuestionIndex < quiz.questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setSelectedAnswerId(null);
//       setTimeLeft(30);
//       setIsAnswered(false);
//     } else {
//       setShowResult(true);
//     }
//   };

//   const resetQuiz = () => {
//     setCurrentQuestionIndex(0);
//     setSelectedAnswerId(null);
//     setScore(0);
//     setShowResult(false);
//     setTimeLeft(30);
//     setIsAnswered(false);
//   };

//   const formatTime = (time) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = time % 60;
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   if (error) return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;
//   if (!quiz) return <div className="min-h-screen flex items-center justify-center">Quiz not found</div>;

//   if (showResult) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
//           <h2 className="text-3xl font-bold text-center mb-6 text-custom-orange">Quiz Complete!</h2>
//           <div className="text-center mb-8">
//             <p className="text-xl mb-2">Your Score:</p>
//             <p className="text-4xl font-bold text-custom-blue">{score} / {quiz.questions.length}</p>
//             <p className="mt-2">
//               ({Math.round((score / quiz.questions.length) * 100)}% correct)
//             </p>
//           </div>
//           <button
//             onClick={resetQuiz}
//             className="w-full py-3 px-6 bg-custom-blue text-white rounded-3xl hover:bg-custom-orange transition-colors flex items-center justify-center gap-2"
//           >
//             <RotateCcw size={20} />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!quiz || !quiz.questions || quiz.questions.length === 0) {
//     return <div className="min-h-screen flex items-center justify-center">No questions available</div>;
//   }

//   const currentQuestion = quiz.questions[currentQuestionIndex];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
//         <div className="flex justify-between items-center mb-6">
//           <div className="text-sm font-medium text-gray-600">
//             Question {currentQuestionIndex + 1}/{quiz.questions.length}
//           </div>
//           <div className="flex items-center gap-2 text-custom-blue">
//             <Timer size={20} />
//             <span className="font-mono">{formatTime(timeLeft)}</span>
//           </div>
//         </div>

//         <div className="mb-8">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-6">
//             {currentQuestion.text}
//           </h2>

//           <div className="space-y-4">
//             {currentQuestion.answers.map((answer) => (
//               <button
//                 key={answer.id}
//                 onClick={() => handleAnswerSelect(answer.id)}
//                 disabled={isAnswered}
//                 className={`w-full p-4 text-left rounded-full transition-all ${selectedAnswerId === answer.id
//                   ? isAnswered
//                     ? answer.is_correct
//                       ? 'bg-green-100 border-green-500'
//                       : 'bg-red-100 border-red-600'
//                     : 'bg-indigo-100 border-indigo-500'
//                   : 'bg-gray-50 hover:bg-gray-100'
//                   } ${isAnswered && answer.is_correct
//                     ? 'bg-green-100 border-green-500'
//                     : ''
//                   } border-2 ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'
//                   }`}
//               >
//                 <div className="flex items-center justify-between">
//                   <span>{answer.text}</span>
//                   {isAnswered && selectedAnswerId === answer.id && (
//                     answer.is_correct
//                       ? <CheckCircle2 className="text-green-500" size={20} />
//                       : <XCircle className="text-red-600" size={20} />
//                   )}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="text-lg font-medium">
//             Score: {score}/{currentQuestionIndex + 1}
//           </div>
//           <button
//             onClick={handleNextQuestion}
//             disabled={!isAnswered}
//             className={`py-3 px-6 rounded-3xl flex items-center gap-2 ${isAnswered
//               ? 'bg-custom-blue text-white hover:bg-custom-orange'
//               : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//               } transition-colors`}
//           >
//             {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
//             <ChevronRight size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Quiz;