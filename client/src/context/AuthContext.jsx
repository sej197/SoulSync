import { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import authapi from "../lib/authapi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getAuthStatus = async () => {
    try{
        const response = await authapi.get("/is-authenticated");
        if(response.data.isAuthenticated){
            setUser(response.data.user);
            setIsLoggedIn(true);
        }else{
            setUser(null);
            setIsLoggedIn(false);
        }
    }catch(error){
        console.error("Error fetching auth status", error);
        toast.error("Error fetching authentication status");
    }
  }

    useEffect(() => {
        getAuthStatus();
    }, []);

    const value = {
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        getAuthStatus
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

}
