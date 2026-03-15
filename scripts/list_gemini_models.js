const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const envPath = 'c:/Users/moham/OneDrive/Desktop/spend-management-platform/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

async function listAllModels() {
  if (!apiKey) return;
  
  console.log("Using API Key:", apiKey.substring(0, 10) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // The standard SDK might not have listModels in the browser/node light version
    // But we can try to hit the rest endpoint directly to see what's up
    const fetch = require('node-fetch'); // If available, or just use https
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Available Models:");
      data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    }
  } catch (e) {
    console.error("Fetch failed:", e.message);
    // Try https directly if node-fetch is missing
    const https = require('https');
    https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            console.error("HTTPS API Error:", JSON.stringify(parsed.error, null, 2));
          } else {
            console.log("HTTPS Available Models:");
            parsed.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
          }
        } catch (e2) {
          console.error("HTTPS Parse Error:", e2.message);
          console.log("Raw response:", data);
        }
      });
    }).on("error", (err) => {
      console.log("HTTPS Error: " + err.message);
    });
  }
}

listAllModels();
