import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/use-auth';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { setTokenAndUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      setTokenAndUser(token);
      navigate('/', { replace: true });
    } else {
      navigate(`/login?error=${error ?? 'unknown'}`, { replace: true });
    }
  }, [searchParams, setTokenAndUser, navigate]);

  return (
    <div className='flex items-center justify-center h-screen'>
      <span>로그인 처리 중...</span>
    </div>
  );
}
