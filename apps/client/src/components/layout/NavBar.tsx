import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import LogoImage from '@/assets/mjdr_logo.png';

export function NavBar() {
  return (
    <header className='sticky top-0 z-10 w-full backdrop-blur bg-guncheong-900 border-b border-stroke-strong'>
      <nav className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
        <Link
          to='/'
          className='text-xl font-semibold tracking-tight text-ink-primary'
        >
          <img src={LogoImage} alt='Logo' className='w-30' />
        </Link>
        <div className='flex items-center gap-6 text'>
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
