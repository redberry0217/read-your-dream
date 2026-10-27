export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : '')
).replace(/\/$/, '');

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    throw new Error('로그인이 필요하거나 인증이 만료되었소.');
  }

  const text = await res.text().catch(() => '');
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // HTML 등 비 JSON 응답 파싱 방어
  }

  if (!res.ok) {
    const errorMsg = json?.error || json?.message || `서버 요청 오류 (HTTP ${res.status}): ${text.slice(0, 80)}`;
    throw new Error(errorMsg);
  }

  return (json ?? {}) as T;
}
