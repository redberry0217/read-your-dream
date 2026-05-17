const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login'; // 혹은 queryClient.invalidate + navigate
    throw new Error('Unauthorized');
  }

  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}
