// services/generate.service.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function generateAnswer(question, matches) {
  if (!matches.length) {
    return "I don't have information about that.";
  }

  const context = matches
    .map(
      m => `Q: ${m.metadata.question}\nA: ${m.metadata.answer}`
    )
    .join("\n\n");

  const prompt = `
You are a helpful insurance support assistant.
Answer ONLY from the context below.
If answer is not present, say you don't know.
Context:
${context}

User Question:
${question}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
