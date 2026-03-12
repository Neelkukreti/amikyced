// Attach to globalThis so the Map survives Next.js HMR module re-evaluation in dev
const g = globalThis as typeof globalThis & { __kycscan_nonces?: Map<string, number> };
if (!g.__kycscan_nonces) {
  g.__kycscan_nonces = new Map<string, number>();
  // Clean expired nonces every 60s (only register interval once)
  setInterval(() => {
    const now = Date.now();
    for (const [nonce, created] of g.__kycscan_nonces!) {
      if (now - created > 5 * 60 * 1000) g.__kycscan_nonces!.delete(nonce);
    }
  }, 60000);
}
const nonces = g.__kycscan_nonces;

export function createNonce(): string {
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  nonces.set(nonce, Date.now());
  return nonce;
}

export function consumeNonce(nonce: string): boolean {
  if (!nonces.has(nonce)) return false;
  const created = nonces.get(nonce)!;
  nonces.delete(nonce);
  return Date.now() - created < 5 * 60 * 1000;
}
