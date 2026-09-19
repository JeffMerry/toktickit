import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';

export const SESSION_COOKIE_NAME = 'toktickit_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const BCRYPT_ROUNDS = 12;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 10 || password.length > 64) {
    return 'Password must be between 10 and 64 characters.';
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'Password must not exceed 72 UTF-8 bytes.';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number.';
  }
  return undefined;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function hashSessionToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export function createSessionToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString('base64url');
  return { rawToken, tokenHash: hashSessionToken(rawToken) };
}

export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name && value.length > 0) {
      try {
        return decodeURIComponent(value.join('='));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}
