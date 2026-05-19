const KEY_STORAGE = "aura_rebuild_evidence_key";

function toBase64(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

async function getOrCreateKey(): Promise<CryptoKey> {
  const raw = localStorage.getItem(KEY_STORAGE);
  if (raw) {
    return crypto.subtle.importKey("raw", toArrayBuffer(fromBase64(raw)), "AES-GCM", true, ["encrypt", "decrypt"]);
  }

  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const exported = await crypto.subtle.exportKey("raw", key);
  localStorage.setItem(KEY_STORAGE, toBase64(exported));
  return key;
}

export async function encryptEvidence(buffer: ArrayBuffer): Promise<{ ivB64: string; cipherB64: string }> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, buffer);

  return {
    ivB64: toBase64(iv),
    cipherB64: toBase64(cipher),
  };
}

export async function decryptEvidence(ivB64: string, cipherB64: string): Promise<Uint8Array> {
  const key = await getOrCreateKey();
  const iv = new Uint8Array(toArrayBuffer(fromBase64(ivB64)));
  const cipher = fromBase64(cipherB64);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, toArrayBuffer(cipher));
  return new Uint8Array(plain);
}

