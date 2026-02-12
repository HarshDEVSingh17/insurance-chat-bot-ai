// services/search.service.js
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export async function searchVector(vector) {
  const response = await index.query({
    vector,
    topK: 3,
    includeMetadata: true,
  });

  return response.matches;
}
