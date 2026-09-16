import { describe, expect, it } from 'vitest';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  readCookie,
  validatePassword,
  verifyPassword,
} from '../../src/utils/auth';

describe('authentication utilities', () => {
  it('normalizes emails before account lookup', () => {
    expect(normalizeEmail('  Jennifer.Anderson@KMUTT.AC.TH ')).toBe('jennifer.anderson@kmutt.ac.th');
  });

  it('enforces the documented password policy', () => {
    expect(validatePassword('ChangeMe123!')).toBeUndefined();
    expect(validatePassword('short1')).toMatch(/10 and 64/);
    expect(validatePassword('onlylettersxx')).toMatch(/letter and one number/);
    expect(validatePassword('1234567890')).toMatch(/letter and one number/);
    expect(validatePassword('a1' + 'é'.repeat(62))).toMatch(/72 UTF-8 bytes/);
  });

  it('hashes passwords with bcrypt and verifies them safely', async () => {
    const passwordHash = await hashPassword('ChangeMe123!');

    expect(passwordHash).not.toBe('ChangeMe123!');
    await expect(verifyPassword('ChangeMe123!', passwordHash)).resolves.toBe(true);
    await expect(verifyPassword('WrongPassword123!', passwordHash)).resolves.toBe(false);
  });

  it('creates opaque tokens while storing only their SHA-256 hash', () => {
    const first = createSessionToken();
    const second = createSessionToken();

    expect(first.rawToken).not.toBe(first.tokenHash);
    expect(first.tokenHash).toBe(hashSessionToken(first.rawToken));
    expect(first.rawToken).not.toBe(second.rawToken);
  });

  it('reads a named cookie without decoding unrelated values', () => {
    expect(readCookie('other=one; toktickit_session=abc%3D123', 'toktickit_session')).toBe('abc=123');
    expect(readCookie('other=one', 'toktickit_session')).toBeUndefined();
  });
});
