import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

async function run() {
  console.log("------------------------------------------------");
  console.log("🕵️  DEBUG MODE: Testing Pinecone Upload");
  console.log("------------------------------------------------");

  // TEST 1: Create a fake vector manually (No Gemini)
  // This proves if Pinecone is working at all.
  const fakeVector = {
    id: "test-debug-001",
    values: new Array(768).fill(0.1), // Create 768 fake numbers
    metadata: {
      question: "Test Question",
      answer: "Test Answer"
    }
  };

  console.log("\n1. Created Dummy Vector:");
  console.log("   ID:", fakeVector.id);
  console.log("   Values Length:", fakeVector.values.length); // Should be 768

  try {
    console.log("   Attempting upload...");
    await index.upsert([fakeVector]); // <--- Notice the brackets []
    console.log("   ✅ SUCCESS: Dummy upload worked!");
  } catch (error) {
    console.log("   ❌ FAILED: Dummy upload failed.");
    console.error(error);
    return; // Stop if this fails
  }

  // TEST 2: Try ONE real Gemini embedding
  console.log("\n------------------------------------------------");
  console.log("2. Testing Gemini Embedding...");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const embedModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

  try {
    const result = await embedModel.embedContent({
        content: { parts: [{ text: "This is a test" }] },
        outputDimensionality: 768, 
    });

    const realValues = result.embedding.values;
    
    if (!realValues) {
        throw new Error("Gemini returned NO data!");
    }

    console.log("   ✅ Gemini generated an embedding!");
    console.log("   Vector Length:", realValues.length);

    const realVector = {
        id: "test-gemini-001",
        values: realValues,
        metadata: { info: "Real Gemini Data" }
    };

    await index.upsert([realVector]);
    console.log("   ✅ SUCCESS: Gemini -> Pinecone pipeline is working!");

  } catch (error) {
    console.log("   ❌ FAILED during Gemini test.");
    console.error(error);
  }
}

run();