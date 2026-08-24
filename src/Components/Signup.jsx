import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import AccountTypeSelection from "./Auth/AccountTypeSelection";
import RegistrationForm from "./Auth/RegistrationForm";

const SELF_REGISTERABLE_ROLES = ["student", "teacher", "school_admin"];

function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramRole = searchParams.get("role");

  useEffect(() => {
    if (paramRole === "school_admin") {
      navigate("/school-signup", { replace: true });
    }
  }, [paramRole, navigate]);

  // Honour ?role= deep link if the value is a valid self-registerable role (excluding school_admin which redirects)
  const initialRole = SELF_REGISTERABLE_ROLES.includes(paramRole) && paramRole !== "school_admin" ? paramRole : null;

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [step, setStep] = useState(initialRole ? "register" : "select");

  const handleRoleSelect = (role) => {
    if (role === "school_admin") {
      navigate("/school-signup");
      return;
    }
    setSelectedRole(role);
    setStep("register");
  };

  const handleBack = () => {
    setSelectedRole(null);
    setStep("select");
  };

  return (
    <div className="relative min-h-screen flex flex-col sm:justify-center items-center bg-gray-100 w-full bg-custom-bg bg-center bg-cover">
      {/* Dark gradient overlay — identical to Login.jsx */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30 z-0" />

      <div className="relative sm:max-w-lg w-full md:mx-auto z-10 px-4">
        {/* Decorative tilted cards — identical to Login.jsx and original Signup.jsx */}
        <div className="card bg-custom-blue shadow-2xl w-full h-full rounded-3xl absolute transform -rotate-6" />
        <div className="card bg-custom-orange shadow-2xl w-full h-full rounded-3xl absolute transform rotate-6" />

        {/* Inner content card */}
        <div className="relative w-full rounded-3xl px-6 py-6 bg-gray-100 shadow-md">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img src="/images/vlearn_logo.png" alt="VLearn" className="h-28 w-auto" />
          </div>

          {/*
            key={step} triggers React to unmount/remount the child, which
            re-runs animate-fade-in (already used in StudentOnboarding.jsx).
            This produces a clean in-place transition between steps without
            any page navigation.
          */}
          <div key={step} className="animate-fade-in">
            {step === "select" ? (
              <AccountTypeSelection onSelect={handleRoleSelect} />
            ) : (
              <RegistrationForm selectedRole={selectedRole} onBack={handleBack} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
