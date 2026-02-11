import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import riskRoutes from "./routes/riskRoutes.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/risk", riskRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started at port ${PORT}`)
    });
});
