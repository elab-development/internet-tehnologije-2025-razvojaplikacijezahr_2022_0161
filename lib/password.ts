import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const SCHEME = "scrypt";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = await derive(password, salt);
  return `${SCHEME}:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== SCHEME || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const derived = await derive(password, salt);
  if (expected.length !== derived.length) return false;

  // poređenje konstantnog trajanja – ne otkriva koliko se karaktera poklopilo
  return timingSafeEqual(expected, derived);
}

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}
