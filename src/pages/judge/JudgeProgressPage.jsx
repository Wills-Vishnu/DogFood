import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, EmptyState, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { judgeApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const JudgeProgressPage = ({ currentUser }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = currentUser || mockUsers.judge1;

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await judgeApi.getProgress(user.id, '1');
        setProgress(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
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

  return (
    <MainLayout currentUser={currentUser}>
      <Link to="/judge/dashboard" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Judging Progress</h1>
        <p className="text-lg text-brand-600">Track your evaluation status</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-brand-900 mb-1">{progress?.assignedCount || 0}</p>
            <p className="text-sm text-brand-600">Total Assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-success-600 mb-1">{progress?.completedCount || 0}</p>
            <p className="text-sm text-brand-600">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-accent-600 mb-1">{progress?.pendingCount || 0}</p>
            <p className="text-sm text-brand-600">Pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader title="Overall Progress" />
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-brand-900">Completion Status</span>
                    <span className="text-lg font-bold text-accent-600">{progress?.completionPercent || 0}%</span>
                  </div>
                  <div className="w-full bg-brand-200 rounded-full h-4">
                    <div
                      className="bg-accent-600 h-4 rounded-full transition-all"
                      style={{ width: `${progress?.completionPercent || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-200">
                  <h3 className="font-semibold text-brand-900 mb-3">Status Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-brand-600">{progress?.completedCount || 0} evaluations completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-600" />
                      <span className="text-brand-600">{progress?.pendingCount || 0} evaluations pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Assignments" />
            <CardContent>
              {progress?.assignments?.length > 0 ? (
                <div className="space-y-3">
                  {progress.assignments.map(assignment => (
                    <Link key={assignment.id} to={`/judge/projects/${assignment.submissionId}`}>
                      <div className="flex items-center justify-between p-4 border border-brand-200 rounded-lg hover:bg-brand-50 transition">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand-900 truncate">
                            {assignment.submission?.title}
                          </p>
                          <p className="text-sm text-brand-600">
                            {assignment.submission?.team?.name}
                          </p>
                        </div>

                        <div className="flex-shrink-0 ml-4">
                          {assignment.status === 'completed' ? (
                            <Badge variant="success">Completed</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-brand-600 py-4">No assignments</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Next Steps" />
            <CardContent className="space-y-3">
              {progress?.pendingCount > 0 ? (
                <>
                  <p className="text-sm text-brand-600 mb-4">
                    You have {progress.pendingCount} evaluation{progress.pendingCount !== 1 ? 's' : ''} remaining.
                  </p>
                  <Link to="/judge/assignments">
                    <Button variant="primary" className="w-full">
                      Continue Judging
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-brand-900">All evaluations complete!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Time Allocation" />
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-brand-600 font-medium mb-1">Avg. time per evaluation</p>
                  <p className="text-lg font-bold text-brand-900">~10 mins</p>
                </div>
                <div className="pt-3 border-t border-brand-200">
                  <p className="text-brand-600 font-medium mb-1">Estimated time remaining</p>
                  <p className="text-lg font-bold text-accent-600">
                    ~{(progress?.pendingCount || 0) * 10} mins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
