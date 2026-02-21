import rateLimit from "../config/upstash.js";

// Paths exempt from rate limiting (called on every page load)
const EXEMPT_PATHS = [
  "/api/auth/is-authenticated",
];

const rateLimiter = async(req, res, next) => {
  try{
    if (EXEMPT_PATHS.includes(req.originalUrl?.split("?")[0])) {
      return next();
    }

    const key = req.userId || req.ip || "anonymous";
    const {success} = await rateLimit.limit(key);

    if(!success){
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again later." });
    }

    next();
  }catch (error){
    console.error("Rate limiter error:", error);
    res.status(500).json({
        message: "Internal Server Error" 
    });
    next(error);
  }
};

export default rateLimiter;