import fs from "fs";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  console.log("🚀 Starting Simplified Build Process...");

  // 1. Read Data
  const rawData = fs.readFileSync("./knowledge_base.json", "utf-8");
  const knowledgeBase = JSON.parse(rawData);
  console.log(`📦 Loaded ${knowledgeBase.length} items from knowledge_base.json`);

  const vectors = [];
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  const embedModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

  // 2. Embed
  for (let i = 0; i < knowledgeBase.length; i++) {
    const item = knowledgeBase[i];
    const text = `Question: ${item.question}\nAnswer: ${item.answer}`;

    try {
      const result = await embedModel.embedContent({
        content: { parts: [{ text }] },
        outputDimensionality: 768, 
      });
      
      // Handle tags OR keywords
      const tagsData = item.tags || item.keywords || [];
      const tagString = Array.isArray(tagsData) ? tagsData.join(", ") : "";

      vectors.push({
        id: item.id || `item-${i}`,
        values: result.embedding.values,
        metadata: {
          question: item.question,
          answer: item.answer,
          category: item.category,
          tags: tagString,
        },
      });

      process.stdout.write("."); // Print dot for progress
    } catch (error) {
      console.error(`\n❌ Error on item ${i}:`, error.message);
    }
  }

  console.log(`\n✅ Generated ${vectors.length} vectors.`);

  // 3. Upload (Direct, no batch loop)
  if (vectors.length > 0) {
    console.log("📤 Uploading to Pinecone...");
    try {
        await index.upsert(vectors); // Sending all at once
        console.log("🎉 Success! Database updated.");
    } catch (err) {
        console.error("❌ Pinecone Upload Failed:", err);
    }
  } else {
    console.error("❌ No vectors to upload.");
  }
}

run();