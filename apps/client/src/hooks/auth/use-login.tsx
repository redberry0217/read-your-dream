import { useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';

export type OAuthProvider = 'google' | 'kakao';

export function useLogin() {
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuth();

  return async (provider: OAuthProvider) => {
    const res = await fetch(`/api/auth/${provider}`);
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    const data = await res.json() as { success: boolean; token: string; user: unknown };
    setTokenAndUser(data.token);
    navigate('/');
    return data;
  };
}
