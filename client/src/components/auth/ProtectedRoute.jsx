import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useContext(AuthContext);

    if(loading){
        return <div className='loading-spinner'>Checking authentication...</div>;
    }    
    if(!isLoggedIn){
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default ProtectedRoute;