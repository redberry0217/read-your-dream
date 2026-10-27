import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isLoggedIn, user, token, logout, refreshUser } = useAuth();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const showTempMsg = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleQuickLogin = async () => {
    try {
      const json = await apiFetch<{ token?: string }>('/api/auth/mock-login', {
        method: 'POST',
        body: JSON.stringify({ email: 'wanderer@joseon.kr', name: '꿈꾸는 나그네' })
      });
      if (json.token) {
        localStorage.setItem('auth_token', json.token);
        window.location.reload();
      }
    } catch (e: any) {
      console.error(e);
      navigate('/login');
    }
  };

  const handleAttendance = async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ message: string }>('/api/user/attendance', {
        method: 'POST',
      });
      showTempMsg(data.message || '출석 완료! 은자 20냥 획득');
      await refreshUser();
    } catch (e: any) {
      showTempMsg(e.message || '출석 처리에 실패하였소.');
    }
  };

  const handleExchange = async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ message: string }>('/api/user/exchange', {
        method: 'POST',
      });
      showTempMsg(data.message || '금자 1냥으로 환전 완료!');
      await refreshUser();
    } catch (e: any) {
      showTempMsg(e.message || '환전에 실패하였소.');
    }
  };

  const handleCopyReferral = () => {
    const code = user?.referralCode || 'MJDREAM';
    const link = `${window.location.origin}/login?ref=${code}`;
    navigator.clipboard.writeText(link);
    showTempMsg(`초대 링크 복사 완료! (친구 가입 시 서로 금자 3냥)`);
  };

  const handleShare = async () => {
    if (!token) return;
    try {
      await apiFetch('/api/user/share', { method: 'POST' });
      navigator.clipboard.writeText(window.location.origin);
      showTempMsg('공유 보상으로 은자 10냥을 얻었소! 링크 복사됨.');
      await refreshUser();
    } catch (e: any) {
      showTempMsg(e.message || '공유 처리에 실패하였소.');
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className='flex items-center gap-2'>
        <Button
          variant='filled'
          color='yangrok'
          size='sm'
          className='text-xs font-semibold px-3 py-1.5'
          onClick={handleQuickLogin}
        >
          간편 로그인
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
        className='border-seokganju-700/60 bg-ink-background/70 backdrop-blur-sm hover:border-seokganju-500'
      >
        <span className='flex items-center gap-2 text-xs sm:text-sm font-medium'>
          <span className='text-amber-100 font-serif'>{user.name}</span>
          <span className='px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-200 font-mono text-[11px] sm:text-xs border border-slate-300/30'>
            은자 {user.silver ?? 50}냥
          </span>
          <span className='px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] sm:text-xs border border-amber-500/40'>
            금자 {user.gold ?? 1}냥
          </span>
        </span>
      </Button>

      {open && (
        <div className='absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-seokganju-800/60 bg-ink-deep/95 backdrop-blur-md shadow-2xl z-50 p-3 text-ink-base'>
          {/* 유저 지갑 현황 카드 */}
          <div className='rounded-lg bg-ink-surface/80 p-3 border border-seokganju-900/40 mb-3'>
            <div className='flex items-center justify-between text-xs text-amber-200/80 mb-2'>
              <span className='font-serif'>{user.name}의 곳간</span>
              {user.referralCode && (
                <span className='font-mono text-[10px] text-zinc-400'>초대코드: {user.referralCode}</span>
              )}
            </div>
            <div className='grid grid-cols-2 gap-2 text-center'>
              <div className='rounded bg-black/40 p-2 border border-slate-400/20'>
                <div className='text-[11px] text-slate-400'>은자 (활동·출석)</div>
                <div className='text-base font-bold text-slate-100 font-mono'>{user.silver ?? 50}냥</div>
              </div>
              <div className='rounded bg-black/40 p-2 border border-amber-500/30'>
                <div className='text-[11px] text-amber-400/80'>금자 (심층처방)</div>
                <div className='text-base font-bold text-amber-300 font-mono'>{user.gold ?? 1}냥</div>
              </div>
            </div>
          </div>

          {/* 알림 메시지 */}
          {actionMsg && (
            <div className='mb-2 rounded bg-yangrok-950/80 border border-yangrok-500/50 p-2 text-center text-xs text-yangrok-300 animate-fade-in'>
              {actionMsg}
            </div>
          )}

          {/* 혜택 및 활동 버튼 목록 */}
          <div className='space-y-1.5 text-xs'>
            <button
              type='button'
              className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-ink-surface/60 hover:bg-yangrok-950/50 hover:text-yangrok-200 border border-transparent hover:border-yangrok-700/50 transition'
              onClick={handleAttendance}
            >
              <span>📅 매일 출석하기</span>
              <span className='text-yangrok-400 font-mono font-semibold'>+20 은자</span>
            </button>

            <button
              type='button'
              className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-ink-surface/60 hover:bg-amber-950/50 hover:text-amber-200 border border-transparent hover:border-amber-700/50 transition'
              onClick={handleExchange}
            >
              <span>🔄 100 은자 ➡️ 1 금자 환전</span>
              <span className='text-amber-400 font-mono font-semibold'>1 금자</span>
            </button>

            <button
              type='button'
              className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-ink-surface/60 hover:bg-amber-950/50 hover:text-amber-200 border border-transparent hover:border-amber-700/50 transition'
              onClick={handleCopyReferral}
            >
              <span>💌 친구 초대 링크 복사</span>
              <span className='text-amber-400 font-mono font-semibold'>서로 +3 금자</span>
            </button>

            <button
              type='button'
              className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-ink-surface/60 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition'
              onClick={handleShare}
            >
              <span>🔗 도반에게 소식 공유</span>
              <span className='text-slate-300 font-mono font-semibold'>+10 은자</span>
            </button>
          </div>

          <hr className='border-seokganju-900/60 my-2.5' />

          <button
            type='button'
            className='block w-full px-3 py-1.5 text-left text-xs text-zinc-400 hover:text-zinc-100 hover:bg-ink-surface/60 rounded transition'
            onClick={() => {
              navigate('/history');
              setOpen(false);
            }}
          >
            📜 나의 꿈자취 (해몽 기록)
          </button>
          <button
            type='button'
            className='block w-full px-3 py-1.5 text-left text-xs text-seokganju-400 hover:text-seokganju-200 hover:bg-ink-surface/60 rounded transition'
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            🚪 로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
