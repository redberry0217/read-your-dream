import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={login}
        className="rounded-md bg-seokganju-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-seokganju-700"
      >
        로그인
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-stroke-default bg-white px-3 py-1.5 text-sm text-ink-body transition hover:bg-surface-muted"
      >
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-full bg-podo-100 text-xs font-medium text-podo-700"
        >
          {user.nickname.slice(0, 1)}
        </span>
        <span>{user.nickname}, 오늘도 좋은 꿈 꾸시오</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-stroke-default bg-white shadow-lg">
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-ink-body transition hover:bg-surface-muted"
            onClick={() => setOpen(false)}
          >
            정보수정
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-ink-body transition hover:bg-surface-muted"
            onClick={() => setOpen(false)}
          >
            나의 꿈자취
          </button>
          <hr className="border-stroke-divider" />
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-ink-body transition hover:bg-surface-muted"
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
