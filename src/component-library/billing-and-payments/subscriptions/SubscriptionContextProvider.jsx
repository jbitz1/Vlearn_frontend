import React from "react";
import UserContext from "../../../Context/UserContext";
import { useFetcher } from "react-router";

const SubscriptionContext = React.createContext(null);

export const useSubscriptionContext = () => {
    return React.useContext(SubscriptionContext);
};

const SubscriptionContextProvider = ({ children }) => {
    const [activeSubscriptions, setActiveSubscriptions] = React.useState([]);
    const [errors, setErrors] = React.useState(null);
    const userContext = React.useContext(UserContext);

    const subscriptionFetecher = useFetcher();
    React.useEffect(() => {
        if (userContext?.user) {
            subscriptionFetecher.load(
                `/billing-and-payments/subscriptions/active`
            );
        }
    }, [userContext?.user]);

    React.useEffect(() => {
        if (subscriptionFetecher.data) {
            if (
                subscriptionFetecher.data.responseCode === 200
            ) {
                setActiveSubscriptions(
                    subscriptionFetecher.data?.responseData?.data
                );
            } else {
                setErrors(subscriptionFetecher.data?.responseData?.errors);
            }
        }
    }, [subscriptionFetecher.data]);

    return (
        <>
            <SubscriptionContext.Provider
                value={{
                    activeSubscriptions,
                    errors,
                }}
            >
                {children}
            </SubscriptionContext.Provider>
        </>
    );
};

export default SubscriptionContextProvider;
