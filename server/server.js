import express from "express";
import dotenv from "dotenv";
import ImageKit from "imagekit";
import cors from "cors";
/*import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import riskRoutes from "./routes/riskRoutes.js";
import authRoutes from "./routes/authRoutes.js";*/

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

//middlewares
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
//app.use(cookieParser());

/*
//routes
app.use("/api/auth", authRoutes);
app.use("/api/risk", riskRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started at port ${PORT}`)
    });
});
*/

//chatbot
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});

app.get("/api/upload", (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.json(result);
});

