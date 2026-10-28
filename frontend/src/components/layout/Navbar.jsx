import { LogIn, LogOut, Menu, Sparkles, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import SearchBar from '../movies/SearchBar.jsx';
import Logo from './Logo.jsx';

const LINKS = [
  { to: '/explore', label: 'Explore' },
  { to: '/recommendations', label: 'For You' },
  { to: '/graph', label: 'Graph' },
  { to: '/analytics', label: 'Insights' },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-white/[0.07] text-white' : 'text-slate-400 hover:text-white'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.info('You have been signed out.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden w-full max-w-xs lg:block">
          <SearchBar />
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex lg:ml-0">
          {user ? (
            <>
              <Link to="/profile" className="btn-ghost px-3" title="Your profile">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 text-xs font-bold text-accent-soft">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[8rem] truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button type="button" className="btn-ghost px-2.5" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in
              </Link>
              <Link to="/register" className="btn-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Join
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="btn-ghost ml-auto px-2.5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-white/[0.06] bg-ink-900 md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            <SearchBar />
            <nav className="mt-2 flex flex-col gap-1" aria-label="Mobile">
              {LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-2 flex gap-2 border-t border-white/[0.06] pt-3">
              {user ? (
                <>
                  <Link to="/profile" className="btn-secondary flex-1">
                    <User className="h-4 w-4" aria-hidden="true" /> Profile
                  </Link>
                  <button type="button" className="btn-secondary flex-1" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1">Sign in</Link>
                  <Link to="/register" className="btn-primary flex-1">Create account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
