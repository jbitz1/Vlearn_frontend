/**
 * @deprecated This authentication context is deprecated and will be removed.
 * Use UserContext from 'src/Context/UserContext.jsx' instead.
 * This file has zero active callers and is preserved only for reference.
 */
import React from "react";
import { apiBaseUrl } from "../../../config/constantVariables";
import { responseFormater } from "../../../util-functions/responseFormater";
import { jwtDecode } from "jwt-decode";
import {
    showResponseMessage,
    useMessagesContext,
} from "../../context-providers/MessagesContextProvider";

export const AuthenticationContext = React.createContext(null);

export const useAuthenticationContext = () => {
    return React.useContext(AuthenticationContext);
};

const AuthenticationContextProvider = ({ children }) => {
    let [authTokens, setAuthTokens] = React.useState(() =>
        localStorage.getItem("authTockens")
            ? JSON.parse(localStorage.getItem("authTockens"))
            : null
    );
    const [userDetails, setUserDetails] = React.useState(null);
    const messagesContext = useMessagesContext();

    const updateUserDetails = async (uid) => {
        fetch(`${apiBaseUrl}/api/accounts/users/${uid}/`, {
            headers: {
                Authorization: `Bearer ${authTokens?.access}`,
            },
        })
            .then((response) => responseFormater(response))
            .then((result) => {
                if (result.responseCode === 200) {
                    setUserDetails(result.responseData.data);
                } else {
                    showResponseMessage(result, messagesContext);
                    signOutUser();
                }
            })
            .catch((error) => {
                messagesContext?.addMessage(
                    messagesContext.createMessage(
                        "Error",
                        "An error occured while fetching user details!",
                        "error"
                    )
                );
                signOutUser();
            });
    };

    React.useEffect(() => {
        if (authTokens !== undefined && authTokens !== null) {
            let decodedToken = jwtDecode(
                JSON.parse(localStorage.getItem("authTockens"))?.access
            );
            let expDate = new Date(decodedToken.exp * 1000);
            let currentDate = new Date();
            if (currentDate > expDate) {
                signOutUser();
            } else {
                updateUserDetails(decodedToken.uid);
            }
        }
    }, [authTokens]);

    const signInUser = (authTokens) => {
        localStorage.setItem("authTockens", JSON.stringify(authTokens));
        setAuthTokens(authTokens);
        messagesContext?.addMessage(
            messagesContext?.createMessage(
                "Signed In",
                "You have been signed in successfuly!",
                "success"
            )
        );
    };

    const signOutUser = () => {
        localStorage.removeItem("authTockens");
        setAuthTokens(null);
        setUserDetails(null);
        messagesContext?.addMessage(
            messagesContext?.createMessage(
                "Signed Out",
                "You have been signed out successfuly!",
                "success"
            )
        );
    };

    return (
        <AuthenticationContext.Provider
            value={{ authTokens, userDetails, signInUser, signOutUser }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
};

export default AuthenticationContextProvider;
