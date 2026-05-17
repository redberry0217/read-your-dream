import 'dotenv/config';

const API_KEY = process.env.GEMINI_API_KEY || "";

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const geminiModels = data.models
      .filter((m: any) => m.name.includes("gemini"))
      .map((m: any) => m.name);
    console.log(JSON.stringify(geminiModels, null, 2));
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

listModels();
