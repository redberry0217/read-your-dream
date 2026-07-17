import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { InterpretResult } from '@/types/dream';
import { Button } from '@/shared/ui';

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = (location.state as { result?: InterpretResult } | null)?.result;

  if (!result) {
    return <Navigate to='/' replace />;
  }

  return (
    <section className='mx-auto max-w-2xl px-6 py-16'>
      <header className='text-center'>
        <p className='text-sm text-ink-tertiary'>꿈자취 풀이</p>
        <h1 className='mt-3 font-heading text-2xl font-bold leading-snug text-seokganju-700'>
          {result.summary}
        </h1>
      </header>

      <div className='mt-10'>
        <h2 className='font-heading text-lg font-semibold text-guncheong-700'>해몽</h2>
        <p className='mt-3 leading-relaxed whitespace-pre-line text-ink-body'>
          {result.analysis}
        </p>
      </div>

      <div className='mt-12'>
        <h2 className='font-heading text-lg font-semibold text-guncheong-700'>
          타로 세 장
        </h2>
        <ul className='mt-4 flex flex-col gap-4'>
          {result.tarotAnalysis.map((card, i) => (
            <li
              key={`${card.card}-${i}`}
              className='rounded-xl border border-stroke-default bg-white p-5'
            >
              <div className='flex items-center justify-between gap-3'>
                <span className='font-heading font-semibold text-ink-primary'>
                  {card.card}
                </span>
                <span className='shrink-0 rounded-full bg-podo-100 px-3 py-1 text-xs text-podo-700'>
                  {card.status}
                </span>
              </div>
              <p className='mt-3 text-sm text-ink-body'>{card.meaning}</p>
              <p className='mt-2 text-sm leading-relaxed text-ink-secondary'>
                {card.advice}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className='mt-12 flex justify-center'>
        <Button variant='filled' color='seokganju' onClick={() => navigate('/')}>
          다시 해몽하기
        </Button>
      </div>
    </section>
  );
}
