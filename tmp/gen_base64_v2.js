
const fs = require('fs');
const content = fs.readFileSync('c:/Users/moham/OneDrive/Desktop/spend-management-platform/.env.local', 'utf-8');
const match = content.match(/FIREBASE_PRIVATE_KEY\s*=\s*["']?([\s\S]*?)["']?(?:\r?\n|$)/);

if (match && match[1]) {
    const rawValue = match[1];
    const cleaned = rawValue.replace(/\\n/g, '\n').trim();
    const base64Key = Buffer.from(cleaned).toString('base64');
    console.log("BASE64_KEY:" + base64Key);
} else {
    console.error("Could not find FIREBASE_PRIVATE_KEY in .env.local");
}
