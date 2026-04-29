require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
  
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("test");
      console.log(`Success with ${modelName}: ${result.response.text().substring(0, 20)}...`);
      return; // Stop if success
    } catch (error) {
      console.error(`Failed with ${modelName}: ${error.message}`);
    }
  }
}

testModels();
