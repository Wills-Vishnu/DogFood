import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  Edit,
  Share2,
  Settings,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Badge,
  StatusBadge,
} from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { mockEvents, mockTeams, mockSubmissions } from '../../mocks/data';

export const ParticipantDashboard = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const event = mockEvents[0];
  const userTeam = mockTeams[0]; // Simplified for demo
  const userSubmission = mockSubmissions[0]; // Simplified for demo

  const eventEndsIn = Math.ceil(
    (event.submissionDeadline - new Date()) / (1000 * 60 * 60)
  );

  return (
    <MainLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Header */}
      <div className="mb-2xl">
        <h1 className="text-3xl font-bold text-brand-900 mb-md">
          Dashboard
        </h1>
        <p className="text-brand-600">
          {event.name} • {event.status === 'accepting' ? 'Submissions Open' : 'Event Upcoming'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-lg mb-2xl">
        <StatCard
          icon={Users}
          label="Your Team"
          value={userTeam?.members.length || 1}
          color="accent"
        />
        <StatCard
          icon={FileText}
          label="Submissions"
          value={mockSubmissions.length}
          color="accent"
        />
        <StatCard
          icon={Clock}
          label="Time Left"
          value={`${eventEndsIn}h`}
          color="warning"
        />
        <StatCard
          icon={CheckCircle}
          label="Status"
          value={userSubmission?.status || 'Draft'}
          color="success"
        />
      </div>

      {/* Submission Editor */}
      <Card className="mb-2xl">
        <CardHeader title="Submission" subtitle="Edit and track your project submission" />
        <CardContent>
          {userSubmission ? (
            <div className="space-y-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-brand-900">
                    {userSubmission.title}
                  </h3>
                  <p className="text-sm text-brand-600 mt-sm">
                    {userSubmission.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-md mt-md">
                    <StatusBadge status={userSubmission.status} />
                    <Badge variant="primary">{userSubmission.track}</Badge>
                  </div>
                </div>
                <Link to="/submission/edit">
                  <Button variant="secondary" size="sm">
                    <Edit className="w-4 h-4 mr-sm" />
                    Edit
                  </Button>
                </Link>
              </div>

              {userSubmission.status === 'submitted' && (
                <div className="bg-success-50 border border-success-200 rounded-lg px-md py-md text-success-800">
                  <p className="text-sm font-medium">
                    ✓ Your submission has been successfully submitted!
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-lg">
                <div>
                  <p className="text-xs text-brand-600 font-medium mb-sm">
                    Technologies
                  </p>
                  <div className="flex flex-wrap gap-sm">
                    {userSubmission.technologies.map(tech => (
                      <Badge key={tech} variant="primary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-brand-600 font-medium mb-sm">
                    Submitted
                  </p>
                  <p className="text-sm text-brand-900">
                    {userSubmission.submittedAt
                      ? new Date(userSubmission.submittedAt).toLocaleString()
                      : 'Not submitted yet'}
                  </p>
                </div>
              </div>

              {userSubmission.status === 'draft' && (
                <div className="flex gap-md">
                  <Link to="/submission/preview">
                    <Button variant="secondary">Preview</Button>
                  </Link>
                  <Button
                    variant="primary"
                    onClick={() => alert('Submission submitted!')}
                  >
                    <CheckCircle className="w-4 h-4 mr-sm" />
                    Submit
                  </Button>
                </div>
              )}

              {userSubmission.status === 'submitted' && (
                <div className="flex gap-md">
                  <Link to={`/submission/${userSubmission.id}`}>
                    <Button variant="secondary">View Public Page</Button>
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={() => alert('Shared!')}
                  >
                    <Share2 className="w-4 h-4 mr-sm" />
                    Share
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2xl">
              <p className="text-brand-600 mb-lg">
                You haven't created a submission yet.
              </p>
              <Link to="/submission/create">
                <Button variant="primary">Create Submission</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="mb-2xl">
        <CardHeader title="Team" subtitle="Invite teammates to collaborate" />
        <CardContent>
          {userTeam ? (
            <div className="space-y-lg">
              <div>
                <h4 className="font-semibold text-brand-900 mb-md">
                  {userTeam.name}
                </h4>
                <p className="text-sm text-brand-600 mb-lg">
                  {userTeam.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-brand-700 mb-md">
                  Team Members ({userTeam.members.length}/{event.maxTeamSize})
                </p>
                <div className="space-y-sm">
                  {userTeam.members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-md p-md bg-brand-50 rounded-lg"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-brand-600">{member.email}</p>
                      </div>
                      <Badge variant="primary">
                        {member.role === 'lead' ? 'Lead' : 'Member'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {userTeam.members.length < event.maxTeamSize && (
                <Button variant="secondary" onClick={() => alert('Invite sent!')}>
                  Invite Teammate
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-2xl">
              <p className="text-brand-600 mb-lg">
                Join or create a team to start building.
              </p>
              <Button variant="primary">Find Teams</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Judging Progress */}
      {userSubmission?.status === 'submitted' && (
        <Card>
          <CardHeader title="Judging Progress" subtitle="See how judges are scoring your project" />
          <CardContent>
            <div className="space-y-lg">
              <div className="bg-brand-50 rounded-lg p-lg">
                <p className="text-sm text-brand-600 mb-md">
                  {userSubmission.scores.length} of 2 judges have reviewed
                </p>
                <div className="w-full bg-brand-200 rounded-full h-2">
                  <div
                    className="bg-accent-600 h-2 rounded-full transition-all"
                    style={{ width: `${(userSubmission.scores.length / 2) * 100}%` }}
                  />
                </div>
              </div>

              {userSubmission.scores.length > 0 && (
                <div className="space-y-md">
                  <p className="text-sm font-medium text-brand-700">Feedback</p>
                  {userSubmission.scores.map((score, idx) => (
                    <div key={idx} className="bg-brand-50 rounded-lg p-md">
                      <p className="text-xs text-brand-600 font-medium mb-sm">
                        Anonymous Judge
                      </p>
                      <p className="text-sm text-brand-900">{score.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
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
