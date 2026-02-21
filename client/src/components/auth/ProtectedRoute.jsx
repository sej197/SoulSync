import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading, user } = useContext(AuthContext);
    const location = useLocation();

    if(loading){
        return <div className='loading-spinner'>Checking authentication...</div>;
    }    
    if(!isLoggedIn){
        return <Navigate to="/login" replace />;
    }
    // If survey not completed and not already on survey page, redirect to survey
    if(user && !user.surveyCompleted && location.pathname !== '/survey'){
        return <Navigate to="/survey" replace />;
    }
    return children;
}

export default ProtectedRoute;