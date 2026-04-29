const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
// Using a placeholder if no API key is provided, but in reality we expect GEMINI_API_KEY in .env
const apiKey = process.env.GEMINI_API_KEY || "dummy_key";
const genAI = new GoogleGenerativeAI(apiKey);

async function callGemini(prompt, retryCount = 0) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  const modelName = models[retryCount % models.length];

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return cleanJsonResponse(result.response.text());
  } catch (error) {
    console.error(`Gemini API Error (${modelName}):`, error.message);
    if (retryCount < 2) {
      console.log(`Retrying with different model...`);
      return callGemini(prompt, retryCount + 1);
    }
    return null;
  }
}

async function callGeminiVision(prompt, mimeType, base64Data, retryCount = 0) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  const modelName = models[retryCount % models.length];

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const imageParts = [{ inlineData: { data: base64Data, mimeType } }];
    const result = await model.generateContent([prompt, ...imageParts]);
    return cleanJsonResponse(result.response.text());
  } catch (error) {
    console.error(`Gemini Vision API Error (${modelName}):`, error.message);
    if (retryCount < 2) {
      return callGeminiVision(prompt, mimeType, base64Data, retryCount + 1);
    }
    return null;
  }
}

async function callGeminiVisionMultiple(prompt, files, retryCount = 0) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  const modelName = models[retryCount % models.length];

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const fileParts = files.map(file => ({
      inlineData: { data: file.base64Data, mimeType: file.mimeType }
    }));
    const result = await model.generateContent([prompt, ...fileParts]);
    return cleanJsonResponse(result.response.text());
  } catch (error) {
    console.error(`Gemini Vision Multiple API Error (${modelName}):`, error.message);
    if (retryCount < 2) {
      return callGeminiVisionMultiple(prompt, files, retryCount + 1);
    }
    return null;
  }
}

// Helper to strip markdown formatting from Gemini JSON responses
function cleanJsonResponse(text) {
  try {
    // Attempt parsing directly first
    return JSON.parse(text);
  } catch (e) {
    // If it fails, try extracting from markdown block
    const match = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (err) {
        console.error("Failed to parse extracted JSON:", match[1]);
      }
    }
    // Fallback: return raw text if we just wanted an explanation
    return text;
  }
}

module.exports = {
  callGemini,
  callGeminiVision,
  callGeminiVisionMultiple
};
