
import { genSaltSync, hashSync } from 'bcrypt-ts';

export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}

export function generateDummyPassword() {
  // In AI SDK v5, generateId() takes no arguments and generates a UUID
  // For password generation, we'll use a simple random string instead
  const password = Math.random().toString(36).substring(2, 14);
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}
