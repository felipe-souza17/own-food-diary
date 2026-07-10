import "server-only";

import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function generateShareToken(length = 16): string {
  const bytes = randomBytes(length);
  let token = "";

  for (let i = 0; i < length; i++) {
    token += ALPHABET[(bytes[i] ?? 0) % ALPHABET.length];
  }

  return token;
}
