import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  StatusBadge,
} from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { mockEvents, mockJudgeAssignments, mockSubmissions } from '../../mocks/data';

export const JudgeDashboard = ({ currentUser, onLogout }) => {
  const event = mockEvents[0];
  const assignment = mockJudgeAssignments.find(a => a.judgeId === currentUser.id);

  const assignedSubmissions = assignment
    ? mockSubmissions.filter(s => assignment.assignedSubmissions.includes(s.id))
    : [];

  const pendingReviews = assignedSubmissions.filter(
    s => !assignment?.assignedSubmissions.some(id => s.id === id && assignment.submissionsReviewed >= 1)
  );

  return (
    <MainLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Header */}
      <div className="mb-2xl">
        <h1 className="text-3xl font-bold text-brand-900 mb-md">
          Judging Dashboard
        </h1>
        <p className="text-brand-600">
          {event.name} • Review and score submissions
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-lg mb-2xl">
        <StatCard
          icon={CheckCircle}
          label="Reviewed"
          value={assignment?.submissionsReviewed || 0}
          color="success"
        />
        <StatCard
          icon={Clock}
          label="Remaining"
          value={pendingReviews.length}
          color="warning"
        />
        <StatCard
          icon={Star}
          label="Average Score"
          value="8.2/10"
          color="accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion"
          value={`${assignment ? Math.round((assignment.submissionsReviewed / assignment.submissionsTotal) * 100) : 0}%`}
          color="accent"
        />
      </div>

      {/* Assignments */}
      <Card className="mb-2xl">
        <CardHeader
          title="Your Assignments"
          subtitle={`You have ${pendingReviews.length} project${pendingReviews.length !== 1 ? 's' : ''} to review`}
        />
        <CardContent>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-2xl">
              {assignment?.submissionsReviewed === assignment?.submissionsTotal ? (
                <div className="space-y-md">
                  <CheckCircle className="w-12 h-12 text-success-600 mx-auto" />
                  <div>
                    <p className="text-brand-900 font-semibold mb-sm">
                      All reviews completed!
                    </p>
                    <p className="text-brand-600 text-sm">
                      Thank you for your thorough evaluation.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-brand-600">No pending reviews</p>
              )}
            </div>
          ) : (
            <div className="space-y-lg">
              {pendingReviews.map(submission => (
                <ReviewCard
                  key={submission.id}
                  submission={submission}
                  reviewed={assignment?.submissionsReviewed || 0}
                  total={assignment?.submissionsTotal || 0}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Reviewed */}
      {assignedSubmissions.filter(s =>
        assignment?.assignedSubmissions.includes(s.id)
      ).length > 0 && (
        <Card>
          <CardHeader title="Recently Reviewed" />
          <CardContent>
            <div className="space-y-md">
              {assignedSubmissions
                .filter(s => s.scores.length > 0)
                .slice(0, 3)
                .map(submission => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-md bg-brand-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-brand-900">
                        {submission.title}
                      </p>
                      <p className="text-sm text-brand-600">
                        {submission.team.name}
                      </p>
                    </div>
                    <StatusBadge status="completed" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
  };

  return (
    <Card>
      <CardContent className="pt-lg pb-lg">
        <div className="flex items-center gap-md">
          <div className={`p-md rounded-lg ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-brand-600 font-medium">{label}</p>
            <p className="text-2xl font-bold text-brand-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReviewCard = ({ submission, reviewed, total }) => (
  <Link to={`/judge/review/${submission.id}`}>
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="py-lg flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-brand-900 mb-sm">
            {submission.title}
          </h4>
          <p className="text-sm text-brand-600">
            {submission.team.name} • {submission.track}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-600 font-medium mb-sm">
            Review {reviewed + 1} of {total}
          </p>
          <Button variant="primary" size="sm">
            Review Now
          </Button>
        </div>
      </CardContent>
    </Card>
  </Link>
);
