import jwt from "jsonwebtoken";

const userAuth = async(req, res, next) => {
    const {token} = req.cookies;
    if(!token){
        if(req.path == '/is-authenticated'){ //status check route so no token required
            return next();
        }
        return res.status(401).json({
            message: "Unauthorized: No token provided"
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.id){
            req.userId = decoded.id;
            return next();
        }else{
            if(req.path == '/is-authenticated'){
                return next();
            }
            return res.status(401).json({
                message: "Unauthorized: Invalid token"
            });
        }
    }catch(error){
        if(req.path == '/is-authenticated'){
            return next();
        }
        console.error("Error in authentication", error);
        res.status(401).json({
            message: "Unauthorized : Invalid token"
        });
    }

}

export default userAuth;