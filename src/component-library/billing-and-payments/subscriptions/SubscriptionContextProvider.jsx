import React from "react";
import UserContext from "../../../Context/UserContext";
import { useFetcher } from "react-router";

const SubscriptionContext = React.createContext(null);

export const useSubscriptionContext = () => {
    return React.useContext(SubscriptionContext);
};

const SubscriptionContextProvider = ({ children }) => {
    const [activeSubscriptions, setActiveSubscriptions] = React.useState([]);
    const [entitlements, setEntitlements] = React.useState({
        platform_wide: false,
        curriculum_access: { grades: [], subjects: [] },
        features: [],
    });
    const [errors, setErrors] = React.useState(null);
    const userContext = React.useContext(UserContext);

    const subscriptionFetcher = useFetcher();

    React.useEffect(() => {
        if (userContext?.user) {
            subscriptionFetcher.load(
                `/billing-and-payments/subscriptions/active`
            );

            // Fetch semantic entitlements
            fetch("/api/subscriptions/entitlements/me/", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data) {
                        setEntitlements(data);
                    }
                })
                .catch((err) => console.error("Error fetching entitlements:", err));
        }
    }, [userContext?.user]);

    React.useEffect(() => {
        if (subscriptionFetcher.data) {
            if (subscriptionFetcher.data.responseCode === 200) {
                setActiveSubscriptions(
                    subscriptionFetcher.data?.responseData?.data || []
                );
            } else {
                setErrors(subscriptionFetcher.data?.responseData?.errors);
            }
        }
    }, [subscriptionFetcher.data]);

    return (
        <SubscriptionContext.Provider
            value={{
                activeSubscriptions,
                entitlements,
                errors,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
};

export default SubscriptionContextProvider;
