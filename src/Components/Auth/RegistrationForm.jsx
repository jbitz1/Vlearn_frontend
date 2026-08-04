import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import { Mail, Lock, ArrowRight, User, ChevronLeft, Loader } from "lucide-react";
import UserContext from "../../Context/UserContext";
import BASE_URL from "../../config";

/**
 * Registration form step for the role-first registration flow.
 *
 * Props:
 *   selectedRole  — the role string chosen in AccountTypeSelection ('student' | 'teacher' | 'school_admin')
 *   onBack        — callback to return to AccountTypeSelection
 *
 * On successful registration (201):
 *   1. Calls login(response.data) — identical to Login.jsx — which stores the token and returns effectiveRole.
 *   2. Routes using the same role-aware pattern as Login.jsx.
 *      Only override: student → /onboarding (new accounts always begin onboarding before accessing /student).
 *
 * No outer page wrapper — rendered inside the SignupPage shell.
 */

const ROLE_LABELS = {
  student: "Student",
  teacher: "Teacher",
  school_admin: "School",
};

/** Mirror of Login.jsx routing, with one override for new student accounts. */
function resolvePostRegistrationRoute(role) {
  if (role === "student") return "/onboarding";        // Override: fresh accounts need onboarding first
  if (role === "teacher") return "/teacher";
  if (role === "school_admin") return "/school";
  if (role === "platform_admin") return "/admin-dashboard";
  return "/role-selection";                             // Legacy fallback (should not be reached)
}

/** Normalise field error values — backend may return string or string[] */
function fieldErrorText(err) {
  if (!err) return null;
  return Array.isArray(err) ? err[0] : err;
}

export default function RegistrationForm({ selectedRole, onBack }) {
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
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear per-field error as the user corrects their input
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validation — mirrors the original Signup.jsx behaviour
    const clientErrors = {};
    if (formData.password.length < 8) {
      clientErrors.password = "Password must be at least 8 characters.";
    }
    if (formData.password !== formData.password_confirm) {
      clientErrors.password_confirm = "Passwords do not match.";
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/register/`, {
        ...formData,
        role: selectedRole,
      });

      if (response.status === 201) {
        Swal.fire({
          title: "Account created",
          text: "Welcome to VLearn.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
        // login() is identical to Login.jsx — stores token in localStorage and returns effectiveRole
        const role = login(response.data);
        navigate(resolvePostRegistrationRoute(role));
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "An error occurred. Please try again.";

      if (errorData) {
        if (typeof errorData === "object" && !Array.isArray(errorData)) {
          // Map field-level errors from DRF serializer
          setFieldErrors(errorData);
          errorMessage = "Please correct the errors below.";
        } else {
          errorMessage = Object.values(errorData).flat().join("\n");
        }
      }

      setError(errorMessage);
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Shared input class builder
  const inputClass = (fieldName) =>
    `w-full pl-9 pr-4 py-2 text-black border ${
      fieldErrors[fieldName] ? "border-red-500" : "border-gray-300"
    } rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm`;

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3"
          aria-label="Go back to account type selection"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Change account type
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {ROLE_LABELS[selectedRole] || "Create"} account
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Fill in your details to get started.</p>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center mb-3" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Username */}
        <div>
          <label htmlFor="reg-username" className="block mb-1 text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
            <input
              id="reg-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={inputClass("username")}
              placeholder="Username"
              autoComplete="username"
              required
            />
          </div>
          {fieldErrors.username && (
            <p className="text-red-500 text-xs mt-1" role="alert">
              {fieldErrorText(fieldErrors.username)}
            </p>
          )}
        </div>

        {/* First name + Last name — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-first-name" className="block mb-1 text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
              <input
                id="reg-first-name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={inputClass("first_name")}
                placeholder="First"
                autoComplete="given-name"
                required
              />
            </div>
            {fieldErrors.first_name && (
              <p className="text-red-500 text-xs mt-1" role="alert">
                {fieldErrorText(fieldErrors.first_name)}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="reg-last-name" className="block mb-1 text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
              <input
                id="reg-last-name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={inputClass("last_name")}
                placeholder="Last"
                autoComplete="family-name"
                required
              />
            </div>
            {fieldErrors.last_name && (
              <p className="text-red-500 text-xs mt-1" role="alert">
                {fieldErrorText(fieldErrors.last_name)}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputClass("email")}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="text-red-500 text-xs mt-1" role="alert">
              {fieldErrorText(fieldErrors.email)}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
            <input
              id="reg-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={inputClass("password")}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
          {fieldErrors.password && (
            <p className="text-red-500 text-xs mt-1" role="alert">
              {fieldErrorText(fieldErrors.password)}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="reg-password-confirm" className="block mb-1 text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
            <input
              id="reg-password-confirm"
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleInputChange}
              className={inputClass("password_confirm")}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
          {fieldErrors.password_confirm && (
            <p className="text-red-500 text-xs mt-1" role="alert">
              {fieldErrorText(fieldErrors.password_confirm)}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center w-full py-2.5 px-4 mt-2 text-white bg-custom-blue rounded-3xl gap-2 hover:bg-custom-orange transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoading ? (
            <Loader className="h-5 w-5 animate-spin" aria-label="Creating account..." />
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
