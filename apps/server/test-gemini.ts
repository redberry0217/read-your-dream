import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

async function test(name: string) {
  try {
    const model = genAI.getGenerativeModel({ model: name });
    const result = await model.generateContent("test");
    console.log(`Success with ${name}`);
    return true;
  } catch (e: any) {
    console.error(`Error with ${name}:`, e.message);
    return false;
  }
}

async function run() {
  await test("gemini-1.5-flash");
  await test("gemini-1.5-flash-latest");
  await test("gemini-1.5-pro");
  await test("gemini-pro");
}

run();
