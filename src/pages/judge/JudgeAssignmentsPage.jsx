import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, EmptyState, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { judgeApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const JudgeAssignmentsPage = ({ currentUser }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = currentUser || mockUsers.judge1;

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await judgeApi.getAssignments(user.id, '1');
        setAssignments(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
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

  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const pendingCount = assignments.filter(a => a.status === 'pending').length;

  return (
    <MainLayout currentUser={currentUser}>
      <Link to="/judge/dashboard" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Your Assignments</h1>
        <p className="text-lg text-brand-600">
          {completedCount} completed · {pendingCount} pending
        </p>
      </div>

      {error && (
        <EmptyState
          title="Error loading assignments"
          description={error}
        />
      )}

      {!error && assignments.length === 0 && (
        <EmptyState
          title="No assignments"
          description="You don't have any projects assigned yet"
          action={
            <Link to="/judge/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          }
        />
      )}

      {!error && assignments.length > 0 && (
        <div className="max-w-4xl space-y-4">
          {assignments.map(assignment => (
            <Card key={assignment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-brand-900 mb-1">
                      {assignment.submission?.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-brand-600 mb-3">
                      <span>{assignment.submission?.team?.name}</span>
                      <span>•</span>
                      <Badge variant="primary">{assignment.submission?.track}</Badge>
                    </div>
                    <p className="text-sm text-brand-600 line-clamp-2">
                      {assignment.submission?.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    {assignment.status === 'completed' ? (
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-success-600" />
                          <span className="text-sm font-semibold text-success-600">Completed</span>
                        </div>
                        <Link to={`/judge/projects/${assignment.submissionId}`}>
                          <Button variant="secondary" size="sm">
                            View Evaluation
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <Clock className="w-5 h-5 text-accent-600" />
                          <span className="text-sm font-semibold text-accent-600">Pending</span>
                        </div>
                        <Link to={`/judge/projects/${assignment.submissionId}`}>
                          <Button variant="primary" size="sm">
                            Start Judging
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
};
