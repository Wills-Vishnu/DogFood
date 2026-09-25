import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, FileText, Activity } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { MainLayout } from '../../layouts/MainLayout';
import { adminApi } from '../../api/endpoints';

export const AdminDashboardPage = () => (
  <ProtectedPage roles={['admin']}>
    <AdminDashboard />
  </ProtectedPage>
);

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    adminApi.overview().then(setOverview).catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-brand-600">System overview and management</p>
      </div>

      {error ? (
        <ErrorState title="Couldn't load the overview" message={error} onRetry={load} />
      ) : !overview ? (
        <PageSpinner />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} value={overview.user_count} label="Users" />
            <StatCard icon={Calendar} value={`${overview.published_event_count}/${overview.event_count}`} label="Published events" />
            <StatCard icon={Activity} value={overview.active_event_count} label="Events open for submissions" />
            <StatCard icon={FileText} value={`${overview.submitted_count}/${overview.submission_count}`} label="Submitted projects" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader title="Users by role" />
              <CardContent>
                <div className="grid sm:grid-cols-4 gap-4">
                  {Object.entries(overview.users_by_role).map(([role, count]) => (
                    <div key={role} className="p-4 bg-brand-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-brand-900">{count}</p>
                      <p className="text-sm text-brand-600 capitalize">{role}s</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-brand-600 mt-4">{overview.team_count} teams across all events.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Manage" />
              <CardContent className="space-y-2">
                <Link to="/admin/users" className="block">
                  <Button variant="secondary" className="w-full">
                    Users & Roles
                  </Button>
                </Link>
                <Link to="/admin/events" className="block">
                  <Button variant="secondary" className="w-full">
                    All Events
                  </Button>
                </Link>
                <Link to="/organizer/events/new" className="block">
                  <Button variant="primary" className="w-full">
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </MainLayout>
  );
};

const StatCard = ({ icon: Icon, value, label }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-brand-900">{value}</p>
          <p className="text-sm text-brand-600 mt-1">{label}</p>
        </div>
        <Icon className="w-8 h-8 text-accent-300" />
      </div>
    </CardContent>
  </Card>
);
