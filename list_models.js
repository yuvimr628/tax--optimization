const Groq = require("groq-sdk");
require("dotenv").config({ path: "./server/.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
  try {
    const response = await groq.models.list();
    console.log("Available Models:", response.data.map(m => m.id).join(", "));
  } catch (error) {
    console.error("Failed to list models:", error.message);
  }
}

listModels();
