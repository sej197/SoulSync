import { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { checkAuthStatus as fetchAuthStatus } from "../lib/authapi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const getAuthStatus = async () => {
    try{
        const data = await fetchAuthStatus();
        if(data.isAuthenticated){
            setUser(data.user);
            setIsLoggedIn(true);
        }else{
            setUser(null);
            setIsLoggedIn(false);
        }
    }catch(error){
        console.error("Error fetching auth status", error);
        toast.error("Error fetching authentication status");
    }finally{
        setLoading(false);
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
        getAuthStatus,
        loading
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

}
