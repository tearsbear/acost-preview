import crypto from "crypto";

/**
 * Derives a secure, 32-byte (256-bit) master secret from existing environment variables.
 * Fallbacks are provided for robust zero-config initialization.
 */
export function getMasterSecret(): Buffer {
  const secret =
    process.env.PLAYGROUND_TRANSIT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "acost-default-transit-fallback-secret-2026";
  
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a temporary dynamic symmetric key using the server's master secret (AES-256-GCM).
 * Returns a compact base64-encoded string: [IV (12 bytes) + Ciphertext + Tag (16 bytes)].
 */
export function encryptKeyToken(rawKey: Buffer, masterSecret: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", masterSecret, iv);
  
  const encrypted = Buffer.concat([cipher.update(rawKey), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  const payload = Buffer.concat([iv, encrypted, tag]);
  return payload.toString("base64");
}

/**
 * Decrypts a key token using the server's master secret to retrieve the dynamic symmetric key.
 */
export function decryptKeyToken(keyTokenBase64: string, masterSecret: Buffer): Buffer {
  const payload = Buffer.from(keyTokenBase64, "base64");
  
  if (payload.length < 12 + 16) {
    throw new Error("Invalid key token payload length.");
  }
  
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(payload.length - 16);
  const encrypted = payload.subarray(12, payload.length - 16);
  
  const decipher = crypto.createDecipheriv("aes-256-gcm", masterSecret, iv);
  decipher.setAuthTag(tag);
  
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Decrypts the LLM API key sent by the client, which was encrypted with AES-GCM (256-bit).
 * Browser Web Crypto API's SubtleCrypto.encrypt("AES-GCM", ...) appends the 16-byte GCM tag
 * directly to the end of the ciphertext buffer.
 */
export function decryptApiKey(
  encryptedApiKeyBase64: string,
  ivBase64: string,
  rawKey: Buffer
): string {
  const ciphertextWithTag = Buffer.from(encryptedApiKeyBase64, "base64");
  const iv = Buffer.from(ivBase64, "base64");
  
  if (ciphertextWithTag.length < 16) {
    throw new Error("Invalid encrypted API key payload length.");
  }
  
  const tag = ciphertextWithTag.subarray(ciphertextWithTag.length - 16);
  const encrypted = ciphertextWithTag.subarray(0, ciphertextWithTag.length - 16);
  
  const decipher = crypto.createDecipheriv("aes-256-gcm", rawKey, iv);
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
