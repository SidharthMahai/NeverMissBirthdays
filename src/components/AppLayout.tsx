import { Link, Outlet, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AppLayout = ({ theme, onToggleTheme }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="page-shell">
      <header className="site-header">
        <Link to="/" className="brandmark">
          <span className="brand-dot" />
          <span>NeverMissBirthdays</span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          <Link className={location.pathname === '/' ? 'active' : ''} to="/">
            Dashboard
          </Link>
          <Link className={location.pathname === '/about' ? 'active' : ''} to="/about">
            About
          </Link>
        </nav>

        <button type="button" className="ghost" onClick={onToggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};
