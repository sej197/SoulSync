import { createContext, useState } from "react";

export const EmotionContext = createContext();

export const EmotionProvider = ({ children }) => {
  const [faceEmotion, setFaceEmotion] = useState("Loading...");

  return (
    <EmotionContext.Provider value={{ faceEmotion, setFaceEmotion }}>
      {children}
    </EmotionContext.Provider>
  );
};