import { NextRequest } from 'next/server';

/**
 * Checks for a valid admin API key in the Authorization header.
 * This provides basic protection for the admin API endpoints.
 * @param request The incoming NextRequest.
 * @returns True if the key is valid, false otherwise.
 */
export function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const apiKey = process.env.ADMIN_API_KEY;

  if (!apiKey) {
    // Fail safely if the API key is not configured on the server.
    console.error('CRITICAL: ADMIN_API_KEY is not set. Admin API is unprotected.');
    return false;
  }

  // Check for 'Bearer <key>' format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const providedKey = authHeader.split(' ')[1];
  return providedKey === apiKey;
}