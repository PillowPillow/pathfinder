/**
 * Test helper utilities for cookie handling
 */

/**
 * Extract session token from Set-Cookie header
 */
export function extractSessionToken(setCookieHeader: string[] | undefined): string | null {
  if (!setCookieHeader || setCookieHeader.length === 0) {
    return null;
  }

  // Get the first cookie (session cookie)
  const cookieString = setCookieHeader[0];

  // Extract token value from "session=TOKEN; Path=/; ..."
  const match = cookieString.match(/session=([^;]+)/);

  return match ? match[1] : null;
}

/**
 * Parse cookie header string into an object
 * Handles both single cookie and multiple cookies separated by ';'
 */
export function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  const pairs = cookieHeader.split(';').map(pair => pair.trim());

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      cookies[key] = value;
    }
  }

  return cookies;
}
