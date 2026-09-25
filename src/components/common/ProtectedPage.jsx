import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { MainLayout } from '../../layouts/MainLayout';
import { roleHome } from '../../utils/format';
import { Button } from './Button';
import { EmptyState, LoadingSpinner } from './LoadingState';

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

export const SignInPrompt = ({ next }) => (
  <EmptyState
    icon={Lock}
    title="Sign in to continue"
    description="This page is only available to signed-in members."
    action={
      <div className="flex justify-center gap-3">
        <Link to={`/login?next=${encodeURIComponent(next)}`}>
          <Button variant="primary">Sign in</Button>
        </Link>
        <Link to={`/register?next=${encodeURIComponent(next)}`}>
          <Button variant="secondary">Create account</Button>
        </Link>
      </div>
    }
  />
);

// UX gate only; the API enforces every permission independently.
export const ProtectedPage = ({ roles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <MainLayout>
        <PageSpinner />
      </MainLayout>
    );
  }
  if (!user) {
    return (
      <MainLayout>
        <SignInPrompt next={`${location.pathname}${location.search}`} />
      </MainLayout>
    );
  }
  if (roles && !roles.includes(user.role)) {
    return (
      <MainLayout>
        <EmptyState
          icon={ShieldAlert}
          title="Not available for your account"
          description={`This area is for ${roles.join(' or ')} accounts. You are signed in as ${user.role}.`}
          action={
            <Link to={roleHome(user.role)}>
              <Button variant="primary">Go to my home</Button>
            </Link>
          }
        />
      </MainLayout>
    );
  }
  return children;
};
