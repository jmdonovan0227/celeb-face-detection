import crypto from 'crypto';

// Decrypt function using a given secret
export default function decrypt(encryptedText, secret, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}