
const fs = require('fs');
const dotenv = require('dotenv');

try {
    const envConfig = dotenv.parse(fs.readFileSync('c:/Users/moham/OneDrive/Desktop/spend-management-platform/.env.local'));
    const privateKey = envConfig.FIREBASE_PRIVATE_KEY;
    
    if (privateKey) {
        // Handle the original string (might have escaped \n or actual \n)
        const cleaned = privateKey.replace(/\\n/g, '\n').trim();
        const base64Key = Buffer.from(cleaned).toString('base64');
        console.log("BASE64_KEY_START:", base64Key.substring(0, 100));
        console.log("FULL_BASE64_KEY:", base64Key);
    } else {
        console.error("FIREBASE_PRIVATE_KEY not found in .env.local");
    }
} catch (err) {
    console.error("Error reading .env.local:", err.message);
}
