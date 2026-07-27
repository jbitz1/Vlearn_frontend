import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router";
import axios from "axios";
import apiClient from "../../config/apiClient";
import UserContext from "../../Context/UserContext";
import BASE_URL from "../../config";
import { Loader, User, Lock, Home, ArrowRight, Building2, CheckCircle, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function InvitationAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, login } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null); // 'invalid', 'used', 'expired', or null
  const [invitationData, setInvitationData] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorStatus("invalid");
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiClient.get('/api/organizations/invitations/accept/', {
          params: { token }
        });
        setInvitationData(response.data);
        setErrorStatus(null);
      } catch (err) {
        console.error("Token validation error:", err);
        const errType = err.response?.data?.error;
        if (errType === "already_accepted" || err.response?.status === 409) {
          setErrorStatus("used");
        } else if (errType === "expired") {
          setErrorStatus("expired");
        } else {
          setErrorStatus("invalid");
        }
      } finally {
        setIsLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAccept = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      // If user is not logged in and providing registration details
      if (!user && (formData.username || formData.password)) {
        let errors = {};
        if (formData.password.length < 8) {
          errors.password = "Password must be at least 8 characters.";
        }
        if (formData.password !== formData.password_confirm) {
          errors.password_confirm = "Passwords do not match.";
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          setIsSubmitting(false);
          return;
        }

        const registerPayload = {
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: invitationData?.email,
          password: formData.password,
          role: invitationData?.role || 'student'
        };

        const regRes = await axios.post(`${BASE_URL}/register/`, registerPayload);
        if (regRes.data?.access) {
          login(regRes.data);
        }
      }

      // Submit invitation acceptance to POST /api/organizations/invitations/accept/
      const response = await apiClient.post('/api/organizations/invitations/accept/', { token });
      
      const membershipRole = response.data?.membership?.role || invitationData?.role || user?.role || "student";

      Swal.fire({
        title: "Invitation Accepted!",
        text: `Welcome to ${response.data?.membership?.school_name || invitationData?.school_name || "your school"}!`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      if (membershipRole === "teacher") navigate("/teacher");
      else if (membershipRole === "school_admin") navigate("/school");
      else if (membershipRole === "platform_admin") navigate("/admin-dashboard");
      else navigate("/student");

    } catch (err) {
      console.error("Invitation acceptance failed:", err);
      let errorMessage = err.response?.data?.detail || "Failed to accept invitation. Please try again.";
      if (typeof err.response?.data === 'object' && !err.response?.data?.detail) {
        setFieldErrors(err.response.data);
        errorMessage = "Please correct the errors below.";
      }
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader className="w-12 h-12 text-custom-blue animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Validating school invitation...</p>
        </div>
      </div>
    );
  }

  if (errorStatus === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-8">This invitation link is invalid or no longer active.</p>
          <Link to="/" className="inline-flex items-center justify-center w-full px-4 py-3 bg-custom-blue text-white rounded-3xl hover:bg-custom-orange transition-colors font-semibold">
            <Home className="w-5 h-5 mr-2" /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (errorStatus === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h2>
          <p className="text-gray-600 mb-8">This invitation link has expired. Please contact your school administrator for a new invite.</p>
          <Link to="/login" className="inline-flex items-center justify-center w-full px-4 py-3 bg-custom-blue text-white rounded-3xl hover:bg-custom-orange transition-colors font-semibold">
            Go to Login <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  if (errorStatus === "used") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Already Accepted</h2>
          <p className="text-gray-600 mb-8">This invitation has already been processed.</p>
          <Link to="/login" className="inline-flex items-center justify-center w-full px-4 py-3 bg-custom-blue text-white rounded-3xl hover:bg-custom-orange transition-colors font-semibold">
            Go to Login <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col sm:justify-center items-center bg-gray-100 w-full bg-custom-bg bg-center bg-cover p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 z-0"></div>

      <div className="relative sm:max-w-lg w-full md:mx-auto z-10">
        <div className="card bg-custom-blue shadow-2xl w-full h-full rounded-3xl absolute transform -rotate-6"></div>
        <div className="card bg-custom-orange shadow-2xl w-full h-full rounded-3xl absolute transform rotate-6"></div>
        
        <div className="relative w-full rounded-3xl px-6 py-8 bg-gray-100 shadow-md">
          <div className="flex flex-col items-center justify-center z-10 mb-4">
            <img src="/images/vlearn_logo.png" alt="Logo" className="h-20 w-auto object-contain mb-2" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-custom-blue" />
            <h2 className="text-xl font-bold text-gray-800 text-center">
              {invitationData?.school_name || "School Invitation"}
            </h2>
          </div>

          <p className="text-gray-600 text-sm text-center mb-6">
            You have been invited as a <span className="font-semibold text-custom-blue capitalize">{invitationData?.role?.replace('_', ' ')}</span> on VLearn
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-center space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Invited Email</p>
            <p className="font-semibold text-gray-900">{invitationData?.email}</p>
            {invitationData?.intended_class && (
              <p className="text-xs text-custom-blue font-medium mt-1">
                Target Stream: {invitationData.intended_class} {invitationData.intended_stream || ''}
              </p>
            )}
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <p className="text-sm text-emerald-800">
                  Signed in as <span className="font-bold">{user.username || user.email}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAccept}
                disabled={isSubmitting}
                className={`flex items-center justify-center w-full py-3.5 px-4 text-white bg-custom-blue rounded-3xl gap-2 font-semibold transition duration-500 ease-in-out ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-custom-orange hover:-translate-y-1 shadow-md hover:shadow-lg"}`}
              >
                {isSubmitting ? <Loader className="h-5 w-5 animate-spin" /> : (
                  <>Accept Invitation & Join <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to={`/login?redirect=/invitation/${token}`} className="text-custom-blue font-semibold hover:underline">
                    Sign In First
                  </Link>
                </p>
              </div>

              <div className="relative border-t border-gray-200 my-4">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 px-3 text-xs text-gray-500 font-medium uppercase">
                  Or Create Account
                </span>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-black border ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-custom-blue transition-colors`}
                    required
                  />
                </div>
                {fieldErrors.username && <p className="text-red-500 text-xs mt-1 pl-2">{fieldErrors.username}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-black border ${fieldErrors.first_name ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-custom-blue transition-colors`}
                      required
                    />
                  </div>
                  {fieldErrors.first_name && <p className="text-red-500 text-xs mt-1 pl-2">{fieldErrors.first_name}</p>}
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-black border ${fieldErrors.last_name ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-custom-blue transition-colors`}
                      required
                    />
                  </div>
                  {fieldErrors.last_name && <p className="text-red-500 text-xs mt-1 pl-2">{fieldErrors.last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-black border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-custom-blue transition-colors`}
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-red-500 text-xs mt-1 pl-2">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-black border ${fieldErrors.password_confirm ? 'border-red-500' : 'border-gray-300'} rounded-3xl outline-none focus:ring-2 focus:ring-custom-blue transition-colors`}
                    required
                  />
                </div>
                {fieldErrors.password_confirm && <p className="text-red-500 text-xs mt-1 pl-2">{fieldErrors.password_confirm}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center w-full py-3 px-4 text-white bg-custom-blue rounded-3xl gap-2 font-semibold transition duration-500 ease-in-out ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-custom-orange hover:-translate-y-1 shadow-md hover:shadow-lg"}`}
                >
                  {isSubmitting ? <Loader className="h-5 w-5 animate-spin" /> : (
                    <>Create Account & Accept Invitation <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
