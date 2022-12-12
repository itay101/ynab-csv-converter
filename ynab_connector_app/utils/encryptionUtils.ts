import crypto from 'crypto';

const algorithm = process.env.CRYPTO_ALGORITHM as string; //Using AES encryption
const key = Buffer.from(process.env.CRYPTO_KEY as string, 'base64');
const iv = Buffer.from(process.env.CRYPTO_IV as string, 'base64');

//Encrypting text
export function encrypt(text: string) {
   let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
export function decrypt(text: {iv: string, encryptedData: string}) {
   let iv = Buffer.from(text.iv, 'hex');
   let encryptedText = Buffer.from(text.encryptedData, 'hex');
   let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}