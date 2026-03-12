import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production-please";
const SESSION_COOKIE_NAME = "kycscan_session";
const SESSION_MAX_AGE = 86400; // 24 hours

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE };

export function createSessionCookie(walletAddress: string): string {
  const expiry = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${walletAddress.toLowerCase()}:${expiry}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

export function verifySessionCookie(cookie: string): { address: string } | null {
  const parts = cookie.split(":");
  if (parts.length !== 3) return null;
  const [address, expiryStr, hmac] = parts;
  const expiry = Number(expiryStr);
  if (Date.now() > expiry) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(`${address}:${expiryStr}`).digest("hex");
  if (hmac !== expected) return null;
  return { address };
}
