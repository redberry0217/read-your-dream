import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export function NavBar() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-stroke-divider bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight text-ink-primary">
          몽중다로
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/garden"
            className="text-sm text-ink-secondary transition hover:text-ink-primary"
          >
            몽다정원
          </Link>
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
