import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';

export function Layout() {
  return (
    <div className="min-h-screen bg-white text-ink-body">
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
