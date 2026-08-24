import React from "react";
import { useSubscriptionContext } from "./SubscriptionContextProvider";
import { Link } from "react-router";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import Button from "../../butttons/Button";
import { ArrowRight } from "lucide-react";
import UserContext from "../../../Context/UserContext";

const SubscriptionRestricted = ({
    requireFeature,
    requireSubjectId,
    fallBackComponent,
    children,
}) => {
    const subscriptionContext = useSubscriptionContext();
    const userContext = React.useContext(UserContext);
    const user = userContext?.user;

    // Check if the current user is an admin (platform admin, superuser, staff, school admin, teacher)
    const isAdminOrStaff = Boolean(
        user?.is_superuser ||
        user?.is_staff ||
        user?.role === "platform_admin" ||
        user?.role === "school_admin" ||
        user?.role === "admin" ||
        user?.role === "teacher"
    );

    // Bypass / Active access check (synchronous to prevent fallback flicker)
    const isAllowed = isAdminOrStaff || true; // Testing bypass: grant access to all authenticated accounts

    const role = user?.role;
    
    const defaultFallback = (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
            <div className="text-center my-10 flex flex-col items-center max-w-md px-6">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-amber-50 border border-amber-200">
                    <ShieldExclamationIcon strokeWidth={1.5} className="w-10 h-10 text-accent" />
                </div>
                <h3 className="mt-4 text-xl font-bold font-heading text-navy">
                    Subscription Required
                </h3>
                {role === "teacher" ? (
                    <>
                        <p className="my-2 text-sm text-slate-600">
                             Please contact your school administrator to renew your school's subscription.
                        </p>
                        <Link to="/login" className="mt-3">
                            <Button variant="secondary">Return to Sign In <ArrowRight size={16} className="inline ml-1" /></Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="my-2 text-sm text-slate-600">
                             Renew your subscription below to gain full access to all curriculum features.
                        </p>
                        <Link to={role === "school_admin" ? "/school/subscription" : "/billing-and-payments/subscriptions"} className="mt-3">
                            <Button variant="primary">Go to Subscriptions <ArrowRight size={16} className="inline ml-1" /></Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );

    if (isAllowed) {
        return children;
    }

    return fallBackComponent || defaultFallback;
};

export default SubscriptionRestricted;
