import { Link, useNavigate } from "react-router";
import { useState, useContext } from "react";
import UserContext from "../Context/UserContext";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../config";
import { Mail, Lock, ArrowRight, User } from 'lucide-react';

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear field specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    let errors = {};
    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Send complete registration payload including password_confirm to backend serializer
    const payload = { ...formData };

    try {
      const response = await axios.post(`${BASE_URL}/register/`, payload);
      if (response.status === 201) {
        successAlert();
        login(response.data);
        navigate("/role-selection");
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);

      let errorMessage = "An error occurred. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          setFieldErrors(errorData);
          errorMessage = "Please correct the errors below.";
        } else {
          errorMessage = Object.values(errorData).flat().join("\n");
        }
      }

      setError(errorMessage);
      failureAlert(errorMessage);
    }
  };

  const successAlert = () => {
    Swal.fire({
      title: "Success",
      text: "Registration successful",
      icon: "success",
      confirmButtonText: "OK",
    });
  };

  const failureAlert = (message) => {
    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  return (
    <>
      <div className="relative min-h-screen flex flex-col sm:justify-center items-center bg-gray-100 w-full bg-custom-bg bg-center bg-cover">
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 z-0"></div>

        <div className="relative sm:max-w-lg w-full md:mx-auto">
          <div className="card bg-custom-blue shadow-2xl w-full h-full rounded-3xl absolute transform -rotate-6"></div>
          <div className="card bg-custom-orange shadow-2xl w-full h-full rounded-3xl absolute transform rotate-6"></div>
          <div className="relative w-full rounded-3xl px-6 py-4 bg-gray-100 shadow-md">
            {/* Branding */}
            <div className="flex flex-col items-center justify-center z-10">
              <img src="/images/vlearn_logo.png" alt="Logo" className="h-32 w-auto" />
            </div>
            <label htmlFor="signup" className="block mb-3 text-xl text-gray-700 text-center font-semibold">
              Sign up
            </label>
            <p className="text-gray-600 text-sm text-center mb-4">Begin your science journey today</p>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 text-black border ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors`}
                    placeholder="Username"
                    required
                  />
                </div>
                {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 text-black border ${fieldErrors.first_name ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors`}
                    placeholder="First Name"
                    required
                  />
                </div>
                {fieldErrors.first_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.first_name}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 text-black border ${fieldErrors.last_name ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors`}
                    placeholder="Last Name"
                    required
                  />
                </div>
                {fieldErrors.last_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.last_name}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 text-black border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors`}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 text-black border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors`}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 text-black border ${fieldErrors.password_confirm ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors`}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {fieldErrors.password_confirm && <p className="text-red-500 text-xs mt-1">{fieldErrors.password_confirm}</p>}
              </div>
              
              <button
                type="submit"
                className="flex items-center justify-center w-full mx-auto py-3 px-2 mt-4 text-white bg-custom-blue rounded-3xl gap-2 hover:bg-custom-orange transition-colors"
              >
                Create account
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-center text-sm mt-4">
                Already have an account? <Link to="/login"
                  className="text-blue-600 hover:underline transition duration-500 ease-in-out transform hover:-translate-x hover:scale-105"
                >Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
