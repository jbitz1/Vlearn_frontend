import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import BASE_URL from "../config";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return null;
      return JSON.parse(storedToken);
    } catch (error) {
      console.error("Error parsing token from localStorage:", error);
      localStorage.removeItem("token");
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(() => token !== null);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token"); // Remove token from storage
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'token' && (e.newValue === null || e.newValue === undefined)) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
      } else if (e.key === 'token' && e.newValue) {
        try {
          setToken(JSON.parse(e.newValue));
        } catch (err) {
          // Ignore parse errors on storage event
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

//fetch user on token change
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token?.access) {
        setIsLoading(false);
        return;
      }
  
      try {
        const decodedUser = jwtDecode(token.access); // Decode the JWT
        const response = await fetch(`${BASE_URL}/profile/`, {
          headers: {
            Authorization: `Bearer ${token.access}`,
          },
        });
  
        if (response.ok) {
          const userData = await response.json();
          setUser({
            ...decodedUser,
            ...userData,
            role: userData.role || decodedUser.role || (userData.is_superuser || userData.is_staff ? "platform_admin" : ""),
            organization_id: userData.organization_id || decodedUser.organization_id || null,
          });
        } else {
          console.error("Failed to fetch user profile:", response.status);
          logout();
        }
      } catch (error) {
        console.error("Error decoding token or fetching user profile:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserProfile();
  }, [token, logout]);

  const login = (authToken) => {
    try {
      const decodedUser = jwtDecode(authToken.access); // Extract user info
      const effectiveRole = authToken.role || decodedUser.role || "";
      setUser({ ...decodedUser, role: effectiveRole, organization_id: authToken.organization_id || decodedUser.organization_id || null });
      setToken(authToken);
      localStorage.setItem("token", JSON.stringify(authToken)); // Store token persistently
      return effectiveRole;
    } catch (error) {
      console.error("Invalid token:", error);
      return "student";
    }
  };

  const needsRoleSelection = user && (!user.role || user.role === "");

  return (
    <UserContext.Provider value={{ user, token, isLoading, login, logout, needsRoleSelection }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;