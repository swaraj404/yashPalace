// Cloudflare's free plan allows about 10 ms of CPU per request, too little for
// a slow password hash. So the slow step (PBKDF2) runs on the owner's device,
// and the server stores only a salted SHA-256 of the result. A stolen database
// still has to be attacked through the slow step, one guess at a time.
export const MIN_PASSWORD_LENGTH = 10;
const ITERATIONS = 600_000;
const encoder = new TextEncoder();

const toBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

export const normalizeUsername = (username) => username.trim().toLowerCase();
export const isLoginKey = (value) =>
  typeof value === 'string' && /^[A-Za-z0-9+/]{43}=$/.test(value);

export async function deriveLoginKey(username, password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure sign-in needs an https:// address.');
  }
  const material = await crypto.subtle.importKey(
    'raw', encoder.encode(password.normalize('NFKC')), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: ITERATIONS,
      salt: encoder.encode(`yash-palace-owner-v1:${normalizeUsername(username)}`),
    },
    material,
    256
  );
  return toBase64(bits);
}

async function digest(salt, loginKey) {
  const key = encoder.encode(loginKey);
  const joined = new Uint8Array(salt.length + key.length);
  joined.set(salt);
  joined.set(key, salt.length);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', joined));
}

export async function createVerifier(loginKey) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `sha256$${toBase64(salt)}$${toBase64(await digest(salt, loginKey))}`;
}

export async function checkLoginKey(loginKey, verifier) {
  const [scheme, salt, expected] = verifier.split('$');
  if (scheme !== 'sha256') return false;
  const actual = await digest(fromBase64(salt), loginKey);
  const wanted = fromBase64(expected);
  let difference = actual.length ^ wanted.length;
  for (let i = 0; i < actual.length; i += 1) difference |= actual[i] ^ wanted[i];
  return difference === 0;
}
