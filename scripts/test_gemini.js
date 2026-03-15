const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Manually parse .env.local for GEMINI_API_KEY
const envPath = 'c:/Users/moham/OneDrive/Desktop/spend-management-platform/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

async function listModels() {
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }
  
  console.log("Using API Key:", apiKey.substring(0, 10) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const testModels = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp"
  ];

  for (const modelName of testModels) {
    try {
      console.log(`\nTesting ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'Hello'");
      const response = await result.response;
      console.log(`[SUCCESS] ${modelName} responded: ${response.text()}`);
    } catch (e) {
      console.error(`[FAILURE] ${modelName}: ${e.message}`);
    }
  }
}

listModels();
