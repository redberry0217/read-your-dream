import { getModel } from "../lib/gemini.js";
import { Emotions, DreamType } from "@mjdr/shared-types";

export class DreamService {
  static async interpretDream(content: string, type: DreamType, userStatus?: { recentWorry?: string; feeling?: string }) {
    const model = getModel(type);

    let prompt = "";
    if (type === "FREE") {
      prompt = `
        You are a mystical dream interpreter. 
        Interpret the following dream content and provide:
        1. A brief summary of the dream.
        2. 3 Tarot card results related to the dream.
        
        Dream Content: "${content}"
        
        Respond in Korean.
        Format your response as a JSON object with keys: "summary" (string), "tarotCards" (array of 3 strings).
      `;
    } else {
      prompt = `
        You are a professional depth psychologist and dream analyst.
        Analyze the following dream in detail, considering the user's recent status.
        
        Dream Content: "${content}"
        User's Recent Worry: "${userStatus?.recentWorry || "None"}"
        User's Current Feeling: "${userStatus?.feeling || "None"}"
        
        Provide:
        1. A detailed psychological analysis of the dream.
        2. Scores (0-100) for the 7 traditional emotions (Oh-Yok-Chil-Jung):
           - joy (환희)
           - anger (분노)
           - sadness (비애)
           - fear (경외)
           - love (애착)
           - disgust (거부)
           - desire (열망)
        
        Respond in Korean.
        Format your response as a JSON object with keys: 
        "analysis" (string), 
        "emotions" (object with keys: joy, anger, sadness, fear, love, disgust, desire as numbers 0-100).
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (sometimes Gemini adds markdown block)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    return JSON.parse(jsonMatch[0]);
  }
}
