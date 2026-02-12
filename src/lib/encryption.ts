import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Ensure the secret is hashed to exactly 32 bytes for AES-256
const getKey = () => {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET is not defined in .env');
  }
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypts a string using AES-256-GCM.
 * Returns format: "iv:authTag:encryptedData" (hex encoded)
 */
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16); // Initialization Vector
  const key = getKey();
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return IV, AuthTag, and Encrypted Content separated by colons
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts a string using AES-256-GCM.
 * Expects format: "iv:authTag:encryptedData"
 */
export const decrypt = (encryptedText: string): string => {
  const parts = encryptedText.split(':');
  
  // Basic validation to ensure format is correct
  if (parts.length !== 3) {
    throw new Error('Invalid encryption format. Expected iv:authTag:content');
  }

  const [ivHex, authTagHex, contentHex] = parts;
  
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(contentHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};