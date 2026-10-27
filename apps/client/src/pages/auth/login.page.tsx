import LogoImage from '@/assets/mjdr_logo.png';
import MjdrImage from '@/assets/mjdr.png';
import { Button } from '@/shared/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { useLogin } from '@/hooks/auth/use-login';
import { apiFetch } from '@/lib/api';

const ERROR_MESSAGES: Record<string, string> = {
  google_failed: 'Google 로그인에 실패했습니다. 다시 시도해 주세요.',
  kakao_failed: '카카오 로그인에 실패했습니다. 다시 시도해 주세요.',
  unknown: '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.',
};

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const login = useLogin();
  const errorKey = searchParams.get('error');
  const refCode = searchParams.get('ref');
  const errorMessage = errorKey
    ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.unknown)
    : null;

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-podo-700 relative'>
      {/* 상단 */}
      <div className='absolute top-4 left-4'>
        <Link to='/'>
          <img src={LogoImage} alt='Title' className='w-[100px] h-auto' />
        </Link>
      </div>

      {/* 로그인 카드 */}
      <div className='w-[600px] max-w-[90vw] border border-seokganju-800 rounded-xl p-6 bg-ink-deep/95 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center gap-4 text-ink-base'>
        <img src={MjdrImage} alt='Mjdr' className='w-[120px] h-auto mt-4 drop-shadow' />
        <div className='h-px w-full bg-seokganju-900/50 my-1' />
        <span className='font-serif text-lg text-amber-100'>꿈을 풀고 마음의 길을 찾는 도반의 방</span>

        {refCode && (
          <div className='w-full rounded-lg bg-amber-500/10 border border-amber-500/40 p-2 text-center text-xs text-amber-300 font-serif'>
            💌 추천인 코드 <span className='font-mono font-bold text-amber-200'>{refCode}</span> 적용됨! (가입 시 금자 +3냥)
          </div>
        )}

        {/* 에러 메시지 */}
        {errorMessage && (
          <span className='text-red-400 text-sm'>{errorMessage}</span>
        )}

        {/* 버튼 */}
        <div className='flex flex-col w-full items-center justify-center gap-2.5 mt-2'>
          <Button
            variant='filled'
            color='seokganju'
            className='w-full font-bold shadow-md shadow-seokganju-950/60 py-3'
            onClick={async () => {
              try {
                const json = await apiFetch<{ token?: string }>('/api/auth/mock-login', {
                  method: 'POST',
                  body: JSON.stringify({ 
                    email: refCode ? `guest_${Date.now()}@joseon.kr` : 'wanderer@joseon.kr', 
                    name: '꿈꾸는 나그네',
                    referralCode: refCode || undefined
                  })
                });
                if (json.token) {
                  localStorage.setItem('auth_token', json.token);
                  window.location.href = '/';
                }
              } catch (e) {
                console.error(e);
              }
            }}
          >
            ⚡ 1초 체험 로그인 (은자 50냥 + 금자 지급)
          </Button>
          <Button variant='filled' color='yangrok' className='w-full py-2.5' onClick={() => login('google')}>
            Google로 로그인
          </Button>
          <Button variant='filled' color='yangrok' className='w-full py-2.5' onClick={() => login('kakao')}>
            카카오로 로그인
          </Button>
        </div>

        {/* 이용안내 */}
        <span className='text-xs text-center text-zinc-400 mt-2'>
          로그인 시 일일 출석 및 꿈 일기 보상으로 은자가 적립됩니다.
        </span>
      </div>
    </div>
  );
}
