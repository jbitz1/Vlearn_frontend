import { Link } from "react-router";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../config";
import { Mail, ArrowLeft, Loader } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/forgot-password/`, { email });
      if (response.data && response.data.reset_url) {
        setResetUrl(response.data.reset_url);
      }
    } catch (error) {
      // Intentionally ignore errors to prevent email enumeration
    } finally {
      setIsLoading(false);
      setIsSuccess(true);
    }
  };

  return (
    <>
      <div className="relative min-h-screen flex flex-col sm:justify-center items-center bg-gray-100 w-full bg-custom-bg bg-center bg-cover">
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 z-0"></div>

        <div className="relative sm:max-w-lg w-full md:mx-auto z-10 px-4 sm:px-0">
          <div className="card bg-custom-blue shadow-2xl w-full h-full rounded-3xl absolute transform -rotate-6"></div>
          <div className="card bg-custom-orange shadow-2xl w-full h-full rounded-3xl absolute transform rotate-6"></div>
          <div className="relative w-full rounded-3xl px-6 py-8 bg-gray-100 shadow-md">
            
            <div className="flex flex-col items-center justify-center z-10 mb-6">
              <img src="/images/vlearn_logo.png" alt="Logo" className="h-32 w-auto" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Forgot Password</h2>
            
            {isSuccess ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600 text-sm">
                  If an account with that email exists, a reset link has been sent.
                </p>
                {resetUrl && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-xs text-yellow-800 mb-2">Dev mode only: Reset Link Generated</p>
                    <a href={resetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all text-sm hover:underline">
                      {resetUrl}
                    </a>
                  </div>
                )}
                <div className="pt-6">
                  <Link to="/login" className="text-custom-blue hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm text-center mb-6">Enter your email and we&apos;ll send you a link to reset your password.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-3xl outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex items-center justify-center w-full mx-auto py-3 px-4 text-white bg-custom-blue rounded-3xl gap-2 transition duration-500 ease-in-out ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-custom-orange hover:-translate-y-1 hover:shadow-lg"}`}
                  >
                    {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                  </button>
                  
                  <div className="text-center pt-2">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-custom-blue transition-colors flex items-center justify-center gap-1">
                      <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
