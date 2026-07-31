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
    const [allowed, setAllowed] = React.useState(false);

    React.useEffect(() => {
        if (userContext?.user?.is_superuser || userContext?.user?.is_staff || userContext?.user?.role === 'platform_admin') {
            setAllowed(true);
            return;
        }

        const ent = subscriptionContext?.entitlements;
        if (ent) {
            if (ent.platform_wide) {
                setAllowed(true);
                return;
            }
            if (requireFeature) {
                setAllowed(Boolean(ent.features?.includes(requireFeature)));
                return;
            }
            if (requireSubjectId) {
                const subIds = ent.curriculum_access?.subjects?.map(s => String(s.id)) || [];
                setAllowed(subIds.includes(String(requireSubjectId)));
                return;
            }
            if (ent.curriculum_access?.subjects?.length > 0 || ent.features?.length > 0) {
                setAllowed(true);
                return;
            }
        }

        if (subscriptionContext?.activeSubscriptions?.length > 0) {
            setAllowed(true);
            return;
        }

        setAllowed(false);
    }, [subscriptionContext, requireFeature, requireSubjectId, userContext]);

    const role = userContext?.user?.role;
    
    const defaultFallback = (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center my-10 flex flex-col items-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full">
                    <ShieldExclamationIcon strokeWidth={1} className="text-custom-orange" />
                </div>
                <h3 className="mt-2 text-lg font-bold text-custom-orange">
                    Not Allowed! <br /> You do not have an active subscription for this.
                </h3>
                {role === "teacher" ? (
                    <>
                        <p className="my-1 text-lg text-custom-blue">
                             Please contact your school administrator to renew your school's subscription.
                        </p>
                        <Link to="/login">
                            <Button variant="text">Return to Sign In <ArrowRight strokeWidth={1}/></Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="my-1 text-lg text-custom-blue">
                             Renew your subscription below to gain access
                        </p>
                        <Link to={role === "school_admin" ? "/school/subscription" : "/billing-and-payments/subscriptions"}>
                            <Button variant="text">Go to Subscriptions <ArrowRight strokeWidth={1}/></Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );

    return allowed ? children : (fallBackComponent || defaultFallback);
};

export default SubscriptionRestricted;
