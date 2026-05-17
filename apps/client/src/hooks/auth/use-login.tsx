export type OAuthProvider = 'google' | 'kakao';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useLogin() {
  return (provider: OAuthProvider) => {
    window.location.href = `${API_BASE}/api/auth/${provider}`;
  };
}
