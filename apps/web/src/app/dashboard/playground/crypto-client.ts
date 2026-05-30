export interface EncryptedEnvelope {
  encryptedApiKey: string;
  iv: string;
  keyToken: string;
}

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function encryptApiKeyClient(plainApiKey: string): Promise<EncryptedEnvelope> {
  const handshakeRes = await fetch("/api/playground/crypto/key");
  if (!handshakeRes.ok) {
    throw new Error("Handshake key exchange failed.");
  }
  const { rawKey, keyToken } = await handshakeRes.json();

  const rawKeyBuffer = Uint8Array.from(window.atob(rawKey), (c) => c.charCodeAt(0));

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    rawKeyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    encoder.encode(plainApiKey)
  );

  const encryptedApiKeyBase64 = arrayBufferToBase64(encryptedBuffer);
  const ivBase64 = arrayBufferToBase64(iv);

  return {
    encryptedApiKey: encryptedApiKeyBase64,
    iv: ivBase64,
    keyToken,
  };
}
