require("dotenv").config();
const { chatWithAI } = require("./controllers/aiController.js");
const req = {
  body: {
    message: "hi",
    taxData: {}
  }
};
const res = {
  json: (data) => console.log("Success:", data),
  status: (code) => {
    console.log("Status code:", code);
    return { json: (data) => console.log("Failed:", data) };
  }
};
chatWithAI(req, res);
