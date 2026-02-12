import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embedModel = genAI.getGenerativeModel({
  model: "models/gemini-embedding-001",
});

export async function embedText(text) {
  const result = await embedModel.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768,
  });

  return result.embedding.values;
}
