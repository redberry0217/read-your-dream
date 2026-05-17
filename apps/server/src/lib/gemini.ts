import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

export const genAI = new GoogleGenerativeAI(API_KEY);

export const getModel = (type: "FREE" | "PREMIUM") => {
  // Using gemini-3-flash-preview as per 2026 availability
  return genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
};
