import React from "react";
import { useSubscriptionContext } from "./SubscriptionContextProvider";
import { Link } from "react-router";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import Button from "../../butttons/Button";
import { ArrowRight } from "lucide-react";
import UserContext from "../../../Context/UserContext";

const SubscriptionRestricted = ({
    allowedSubscriptionPlans,
    fallBackComponent = (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center my-10 flex flex-col items-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full">
                    <ShieldExclamationIcon strokeWidth={1} className="text-custom-orange" />
                </div>
                <h3 className="mt-2 text-lg font-bold text-custom-orange">
                    Not Allowed! <br /> You do not have an active subscription for this.
                </h3>
                <p className="my-1 text-lg text-custom-blue">
                     Renew your subscription below to gain access
                </p>
                <Link to={"/billing-and-payments/subscriptions"}>
                    <Button variant="text">Go to Subscriptions <ArrowRight strokeWidth={1}/></Button>
                </Link>
            </div>
        </div>
    ),
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
            if (ent.curriculum_access?.subjects?.length > 0 || ent.features?.length > 0) {
                setAllowed(true);
                return;
            }
        }

        if (subscriptionContext?.activeSubscriptions?.length > 0) {
            if (allowedSubscriptionPlans?.length > 0) {
                let isAllowed = false;
                subscriptionContext.activeSubscriptions.forEach((subscription) => {
                    if (
                        allowedSubscriptionPlans.includes(subscription.plan_id) ||
                        allowedSubscriptionPlans.includes(subscription.plan_name) ||
                        allowedSubscriptionPlans.includes(subscription.plan_name?.toLowerCase().replace(/\s+/g, '_'))
                    ) {
                        isAllowed = true;
                    }
                });
                setAllowed(isAllowed);
                return;
            } else {
                setAllowed(true);
                return;
            }
        }

        setAllowed(false);
    }, [subscriptionContext, allowedSubscriptionPlans, userContext]);

    return allowed ? children : fallBackComponent;
};

export default SubscriptionRestricted;
