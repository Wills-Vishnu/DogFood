import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { initials } from '../../utils/format';
import { Button } from './Button';

const NAV_ITEMS = {
  visitor: [
    { to: '/events', label: 'Events' },
    { to: '/gallery', label: 'Gallery' },
  ],
  participant: [
    { to: '/participant/dashboard', label: 'Dashboard' },
    { to: '/participant/team', label: 'Team' },
    { to: '/participant/submission', label: 'Submission' },
    { to: '/events', label: 'Events' },
    { to: '/gallery', label: 'Gallery' },
  ],
  organizer: [
    { to: '/organizer/events', label: 'My Events' },
    { to: '/organizer/participants', label: 'Participants' },
    { to: '/organizer/teams', label: 'Teams' },
    { to: '/organizer/submissions', label: 'Submissions' },
    { to: '/gallery', label: 'Gallery' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/organizer/events', label: 'Events' },
    { to: '/gallery', label: 'Gallery' },
  ],
  judge: [
    { to: '/judge/dashboard', label: 'Dashboard' },
    { to: '/events', label: 'Events' },
    { to: '/gallery', label: 'Gallery' },
  ],
};

const isActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

export const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const items = NAV_ITEMS[user?.role] || NAV_ITEMS.visitor;

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-brand-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-lg py-md flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-accent-600">
          DOGFOOD
        </Link>

        <nav className="hidden md:flex items-center gap-lg">
          {items.map(item => (
            <NavLink key={item.to} to={item.to} label={item.label} active={isActive(location.pathname, item.to)} />
          ))}
        </nav>

        <div className="flex items-center gap-md">
          {user ? (
            <div className="hidden md:flex items-center gap-md">
              <Link to="/participant/profile" className="flex items-center gap-sm" title="Profile">
                <span className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold flex items-center justify-center">
                  {initials(user.display_name)}
                </span>
                <span className="text-sm text-brand-700">
                  {user.display_name}
                  <span className="block text-xs text-brand-500 capitalize">{user.role}</span>
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-sm">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-brand-700 p-sm"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-brand-200 bg-brand-50 px-lg py-md space-y-sm">
          {items.map(item => (
            <MobileNavLink key={item.to} to={item.to} label={item.label} onClick={() => setIsMenuOpen(false)} />
          ))}
          {user ? (
            <>
              <MobileNavLink to="/participant/profile" label="Profile" icon={User} onClick={() => setIsMenuOpen(false)} />
              <button
                onClick={handleLogout}
                className="w-full text-left px-md py-sm text-danger-600 hover:bg-brand-100 rounded"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <MobileNavLink to="/login" label="Login" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink to="/register" label="Sign Up" onClick={() => setIsMenuOpen(false)} />
            </>
          )}
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, label, active }) => (
  <Link
    to={to}
    className={`px-md py-sm rounded transition-colors ${
      active ? 'text-accent-600 font-medium' : 'text-brand-700 hover:text-accent-600'
    }`}
  >
    {label}
  </Link>
);

const MobileNavLink = ({ to, label, icon: Icon, onClick }) => (
  <Link to={to} onClick={onClick} className="block px-md py-sm text-brand-700 hover:bg-brand-100 rounded">
    {Icon && <Icon className="w-4 h-4 inline mr-2" />}
    {label}
  </Link>
);

export const Sidebar = ({ items, currentPath }) => (
  <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-200">
    <nav className="flex-1 px-md py-lg space-y-sm">
      {items.map(item => (
        <SidebarItem key={item.path} {...item} active={currentPath === item.path} />
      ))}
    </nav>
  </aside>
);

const SidebarItem = ({ label, path, icon: Icon, active, badge }) => (
  <Link
    to={path}
    className={`flex items-center justify-between px-md py-md rounded-lg transition-colors ${
      active
        ? 'bg-accent-50 text-accent-700 font-medium'
        : 'text-brand-700 hover:bg-brand-100'
    }`}
  >
    <div className="flex items-center gap-md">
      {Icon && <Icon className="w-5 h-5" />}
      <span>{label}</span>
    </div>
    {badge && (
      <span className="inline-flex items-center px-sm py-xs text-xs font-semibold bg-accent-600 text-white rounded-full">
        {badge}
      </span>
    )}
  </Link>
);
