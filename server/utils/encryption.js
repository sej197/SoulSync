import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey() {
  const key = process.env.JOURNAL_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    console.warn("WARNING: JOURNAL_ENCRYPTION_KEY is missing or invalid. Using a fallback key for development. THIS IS NOT SECURE FOR PRODUCTION.");
    return Buffer.from("d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4", "hex");
  }
  return Buffer.from(key, "hex");
}


export function encrypt(plaintext) {
  if (!plaintext) return plaintext;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}


export function decrypt(encryptedStr) {
  if (!encryptedStr) return encryptedStr;


  if (!encryptedStr.includes(":")) return encryptedStr;

  const parts = encryptedStr.split(":");
  if (parts.length !== 3) return encryptedStr;

  const [ivHex, authTagHex, ciphertext] = parts;

  if (ivHex.length !== IV_LENGTH * 2 || authTagHex.length !== AUTH_TAG_LENGTH * 2) {
    return encryptedStr;
  }

  try {
    const key = getKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("Decryption failed, returning raw value:", err.message);
    return encryptedStr;
  }
}
