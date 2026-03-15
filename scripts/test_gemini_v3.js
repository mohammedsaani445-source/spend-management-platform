const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const envPath = 'c:/Users/moham/OneDrive/Desktop/spend-management-platform/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

async function listModels() {
  if (!apiKey) return;
  
  console.log("Using API Key:", apiKey.substring(0, 5) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try to use a very basic model
  const models = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-flash-8b"];
  
  for (const m of models) {
      try {
          console.log(`Testing ${m}...`);
          const model = genAI.getGenerativeModel({ model: m });
          const result = await model.generateContent("hi");
          console.log(`[SUCCESS] ${m} works!`);
          return;
      } catch (e) {
          console.log(`[FAIL] ${m}: ${e.message}`);
      }
  }
}

listModels();
