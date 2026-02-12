// routes/chat.route.js
import express from "express";
import { embedText } from "../services/embed.service.js";
import { searchVector } from "../services/search.service.js";
import { generateAnswer } from "../services/generate.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const vector = await embedText(message);
    const matches = await searchVector(vector);
    const answer = await generateAnswer(message, matches);

    res.json({ answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
