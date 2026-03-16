
const testKey = "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFA\\n-----END PRIVATE KEY-----\\n";

function clean(rawKey) {
    return rawKey
        .replace(/\\n/g, '\n')
        .replace(/\n\s+/g, '\n')
        .replace(/^"(.*)"$/, '$1')
        .replace(/^'(.*)'$/, '$1')
        .trim();
}

const cleaned = clean(testKey);
console.log("Original Length:", testKey.length);
console.log("Cleaned Length:", cleaned.length);
console.log("Cleaned Contains \\n literal:", cleaned.includes('\\n'));
console.log("Cleaned Contains Newline:", cleaned.includes('\n'));
console.log("Start:", cleaned.substring(0, 30));
console.log("End:", cleaned.substring(cleaned.length - 30));
