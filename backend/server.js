import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import chatRoute from "./routes/chat.route.js";
import dotenv from "dotenv";

dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 1. Serve the frontend files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// 2. Your API route
app.use("/chat", chatRoute);

// 3. Serve index.html for any other request (Fixes the 404)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));