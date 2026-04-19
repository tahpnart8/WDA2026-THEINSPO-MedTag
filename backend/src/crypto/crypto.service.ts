import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;

    constructor(private config: ConfigService) {
        const hexKey = this.config.get<string>('AES_SECRET_KEY');
        if (!hexKey) {
            throw new Error('AES_SECRET_KEY is not defined in environment variables');
        }
        this.key = Buffer.from(hexKey, 'hex');
    }

    encrypt(plaintext: string): string {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }

    decrypt(ciphertext: string): string {
        const [ivHex, encHex] = ciphertext.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encHex, 'hex');
        const decipher = createDecipheriv(this.algorithm, this.key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    }
}
