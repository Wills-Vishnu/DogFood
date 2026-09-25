import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, CheckCircle, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerDashboardPage = ({ currentUser }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = currentUser || mockUsers.organizer;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await organizerApi.getDashboard('1');
        setDashboard(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <MainLayout currentUser={currentUser}>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Organizer Dashboard</h1>
        <p className="text-lg text-brand-600">Welcome, {user.name}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-brand-900">{dashboard?.participantCount || 0}</p>
                <p className="text-sm text-brand-600 mt-1">Participants</p>
              </div>
              <Users className="w-8 h-8 text-accent-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-brand-900">{dashboard?.teamCount || 0}</p>
                <p className="text-sm text-brand-600 mt-1">Teams</p>
              </div>
              <Users className="w-8 h-8 text-accent-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-brand-900">{dashboard?.submissionCount || 0}</p>
                <p className="text-sm text-brand-600 mt-1">Submissions</p>
              </div>
              <FileText className="w-8 h-8 text-accent-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-brand-900">{dashboard?.judgeCount || 0}</p>
                <p className="text-sm text-brand-600 mt-1">Judges</p>
              </div>
              <BarChart3 className="w-8 h-8 text-accent-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Judging Progress" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-brand-900">Completion</span>
                    <span className="text-sm font-bold text-accent-600">
                      {dashboard?.completedJudging || 0}/{(dashboard?.completedJudging || 0) + (dashboard?.incompleteJudging || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-brand-200 rounded-full h-3">
                    <div
                      className="bg-accent-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${((dashboard?.completedJudging || 0) / ((dashboard?.completedJudging || 0) + (dashboard?.incompleteJudging || 0)) || 0) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-brand-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span>{dashboard?.completedJudging || 0} completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-600" />
                    <span>{dashboard?.incompleteJudging || 0} pending</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader title="Recent Activity" />
            <CardContent>
              {dashboard?.recentActivity?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-brand-200 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent-600 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-brand-900">{activity.message}</p>
                        <p className="text-xs text-brand-600 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-brand-600 py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Event Info" />
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-brand-600 font-medium">Event</p>
                <p className="text-brand-900">{dashboard?.event?.name}</p>
              </div>
              <div className="pt-3 border-t border-brand-200">
                <p className="text-brand-600 font-medium">Status</p>
                <Badge variant={dashboard?.event?.status === 'accepting' ? 'success' : 'warning'}>
                  {dashboard?.event?.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Upcoming Deadlines" />
            <CardContent className="space-y-3">
              {dashboard?.upcomingDeadlines?.map((deadline, idx) => (
                <div key={idx} className="p-3 bg-brand-50 rounded-lg">
                  <p className="text-xs text-brand-600 font-medium uppercase">{deadline.type}</p>
                  <p className="text-sm font-semibold text-brand-900 mt-1">
                    {deadline.deadline?.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent className="space-y-2">
              <Link to="/organizer/submissions">
                <Button variant="secondary" className="w-full text-sm">
                  View Submissions
                </Button>
              </Link>
              <Link to="/organizer/judges">
                <Button variant="secondary" className="w-full text-sm">
                  Manage Judges
                </Button>
              </Link>
              <Link to="/organizer/results">
                <Button variant="secondary" className="w-full text-sm">
                  View Results
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
