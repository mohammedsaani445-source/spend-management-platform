
const testKey = `{
  "type": "service_account",
  "project_id": "test-project",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDA6v5C...[REDACTED]...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "test@email.com"
}`;

function processKey(rawKey) {
    let key = rawKey.trim();
    
    // 1. JSON Extraction (More robust)
    if (key.includes('{') && key.includes('private_key')) {
        try {
            // Find the first { and the last } to extract JSON
            const start = key.indexOf('{');
            const end = key.lastIndexOf('}');
            const jsonPart = key.substring(start, end + 1);
            const parsed = JSON.parse(jsonPart);
            if (parsed.private_key) key = parsed.private_key;
        } catch (e) {
            console.log("JSON Parse Failed:", e.message);
        }
    }

    // 2. Quote and Escaping Cleanup
    key = key.replace(/^["']|["']$/g, ''); // Strip outer quotes
    key = key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n'); // Normalize newlines

    // 3. Header Detection
    const hasHeader = key.includes("-----BEGIN");
    
    // 4. Ultimate PEM Reconstruction
    let headerType = "PRIVATE KEY";
    let body = "";

    const match = key.match(/-----BEGIN (.*)-----([\s\S]*)-----END \1-----/);
    if (match) {
        headerType = match[1];
        body = match[2].replace(/[\s\r\n\t]/g, '');
    } else if (key.length > 50) {
        body = key.replace(/[\s\r\n\t]/g, '');
    }

    if (body) {
        const lines = body.match(/.{1,64}/g) || [];
        key = `-----BEGIN ${headerType}-----\n${lines.join('\n')}\n-----END ${headerType}-----\n`;
    }

    return key;
}

console.log("Original Length:", testKey.length);
const processed = processKey(testKey);
console.log("Processed Length:", processed.length);
console.log("Starts with PEM:", processed.includes("-----BEGIN"));
console.log("First 100:", processed.substring(0, 100));
console.log("Last 100:", processed.substring(processed.length - 100));
