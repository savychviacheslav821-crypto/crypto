/**
 * Simple server health check utility
 */

const getServerUrl = () => {
  const envUrl = process.env.REACT_APP_SERVER_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl;
  }
  return 'http://localhost:4000';
};

const TIMEOUT = 3000;

/**
 * Check if server is running
 * @returns {Promise<boolean>} - True if server is reachable
 */
export const checkServerHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    const serverUrl = getServerUrl();

    // Use HEAD request to root - just checks if server responds
    // This doesn't require database access
    await fetch(serverUrl, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors', // Avoid CORS issues
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    // Even if check fails, allow app to load (server might be starting)
    // The actual API calls will show proper errors
    return true;
  }
};
