// Internal domain suffix for non-email identifiers
const INTERNAL_DOMAIN = "@admin.internal";

/**
 * Check if a string is a valid email format
 */
export function isEmail(identifier: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(identifier);
}

/**
 * Normalize an identifier for Supabase authentication
 * If it's already an email, return as-is
 * If it's a username, append internal domain suffix
 */
export function normalizeIdentifier(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase();
  
  if (isEmail(trimmed)) {
    return trimmed;
  }
  
  // Convert username to internal email format
  return `${trimmed}${INTERNAL_DOMAIN}`;
}

/**
 * Extract the display name/username from an identifier
 * If it's an internal email, extract the username part
 * If it's a real email, return as-is
 */
export function extractDisplayIdentifier(email: string): string {
  if (email.endsWith(INTERNAL_DOMAIN)) {
    return email.replace(INTERNAL_DOMAIN, "");
  }
  return email;
}

/**
 * Check if an email is an internal admin email
 */
export function isInternalEmail(email: string): boolean {
  return email.endsWith(INTERNAL_DOMAIN);
}
