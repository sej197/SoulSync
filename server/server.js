import express from "express";

const port = process.env.PORT || 5000;
const app = express();

app.listen(port, () => console.log(`Server running on port ${port}`));

app.get("/api/upload", (req, res) => {
    res.json({ message: "Hello World!" });
});