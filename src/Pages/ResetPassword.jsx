import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../config";
import { Lock, Loader, ArrowRight } from "lucide-react";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/reset-password/${token}/`, {
        password: formData.password
      });

      if (response.status === 200 || response.status === 204) {
        Swal.fire({
          title: "Success",
          text: "Your password has been reset successfully.",
          icon: "success",
          confirmButtonText: "Go to Login",
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (err) {
      let errorMessage = "Failed to reset password. The link might be invalid or expired.";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else {
          errorMessage = Object.values(err.response.data).flat().join("\n") || errorMessage;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Reset Password</h2>
            <p className="text-gray-600 text-sm text-center mb-6">Please enter your new password below.</p>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center border border-red-200">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-3xl outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-3xl outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center w-full mx-auto py-3 px-4 mt-6 text-white bg-custom-blue rounded-3xl gap-2 transition duration-500 ease-in-out ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-custom-orange hover:-translate-y-1 hover:shadow-lg"}`}
              >
                {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : (
                  <>
                    Reset Password
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
