import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

export const genAI = new GoogleGenerativeAI(API_KEY);

export const getModel = (type: "FREE" | "PREMIUM", jsonMode: boolean = false) => {
  // Fixed strictly to gemini-3-flash-preview per user constraint (quota optimization)
  const modelName = "gemini-3-flash-preview";
  
  return genAI.getGenerativeModel({ 
    model: modelName,
    ...(jsonMode ? { generationConfig: { responseMimeType: "application/json" } } : {})
  });
};
