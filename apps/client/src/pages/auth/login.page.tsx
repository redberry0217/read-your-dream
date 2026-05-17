import LogoImage from '@/assets/mjdr_logo.png';
import MjdrImage from '@/assets/mjdr.png';
import { Button } from '@/shared/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { useLogin } from '@/hooks/auth/use-login';

const ERROR_MESSAGES: Record<string, string> = {
  google_failed: 'Google 로그인에 실패했습니다. 다시 시도해 주세요.',
  kakao_failed: '카카오 로그인에 실패했습니다. 다시 시도해 주세요.',
  unknown: '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.',
};

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const login = useLogin();
  const errorKey = searchParams.get('error');
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
      <div className='w-[600px] border border-black rounded-lg p-4 bg-surface-muted flex flex-col items-center justify-center gap-4'>
        <img src={MjdrImage} alt='Mjdr' className='w-[100px] h-auto mt-10' />
        <div className='h-px w-full bg-black' />
        <span>개밤티 로그인ㅌ페이지 ㅠ</span>

        {/* 에러 메시지 */}
        {errorMessage && (
          <span className='text-red-500 text-sm'>{errorMessage}</span>
        )}

        {/* 버튼 */}
        <div className='flex flex-col w-full items-center justify-center gap-2'>
          <Button variant='filled' color='yangrok' className='w-full' onClick={() => login('google')}>
            Google로 로그인
          </Button>
          <Button variant='filled' color='yangrok' className='w-full' onClick={() => login('kakao')}>
            카카오로 로그인
          </Button>
        </div>

        {/* 이용안내 */}
        <span className='text-sm text-center'>
          로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </span>
      </div>
    </div>
  );
}
