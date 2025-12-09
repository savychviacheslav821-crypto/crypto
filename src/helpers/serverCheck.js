/**
 * Simple server health check utility
 * Checks if server is running by attempting a TCP connection
 * No API calls - just connection check
 * 
 * Usage in any project:
 * 1. Set REACT_APP_SERVER_URL in .env
 * 2. Import and call checkServerHealth() before rendering app
 */

const DEFAULT_SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';
const TIMEOUT = 3000; // 3 seconds

/**
 * Check if server is running
 * @param {string} serverUrl - Optional server URL (defaults to env variable)
 * @returns {Promise<boolean>} - True if server is reachable
 */
export const checkServerHealth = async (serverUrl = DEFAULT_SERVER_URL) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    // Simple HEAD request - just checks if server responds
    const response = await fetch(serverUrl, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // Allows connection check without CORS
    });

    clearTimeout(timeoutId);
    return true; // Server is reachable
  } catch (error) {
    console.error('Server health check failed:', error.message);
    return false;
  }
};
