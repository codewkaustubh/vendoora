// Authenticated requests share the existing JWT session; no second auth system.
export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('vendoora_token');
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...options, headers });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token === localStorage.getItem('vendoora_token')) {
      localStorage.removeItem('vendoora_token');
      window.dispatchEvent(new Event('vendoora:session-expired'));
    }
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }
  return payload;
}
