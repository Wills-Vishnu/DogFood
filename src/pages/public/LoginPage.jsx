import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Input } from '../../components/common';
import { useAuth } from '../../auth/AuthContext';
import { roleHome, safeNext } from '../../utils/format';

const SHOW_DEMO_ACCOUNTS = process.env.REACT_APP_DEMO_ACCOUNTS !== 'false';
const DEMO_ACCOUNTS = [
  { label: 'Participant', email: 'riley@dogfood.local', password: 'DogfoodParticipant1!' },
  { label: 'Organizer', email: 'organizer@dogfood.local', password: 'DogfoodOrganizer1!' },
  { label: 'Admin', email: 'admin@dogfood.local', password: 'DogfoodAdmin1!' },
  { label: 'Judge', email: 'judge@dogfood.local', password: 'DogfoodJudge1!' },
];

export const LoginPage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const current = await login(email, password);
      navigate(next || roleHome(current.role));
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-lg py-2xl">
      <div className="w-full max-w-md">
        <div className="card p-2xl">
          <Link to="/" className="block text-center text-2xl font-bold text-accent-600 mb-lg">
            DOGFOOD
          </Link>

          {user ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-brand-900">You're signed in</h2>
              <p className="text-brand-600">
                Signed in as <strong>{user.display_name}</strong> ({user.role}).
              </p>
              <Button variant="primary" className="w-full" onClick={() => navigate(next || roleHome(user.role))}>
                Continue
              </Button>
              <Button variant="secondary" className="w-full" onClick={logout}>
                Sign in as someone else
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-brand-900 mb-md text-center">Welcome Back</h2>
              <p className="text-brand-600 text-center mb-2xl">Login to your DOGFOOD account</p>

              {error && (
                <Alert type="error" title="Login Error" message={error} onClose={() => setError('')} className="mb-lg" />
              )}

              <form onSubmit={handleSubmit} className="space-y-md mb-2xl">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                  Sign In
                </Button>
              </form>

              {SHOW_DEMO_ACCOUNTS && (
                <>
                  <div className="divider mb-lg" />
                  <div className="space-y-sm mb-2xl">
                    <p className="text-xs text-brand-600 font-medium text-center">Demo accounts (seed data)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_ACCOUNTS.map(account => (
                        <button
                          key={account.email}
                          type="button"
                          onClick={() => {
                            setEmail(account.email);
                            setPassword(account.password);
                          }}
                          className="btn btn-secondary w-full text-sm"
                        >
                          {account.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <p className="text-center text-sm text-brand-600">
                Don't have an account?{' '}
                <Link
                  to={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
                  className="text-accent-600 hover:text-accent-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
