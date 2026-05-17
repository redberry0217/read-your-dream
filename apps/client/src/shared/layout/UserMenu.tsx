import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function UserMenu() {
  const { user, logout, setTokenAndUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMockLogin = async () => {
    const res = await fetch(`${API_BASE}/api/auth/mock-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@mjdr.dev', name: '테스트유저' }),
    });
    const data = (await res.json()) as { success: boolean; token: string };
    if (data.success) setTokenAndUser(data.token);
  };

  if (!user) {
    return (
      <div className='flex gap-2'>
        <Button
          variant='filled'
          color='seokganju'
          onClick={() => navigate('/login')}
        >
          로그인
        </Button>
        <Button variant='outline' color='seokganju' onClick={handleMockLogin}>
          목 로그인
        </Button>
      </div>
    );
  }

  return (
    <div ref={ref} className='relative'>
      <Button
        onClick={() => setOpen((v) => !v)}
        variant='outline'
        color='seokganju'
      >
        {/* <span
          aria-hidden
          className='grid h-7 w-7 place-items-center rounded-full bg-podo-100 text-xs font-medium text-podo-700'
        >
          {user.nickname.slice(0, 1)}
        </span> */}
        <span className='text-seokganju-100'>
          {user.name}, 오늘도 좋은 꿈 꾸시오
        </span>
      </Button>

      {open && (
        <div className='absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-stroke-default bg-white shadow-lg'>
          <button
            type='button'
            className='block w-full px-4 py-2 text-left text-sm text-ink-body transition hover:bg-surface-muted'
            onClick={() => setOpen(false)}
          >
            정보수정
          </button>
          <button
            type='button'
            className='block w-full px-4 py-2 text-left text-sm text-ink-body transition hover:bg-surface-muted'
            onClick={() => setOpen(false)}
          >
            나의 꿈자취
          </button>
          <hr className='border-stroke-divider' />
          <button
            type='button'
            className='block w-full px-4 py-2 text-left text-sm text-ink-body transition hover:bg-surface-muted'
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
