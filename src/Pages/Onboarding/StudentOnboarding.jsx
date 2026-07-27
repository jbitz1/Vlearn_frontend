import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import UserContext from "../../Context/UserContext";
import apiClient from "../../config/apiClient";
import { Check, Loader, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

export default function StudentOnboarding() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingGrades, setFetchingGrades] = useState(false);

  useEffect(() => {
    if (step === 2) {
      const fetchGrades = async () => {
        setFetchingGrades(true);
        try {
          const res = await apiClient.get('/api/curriculum/grades/');
          // Fallback parsing just in case response structure varies
          const data = res.data?.results || res.data || [];
          setGrades(data);
        } catch (err) {
          console.error("Failed to fetch grades", err);
          Swal.fire("Error", "Failed to load grades.", "error");
        } finally {
          setFetchingGrades(false);
        }
      };
      fetchGrades();
    }
  }, [step]);

  const handleSkip = () => {
    localStorage.setItem("onboarding_skipped", "true");
    navigate("/student");
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch('/profile/', {
        onboarding_complete: true,
        grade: selectedGrade?.name || null
      });
      navigate("/student");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save profile. Please try again.", "error");
      setIsLoading(false);
    }
  };

  const renderProgressDots = () => {
    return (
      <div className="flex space-x-2 justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-10 rounded-full transition-colors ${step >= s ? 'bg-custom-orange' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
        
        <div className="flex justify-center mb-6">
          <img src="/images/vlearn_logo.png" alt="Logo" className="h-24 w-auto object-contain" />
        </div>

        {renderProgressDots()}

        {step === 1 && (
          <div className="text-center animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to VLearn, {user?.first_name || user?.username || 'Student'}! 🎉
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We&apos;re thrilled to have you here. Let&apos;s get your profile set up so you can start your science journey.
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-6 inline-block text-left border border-gray-100 shadow-sm mb-8 w-full max-w-sm">
              <div className="flex items-center space-x-4">
                <div className="bg-custom-blue text-white rounded-full h-16 w-16 flex items-center justify-center text-xl font-bold uppercase">
                  {(user?.first_name?.[0] || user?.username?.[0] || 'U')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{user?.username}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
              <button onClick={handleSkip} className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium">
                Skip for now
              </button>
              <button 
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-custom-blue text-white rounded-3xl hover:bg-custom-orange transition-colors flex items-center justify-center shadow-md"
              >
                Let&apos;s Go <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Grade</h2>
            <p className="text-gray-600 mb-8">This helps us personalize your learning experience.</p>
            
            {fetchingGrades ? (
              <div className="flex justify-center items-center h-48">
                <Loader className="w-8 h-8 text-custom-blue animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {grades.map((grade) => (
                  <div 
                    key={grade.id || grade.name}
                    onClick={() => setSelectedGrade(grade)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${selectedGrade?.name === grade.name ? 'border-custom-orange bg-orange-50 shadow-md' : 'border-gray-200 hover:border-custom-blue'}`}
                  >
                    <h3 className="font-semibold text-gray-800">{grade.name}</h3>
                  </div>
                ))}
                {grades.length === 0 && <p className="col-span-full text-gray-500">No grades available.</p>}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <button onClick={handleSkip} className="text-gray-500 hover:text-gray-700 mb-4 sm:mb-0">
                Skip
              </button>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-3xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  disabled={!selectedGrade}
                  onClick={() => setStep(3)}
                  className={`px-6 py-2 rounded-3xl transition-colors flex items-center shadow-sm ${!selectedGrade ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-custom-blue text-white hover:bg-custom-orange'}`}
                >
                  Next <ChevronRight className="ml-1 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center animate-fade-in-up py-10">
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You&apos;re all set!</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              Your profile is ready. Dive in and start exploring courses and quizzes immediately.
            </p>
            
            <button 
              onClick={handleFinish}
              disabled={isLoading}
              className={`px-10 py-4 rounded-3xl text-lg font-semibold text-white transition-all shadow-lg flex items-center justify-center mx-auto ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-custom-orange hover:bg-custom-blue hover:-translate-y-1'}`}
            >
              {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : 'Start Learning'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
