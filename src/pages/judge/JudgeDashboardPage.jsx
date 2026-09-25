import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, EmptyState, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { judgeApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const JudgeDashboardPage = ({ currentUser }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = currentUser || mockUsers.judge1;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await judgeApi.getDashboard(user.id, '1');
        setDashboard(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <MainLayout currentUser={currentUser}>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout currentUser={currentUser}>
        <EmptyState
          icon={AlertCircle}
          title="Error loading dashboard"
          description={error}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Judging Dashboard</h1>
        <p className="text-lg text-brand-600">Welcome, {user.name}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-brand-900 mb-1">{dashboard?.assignedCount || 0}</p>
            <p className="text-sm text-brand-600">Projects Assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-success-600 mb-1">{dashboard?.completedCount || 0}</p>
            <p className="text-sm text-brand-600">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-accent-600 mb-1">{dashboard?.pendingCount || 0}</p>
            <p className="text-sm text-brand-600">Remaining</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader title="Progress" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-brand-900">Completion</span>
                    <span className="text-sm font-bold text-accent-600">{dashboard?.completionPercent || 0}%</span>
                  </div>
                  <div className="w-full bg-brand-200 rounded-full h-3">
                    <div
                      className="bg-accent-600 h-3 rounded-full transition-all"
                      style={{ width: `${dashboard?.completionPercent || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-sm text-brand-600 space-y-1">
                  <p>✓ {dashboard?.completedCount || 0} evaluations submitted</p>
                  <p>○ {dashboard?.pendingCount || 0} evaluations pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Assigned Projects" />
            <CardContent>
              {dashboard?.recentAssignments?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentAssignments.map(assignment => (
                    <Link key={assignment.id} to={`/judge/projects/${assignment.submissionId}`}>
                      <div className="p-4 border border-brand-200 rounded-lg hover:bg-brand-50 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-brand-900">
                              {assignment.submission?.title}
                            </p>
                            <p className="text-sm text-brand-600 mt-1">
                              {assignment.submission?.team?.name}
                            </p>
                          </div>
                          <Badge variant={assignment.status === 'completed' ? 'success' : 'warning'}>
                            {assignment.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-brand-600 py-4">No assignments yet</p>
              )}

              <Link to="/judge/assignments" className="block mt-4">
                <Button variant="primary" className="w-full">
                  View All Assignments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-accent-200 bg-accent-50">
            <CardContent className="pt-6">
              <h3 className="font-bold text-brand-900 mb-3">Continue Judging</h3>
              <p className="text-sm text-brand-600 mb-4">
                {dashboard?.pendingCount || 0} project{dashboard?.pendingCount !== 1 ? 's' : ''} waiting for your evaluation
              </p>
              <Link to="/judge/assignments">
                <Button variant="primary" className="w-full">
                  Start Evaluating
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Event Info" />
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-brand-600 font-medium">Event</p>
                  <p className="text-brand-900">{dashboard?.event?.name}</p>
                </div>
                <div className="pt-3 border-t border-brand-200">
                  <p className="text-brand-600 font-medium">Judging Deadline</p>
                  <p className="text-brand-900">
                    {dashboard?.event?.judgingDeadline?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            <CardContent className="space-y-2">
              <Link to="/judge/assignments" className="block p-3 hover:bg-brand-50 rounded text-brand-900 font-medium">
                → All Assignments
              </Link>
              <Link to="/judge/progress" className="block p-3 hover:bg-brand-50 rounded text-brand-900 font-medium">
                → My Progress
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
