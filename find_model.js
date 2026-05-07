const Groq = require("groq-sdk");
require('dotenv').config();

async function list() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const models = ['llama-3.3-70b-versatile', 'llama-3.2-11b-vision-preview', 'mixtral-8x7b-32768'];
  
  for (const m of models) {
    console.log(`Testing Groq model: ${m}`);
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: "hi" }],
        model: m,
      });
      console.log(`✅ ${m} works! Response: ${completion.choices[0]?.message?.content}`);
    } catch (e) {
      console.log(`❌ ${m} failed: ${e.message}`);
    }
  }
}

list();
