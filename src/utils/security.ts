/**
 * Security Utility Functions for Input Sanitization, XSS Prevention, Cryptographic Hashing, and Rate Limiting
 */

/**
 * Strips HTML tags and escapes dangerous characters to prevent XSS without corrupting slashes in text/URLs.
 */
export function sanitizeText(input: string | null | undefined, maxLength = 1000): string {
  if (!input) return "";
  const trimmed = String(input).trim().slice(0, maxLength);
  return trimmed
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Decodes HTML entities safely for plain display or URL rendering.
 */
export function decodeSanitizedText(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

/**
 * Formats and sanitizes external URLs to ensure clean https:// protocols without HTML entity corruption.
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input) return "";
  let clean = decodeSanitizedText(String(input).trim());
  clean = clean.replace(/&#x2F;/g, "/").replace(/&amp;/g, "&");
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  return `https://${clean}`;
}

/**
 * Validates student submission inputs against length and pattern constraints.
 */
export function validateStudentInput(data: {
  studentName?: string;
  division?: string;
  rollNo?: string;
}): { valid: boolean; error?: string } {
  if (!data.studentName || !data.studentName.trim()) {
    return { valid: false, error: "Student name is required." };
  }
  if (data.studentName.trim().length > 100) {
    return { valid: false, error: "Student name exceeds maximum allowed length (100 characters)." };
  }

  if (!data.rollNo || !data.rollNo.trim()) {
    return { valid: false, error: "Roll number is required." };
  }
  if (data.rollNo.trim().length > 30) {
    return { valid: false, error: "Roll number exceeds maximum allowed length (30 characters)." };
  }

  if (data.division && data.division.trim().length > 20) {
    return { valid: false, error: "Division exceeds maximum allowed length (20 characters)." };
  }

  return { valid: true };
}

/**
 * Cryptographic SHA-256 Password Hashing with static salt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = "compesa_sec_salt_v1_99";
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Timing-safe constant-time string comparison to prevent timing attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Anti-Brute Force Rate Limiter
 */
const LOGIN_ATTEMPTS_KEY = "compesa_login_attempts_v1";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 Minutes Lockout

export function checkLoginRateLimit(): { allowed: boolean; waitSeconds?: number } {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!raw) return { allowed: true };
    const data = JSON.parse(raw);
    if (data.attempts >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - data.lastAttempt;
      if (elapsed < LOCKOUT_MS) {
        const remaining = Math.ceil((LOCKOUT_MS - elapsed) / 1000);
        return { allowed: false, waitSeconds: remaining };
      }
      localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    }
  } catch {}
  return { allowed: true };
}

export function recordFailedLoginAttempt() {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    const data = raw ? JSON.parse(raw) : { attempts: 0, lastAttempt: Date.now() };
    data.attempts += 1;
    data.lastAttempt = Date.now();
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(data));
  } catch {}
}

export function resetLoginRateLimit() {
  try {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  } catch {}
}
