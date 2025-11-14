/**
 * T039 [P] [US1] Unit test for password hashing
 * Tests bcrypt password hashing and verification
 */
import { hashPassword, verifyPassword } from '../../../../src/infrastructure/auth/hash';

describe('Password Hashing', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'SecurePassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^\$2[ayb]\$/); // bcrypt hash format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should handle minimum length password (8 chars)', async () => {
      const password = 'Pass1234';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('WrongPassword456', hash);
      expect(isValid).toBe(false);
    });

    it('should reject empty password', async () => {
      const password = 'SecurePassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'SecurePassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('securepassword123', hash);
      expect(isValid).toBe(false);
    });
  });
});
