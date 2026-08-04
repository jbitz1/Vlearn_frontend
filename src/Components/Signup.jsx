import { useState } from "react";
import { useSearchParams } from "react-router";
import AccountTypeSelection from "./Auth/AccountTypeSelection";
import RegistrationForm from "./Auth/RegistrationForm";

/**
 * SignupPage — thin orchestrator for the two-step registration flow.
 *
 * Step 1: AccountTypeSelection — user picks Student, Teacher, or School.
 * Step 2: RegistrationForm     — user fills in their details for the chosen role.
 *
 * Deep-link support:
 *   /register?role=student  → skips step 1 and opens the form directly.
 *   /register?role=teacher  → same for teacher.
 *   /register?role=school_admin → same for school.
 *   Any other value is ignored and step 1 is shown.
 *
 * Visual continuity:
 *   Both steps share the same outer page shell (bg-custom-bg, gradient overlay,
 *   tilted decorative cards, inner white card). Content swaps in-place; no
 *   route change occurs between steps.
 *
 * The /role-selection route is NOT visited during normal public registration.
 * It is retained as a legacy compatibility route for existing workflows.
 */

const SELF_REGISTERABLE_ROLES = ["student", "teacher", "school_admin"];

function SignupPage() {
  const [searchParams] = useSearchParams();
  const paramRole = searchParams.get("role");

  // Honour ?role= deep link if the value is a valid self-registerable role
  const initialRole = SELF_REGISTERABLE_ROLES.includes(paramRole) ? paramRole : null;

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [step, setStep] = useState(initialRole ? "register" : "select");

  const handleRoleSelect = (role) => {
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
