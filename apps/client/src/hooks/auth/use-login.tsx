import { useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';
import { apiFetch } from '@/lib/api';

export type OAuthProvider = 'google' | 'kakao';

export function useLogin() {
  const navigate = useNavigate();
  const { setTokenAndUser } = useAuth();

  return async (provider: OAuthProvider) => {
    const data = await apiFetch<{ success: boolean; token: string; user: unknown }>(`/api/auth/${provider}`);
    setTokenAndUser(data.token);
    navigate('/');
    return data;
  };
}
