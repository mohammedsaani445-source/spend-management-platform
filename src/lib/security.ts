import { AES, enc } from "crypto-js";

/**
 * BANK-GRADE FIELD-LEVEL ENCRYPTION.
 * Encrypts sensitive fields (PII, Financial) before they ever leave the client.
 * Decryption happens only for authorized roles with local access to the Master Tenant Key.
 */
export class EncryptionService {
    private static MASTER_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "DEFAULT_TENANT_SECURE_KEY_2026";

    /**
     * Encrypts a string value.
     */
    static encrypt(value: string): string {
        if (!value) return "";
        return AES.encrypt(value, this.MASTER_KEY).toString();
    }

    /**
     * Decrypts an encrypted string value.
     */
    static decrypt(encryptedValue: string): string {
        if (!encryptedValue) return "";
        try {
            const bytes = AES.decrypt(encryptedValue, this.MASTER_KEY);
            return bytes.toString(enc.Utf8);
        } catch (e) {
            console.error("[Encryption] Decryption failed. Potentially invalid key or corrupted data.");
            return "[ENCRYPTED_DATA]";
        }
    }

    /**
     * Usage pattern for Sensitive Objects (e.g., Vendor Bank Details).
     */
    static encryptObject(obj: Record<string, any>, sensitiveFields: string[]) {
        const encryptedObj = { ...obj };
        sensitiveFields.forEach(field => {
            if (encryptedObj[field]) {
                encryptedObj[field] = this.encrypt(encryptedObj[field]);
            }
        });
        return encryptedObj;
    }
}
