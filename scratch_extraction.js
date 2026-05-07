require("dotenv").config();
const { analyzeDocumentContent } = require("./services/documentAnalysisService.js");

async function run() {
  try {
    const res = await analyzeDocumentContent(`
      EMPLOYER: ACME Corp
      PAN: ABCDE1234F
      BASIC: 500000
      HRA: 200000
    `);
    console.log("Success:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
