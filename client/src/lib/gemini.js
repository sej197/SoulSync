import { GoogleGenerativeAI } from "@google/generative-ai";

const safetySetting = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_LOW_AND_ABOVE"
    }
]
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_PUBLIC_KEY);
const model = genAI.getGenerativeModel({
    model: "models/gemini-2.5-pro",
    safetySettings: safetySetting
});
export default model;