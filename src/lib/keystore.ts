"use client";

/**
 * Ephemeral, encrypted API key storage.
 *
 * Keys are encrypted with AES-GCM using a per-session key derived from
 * Web Crypto, stored in sessionStorage, and wiped when the tab closes.
 * Nothing touches localStorage, cookies, or the server.
 */

const STORAGE_KEY = "mig_encrypted_keys";
const CRYPTO_KEY_NAME = "mig_session_ck";

export interface ApiKeys {
  openai?: string;
  gemini?: string;
  fal?: string;
}

// ---------- Internal crypto helpers ----------

let _sessionKey: CryptoKey | null = null;

async function getSessionKey(): Promise<CryptoKey> {
  if (_sessionKey) return _sessionKey;

  // Check if we already have a JWK in sessionStorage (same tab reload)
  const stored = sessionStorage.getItem(CRYPTO_KEY_NAME);
  if (stored) {
    _sessionKey = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(stored),
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    return _sessionKey;
  }

  // Generate a fresh key for this session
  _sessionKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // Persist the key material in sessionStorage so it survives soft reloads
  const jwk = await crypto.subtle.exportKey("jwk", _sessionKey);
  sessionStorage.setItem(CRYPTO_KEY_NAME, JSON.stringify(jwk));

  return _sessionKey;
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getSessionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Pack iv + ciphertext into a single base64 string
  const packed = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...packed));
}

async function decrypt(packed64: string): Promise<string> {
  const key = await getSessionKey();
  const packed = Uint8Array.from(atob(packed64), (c) => c.charCodeAt(0));

  const iv = packed.slice(0, 12);
  const ciphertext = packed.slice(12);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plainBuffer);
}

// ---------- Public API ----------

export async function saveKeys(keys: ApiKeys): Promise<void> {
  const json = JSON.stringify(keys);
  const encrypted = await encrypt(json);
  sessionStorage.setItem(STORAGE_KEY, encrypted);
}

export async function loadKeys(): Promise<ApiKeys | null> {
  const encrypted = sessionStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;

  try {
    const json = await decrypt(encrypted);
    return JSON.parse(json) as ApiKeys;
  } catch {
    // Decryption failed (different session key, corrupted data, etc.)
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearKeys(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(CRYPTO_KEY_NAME);
  _sessionKey = null;
}

export function hasStoredKeys(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}
