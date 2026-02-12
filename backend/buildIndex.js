import fs from "fs";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
const rawData = fs.readFileSync("./knowledge_base.json", "utf-8");
const knowledgeBase = JSON.parse(rawData);


async function run() {
  console.log("Generating embeddings with Gemini...");
  const vectors = [];
  for (let i = 0; i < knowledgeBase.length; i++) {
    const item = knowledgeBase[i];
    const text = `Question: ${item.question}\nAnswer: ${item.answer}`;
   // We ask the model to shrink the vector to 768 to match your database
   const result = await embedModel.embedContent({
   content: { parts: [{ text }] },
   outputDimensionality: 768, 
});
    const embedding = result.embedding.values;

    if (!embedding || embedding.length !== 768) {
      throw new Error("Embedding failed or wrong dimension");
    }

    vectors.push({
      id: i.toString(),
      values: embedding,
      metadata: {
        question: item.question,
        answer: item.answer,
        category: item.category,
        tags: item.tags.join(", "),
      },
    });

    console.log(`Embedded ${i + 1}/${knowledgeBase.length}`);
  }
  console.log("Uploading vectors to Pinecone...");
  await index.upsert(vectors);
  console.log("Vector index built successfully with Gemini embeddings.");
}

run();
