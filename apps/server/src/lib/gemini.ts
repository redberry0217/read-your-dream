import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

export const genAI = new GoogleGenerativeAI(API_KEY);

export const getModel = (type: "FREE" | "PREMIUM") => {
  // Updated for 2026 model availability
  const modelName = type === "FREE" ? "gemini-2.5-flash" : "gemini-2.5-pro";
  return genAI.getGenerativeModel({ model: modelName });
};
