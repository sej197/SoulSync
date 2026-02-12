import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import riskRoutes from "./routes/riskRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/risk", riskRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started at port ${PORT}`)
    });
});
