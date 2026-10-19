/**
 * Centralized API configuration for Kaushal Kumar Portfolio
 * 
 * In local development:
 *   Falls back to relative path ('') which is proxied by Vite dev server.
 * In production on Vercel:
 *   If VITE_API_URL is configured (e.g. 'https://your-backend.onrender.com'),
 *   it prepends that origin. Otherwise, it uses relative path ('') which works
 *   seamlessly with Vercel rewrites.
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = RAW_API_URL ? RAW_API_URL.replace(/\/+$/, '') : '';

export const apiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${clean}`;
};

export default apiUrl;
