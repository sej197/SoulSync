import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);     
    if(!isLoggedIn){
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default ProtectedRoute;