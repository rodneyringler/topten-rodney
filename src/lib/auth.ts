import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// Password requirements: at least 8 characters, 1 uppercase, 1 number, 1 special character
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const PASSWORD_REQUIREMENTS =
  'Password must be at least 8 characters with at least 1 capital letter, 1 number, and 1 special character';

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 capital letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 special character' };
  }
  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function generateUniqueSlug(title: string): string {
  const baseSlug = slugify(title);
  const uniqueSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${uniqueSuffix}`;
}

/**
 * Generate a unique username from Google account info (name or email)
 * Falls back to email prefix if name is not available
 */
export function generateUsernameFromGoogle(name: string | null | undefined, email: string): string {
  let baseUsername = '';
  
  if (name) {
    baseUsername = slugify(name);
  } else {
    // Extract username from email (part before @)
    baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
  }
  
  // Ensure minimum length
  if (baseUsername.length < 3) {
    baseUsername = baseUsername.padEnd(3, '0');
  }
  
  // Truncate to max 30 characters (matching username validation)
  if (baseUsername.length > 30) {
    baseUsername = baseUsername.substring(0, 30);
  }
  
  return baseUsername;
}

/**
 * Generate a unique username by appending a random suffix if needed
 */
export function generateUniqueUsername(baseUsername: string): string {
  const uniqueSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseUsername}-${uniqueSuffix}`;
}
