import { Link } from "react-router";
import { GraduationCap, BookOpen, Building2 } from "lucide-react";

/**
 * Account type selection step for the registration flow.
 *
 * Renders three role cards (Student, Teacher, School). Selecting any card
 * immediately invokes onSelect(role) — no intermediate "Continue" button.
 * This component has no outer page wrapper; it is rendered inside the
 * SignupPage shell.
 */

const ACCOUNT_TYPES = [
  {
    id: "student",
    title: "Student",
    description:
      "Access curriculum-aligned lessons, quizzes and tools to support your learning.",
    Icon: GraduationCap,
    iconColor: "text-custom-blue",
    iconBg: "bg-blue-50",
    activeBorder: "border-custom-blue",
    focusRing: "focus:ring-custom-blue",
  },
  {
    id: "teacher",
    title: "Teacher",
    description:
      "Build lessons, manage your classes and monitor how your learners are progressing.",
    Icon: BookOpen,
    iconColor: "text-custom-orange",
    iconBg: "bg-orange-50",
    activeBorder: "border-custom-orange",
    focusRing: "focus:ring-custom-orange",
  },
  {
    id: "school_admin",
    title: "Register a School",
    description:
      "Register your institution on VizLearn with your school and administrator details.",
    Icon: Building2,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    activeBorder: "border-green-600",
    focusRing: "focus:ring-green-500",
  },
];

export default function AccountTypeSelection({ onSelect }) {
  const handleKeyDown = (e, roleId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(roleId);
    }
  };

  return (
    <div>
      <div className="text-center mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose the type of account that describes you.
        </p>
      </div>

      <div className="space-y-3" role="list">
        {ACCOUNT_TYPES.map(
          ({ id, title, description, Icon, iconColor, iconBg, activeBorder, focusRing }) => (
            <div
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => handleKeyDown(e, id)}
              aria-label={`Create a ${title} account — ${description}`}
              className={`
                flex items-center gap-4 p-4 rounded-2xl border-2 bg-white
                cursor-pointer transition-all duration-150
                border-gray-200 hover:border-gray-300 hover:shadow-sm
                focus:outline-none focus:ring-2 focus:ring-offset-1 ${focusRing}
                active:scale-[0.99]
                group
              `}
            >
              {/* Icon container */}
              <div
                className={`flex-shrink-0 p-2.5 rounded-xl ${iconBg} ${iconColor} transition-colors duration-150 group-hover:${activeBorder}`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
              </div>

              {/* Chevron indicator */}
              <svg
                className="ml-auto flex-shrink-0 h-4 w-4 text-gray-300 group-hover:text-gray-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )
        )}
      </div>

      <p className="text-center text-sm text-gray-600 mt-5">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:underline font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
