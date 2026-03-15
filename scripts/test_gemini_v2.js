const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const envPath = 'c:/Users/moham/OneDrive/Desktop/spend-management-platform/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

async function testV1() {
  if (!apiKey) return;
  
  console.log("Using API Key:", apiKey.substring(0, 10) + "...");
  
  // Try v1 instead of v1beta
  const genAI = new GoogleGenerativeAI(apiKey); // SDK might default to v1beta 
  
  try {
    console.log("\nTesting with default (v1beta)...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with v1beta");
  } catch (e) {
    console.log("v1beta failed:", e.message);
  }

  // Try to use v1 manually by constructing a URL test or if SDK allows setting version
  // Actually, let's try gemini-1.0-pro as a fallback
  try {
    console.log("\nTesting gemini-1.0-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.0-pro");
  } catch (e) {
    console.log("gemini-1.0-pro failed:", e.message);
  }
}

testV1();
