import { Link, useNavigate } from "react-router";
import { useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../config";
import UserContext from "../Context/UserContext";
import { Lock, User, Loader } from "lucide-react";


function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start spinner

    try {
      const response = await axios.post(`${BASE_URL}/login/`, formData);

      if (response.status === 200) {
        const token = response.data;
        const role = login(token);

        Swal.fire({
          title: "Success",
          text: "Login successful",
          icon: "success",
          confirmButtonText: "OK",
          timer: 1200,
          showConfirmButton: false,
        });

        if (role === "teacher") {
          navigate("/teacher");
        } else if (role === "school_admin") {
          navigate("/school");
        } else if (role === "platform_admin") {
          navigate("/admin-dashboard");
        } else if (role === "student") {
          navigate("/student");
        } else {
          navigate("/role-selection");
        }
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error.response?.status === 401) {
        errorMessage = error.response?.data?.detail || "Invalid credentials";
      } else if (error.response?.status === 403) {
        errorMessage = "Your account has been disabled. Contact support.";
      } else {
        errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.non_field_errors?.[0] ||
          errorMessage;
      }
      setError(errorMessage);
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false); // Stop spinner
    }
  };



  return (
    <>
      <div className="relative min-h-screen flex flex-col sm:justify-center items-center bg-gray-100 w-full bg-custom-bg bg-center bg-cover">
        {/* Gradient black tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 z-0"></div>

        <div className="relative sm:max-w-lg w-full z-10">
          {/* Decorative cards */}
          <div className="card bg-custom-blue shadow-2xl w-full h-full rounded-3xl absolute transform -rotate-6"></div>
          <div className="card bg-custom-orange shadow-2xl w-full h-full rounded-3xl absolute transform rotate-6"></div>

          {/* Login Card */}
          <div className="relative w-full rounded-3xl px-6 py-6 bg-gray-100 shadow-md">
            {/* Branding */}
            <div className="flex flex-col items-center justify-center z-10">
              <img src="/images/vlearn_logo.png" alt="Logo" className="h-56 w-auto" />
            </div>

            {/* Welcome text */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Welcome Back 👋</h2>
            <p className="text-gray-600 text-sm text-center mb-4">Login to access your personalized dashboard</p>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            <form onSubmit={handleLogin} className="mt-6">
              {/* Username */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-4 pl-10 border-none bg-gray-100 h-11 rounded-3xl shadow-2xl hover:bg-blue-100 focus:bg-blue-100 focus:ring-0 mb-4"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-4 pl-10 border-none bg-gray-100 h-11 rounded-3xl shadow-2xl hover:bg-blue-100 focus:bg-blue-100 focus:ring-0"
                  required
                />
              </div>

              {/* Forgot password */}
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Login button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-blue-500 w-fit py-2 px-5 flex justify-center mx-auto rounded-3xl text-white shadow-xl hover:shadow-inner focus:outline-none transition duration-500 ease-in-out transform ${isLoading ? "cursor-not-allowed" : "hover:-translate-x hover:scale-105"
                    }`}
                >
                  {isLoading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
              {/* Sign up link */}
              <div className="mt-6 text-center border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600 mb-3">Don&apos;t have an account?</p>
                <Link
                  to="/register"
                  className="w-fit py-2 px-5 flex justify-center mx-auto rounded-3xl text-blue-600 border border-blue-500 bg-transparent hover:bg-blue-50 transition duration-300 ease-in-out shadow-sm"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
