import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../../Context/UserContext';
import axios from 'axios';
import BASE_URL from '../../config';
import { Trophy, Clock, Calendar, BarChart } from 'lucide-react';

function Results() {
  const { token } = useContext(UserContext);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/questions/attempts/`, {
          headers: { Authorization: `Bearer ${token.access}` },
        });
        setAttempts(response.data.results || response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [token]);

  if (loading) return <div className="text-center py-20">Loading results...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  return (
    <div className="pl-14 pr-4 py-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Your Quiz Results</h1>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs sm:shadow-sm p-6 sm:p-8 text-center border border-gray-100">
          <p className="text-gray-500 text-xs sm:text-sm">You haven't completed any quizzes yet.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {attempts
            .sort((a, b) => new Date(b.end_time) - new Date(a.end_time))
            .map((attempt) => (
              <div key={attempt.id} className="bg-white rounded-2xl sm:rounded-3xl shadow-xs sm:shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900">{attempt.quiz.title}</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{attempt.quiz.description}</p>
                  </div>
                  <div className="shrink-0 self-start sm:self-center">
                    <div className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold ${attempt.score >= 70 ? 'bg-green-100 text-green-800' :
                        attempt.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      <Trophy className="h-4 w-4 mr-1.5 shrink-0" />
                      Score: {attempt.score?.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs sm:text-sm">
                  <div className="flex items-center text-gray-600 font-semibold">
                    <BarChart className="h-4 w-4 mr-2 text-custom-blue shrink-0" />
                    <span>
                      {attempt.student_answers.filter(a => a.is_correct).length} /{' '}
                      {attempt.student_answers.length} correct answers
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default Results;