import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import LogoImage from '@/assets/mjdr_logo.png';

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMain = pathname === '/';

  const goToInput = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMain) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const goToStory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMain) {
      document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#story');
    }
  };

  return (
    <header className='sticky top-0 z-10 w-full backdrop-blur bg-podo-900 border-b border-black'>
      <nav className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
        <a
          href='/'
          onClick={goToInput}
          className='text-xl font-semibold tracking-tight text-ink-primary'
        >
          <img src={LogoImage} alt='Logo' className='w-30' />
        </a>
        <div className='flex items-center gap-6 text'>
          <a
            href='#story'
            onClick={goToStory}
            className='text-sm text-seokganju-100 transition hover:text-yangrok-100'
          >
            서비스 소개
          </a>
          <Link
            to='/garden'
            className='text-sm text-seokganju-100 transition hover:text-yangrok-100'
          >
            몽다정원
          </Link>
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
