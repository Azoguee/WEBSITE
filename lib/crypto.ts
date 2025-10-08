import { createCipheriv, createDecipheriv, scryptSync, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
}

// Use a fixed salt for key derivation, or store it securely if you want it to be unique per encryption.
// For this use case, a fixed salt is acceptable as key is already high-entropy.
const SALT = 'your-fixed-salt-here';
const key = scryptSync(Buffer.from(ENCRYPTION_KEY, 'hex'), SALT, 32);

/**
 * Encrypts a plaintext string.
 * @param text The plaintext to encrypt.
 * @returns An object containing the initialization vector (iv) and the encrypted data.
 */
export function encrypt(text: string): { iv: string; encryptedData: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
}

/**
 * Decrypts an encrypted string.
 * @param iv The initialization vector used for encryption.
 *- @param encryptedData The encrypted data to decrypt.
 * @returns The decrypted plaintext string.
 */
export function decrypt(iv: string, encryptedData: string): string {
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Encrypts data for storage in the CredentialVault.
 * @param data The JSON object to encrypt.
 * @returns An object with the encrypted credentials and the IV, ready for database insertion.
 */
export function encryptForVault(data: Record<string, any>): { encryptedCredentials: Buffer; iv: string } {
  const plainText = JSON.stringify(data);
  const { iv, encryptedData } = encrypt(plainText);
  return {
    encryptedCredentials: Buffer.from(encryptedData, 'hex'),
    iv,
  };
}

/**
 * Decrypts data from the CredentialVault.
 * @param encryptedCredentials The encrypted buffer from the database.
 * @param iv The initialization vector stored alongside the credentials.
 * @returns The decrypted JSON object.
 */
export function decryptFromVault(encryptedCredentials: Buffer, iv: string): Record<string, any> {
  const encryptedText = encryptedCredentials.toString('hex');
  const decryptedText = decrypt(iv, encryptedText);
  return JSON.parse(decryptedText);
}