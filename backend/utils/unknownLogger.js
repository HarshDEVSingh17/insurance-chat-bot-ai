import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always store inside backend folder
const FILE_PATH = path.join(__dirname, "../unknown_questions.json");

export function logUnknownQuestion(question) {
  let data = [];

  if (fs.existsSync(FILE_PATH)) {
    data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
  }

  const existing = data.find(q => q.question === question);

  if (existing) {
    existing.count += 1;
    existing.lastSeen = new Date().toISOString();
  } else {
    data.push({
      question,
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: "unanswered"
    });
  }

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}
