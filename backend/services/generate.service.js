import { GoogleGenerativeAI } from "@google/generative-ai";
import { logUnknownQuestion } from "../utils/unknownLogger.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const CONFIDENCE_THRESHOLD = 0.75;

export async function generateAnswer(question, matches) {

  // NO MATCHES
  if (!matches || matches.length === 0) {
    logUnknownQuestion(question);
    return "I don't have this information yet. I've shared it with our team.";
  }

  //  LOW CONFIDENCE MATCH
  if (matches[0].score < CONFIDENCE_THRESHOLD) {
    logUnknownQuestion(question);
    return "I don't have this information yet. I've shared it with our team.";
  }

  const context = matches.map(m => `Q: ${m.metadata.question}\nA: ${m.metadata.answer}`).join("\n\n");
  const prompt = `You are a company insurance support assistant.
                  Answer ONLY using the context below.
                  If the context does not answer the question, say "I don't know".Context:${context}User Question:${question}`;
                 try {
                   const result = await model.generateContent(prompt);
                   return result.response.text();
                    } catch (error) {
                        if (error.status === 429) {
                         return "I'm currently handling many requests. Please try again shortly.";
                  }
                    console.error(error);
                   return "Something went wrong.";
                  }
}
