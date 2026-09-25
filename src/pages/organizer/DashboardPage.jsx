import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Star,
  TrendingUp,
  CalendarDays,
  Clock,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  StatusBadge,
  Badge,
} from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { mockEvents, mockTeams, mockSubmissions, mockJudgeAssignments } from '../../mocks/data';

export const OrganizerDashboard = ({ currentUser, onLogout }) => {
  const events = mockEvents;
  const event = events[0];
  const teams = mockTeams.filter(t => t.eventId === event.id);
  const submissions = mockSubmissions.filter(s => s.eventId === event.id);
  const assignments = mockJudgeAssignments.filter(a => a.eventId === event.id);

  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const judgesComplete = assignments.filter(a => a.status === 'completed').length;

  return (
    <MainLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Header */}
      <div className="mb-2xl">
        <div className="flex items-start justify-between mb-lg">
          <div>
            <h1 className="text-3xl font-bold text-brand-900 mb-md">
              Organizer Dashboard
            </h1>
            <p className="text-brand-600">
              Manage {event.name}
            </p>
          </div>
          <Link to="/organizer/create-event">
            <Button variant="primary">New Event</Button>
          </Link>
        </div>
      </div>

      {/* Event Quick Stats */}
      <div className="grid md:grid-cols-4 gap-lg mb-2xl">
        <StatCard
          icon={Users}
          label="Participants"
          value={event.participantCount}
          color="accent"
        />
        <StatCard
          icon={Users}
          label="Teams"
          value={teams.length}
          color="accent"
        />
        <StatCard
          icon={FileText}
          label="Submissions"
          value={`${submittedCount}/${event.submissionCount}`}
          color="warning"
        />
        <StatCard
          icon={Star}
          label="Judges"
          value={`${judgesComplete}/${assignments.length}`}
          color="success"
        />
      </div>

      {/* Current Event */}
      <Card className="mb-2xl">
        <CardHeader
          title={event.name}
          subtitle={event.description}
        />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-2xl">
            <div>
              <p className="text-xs text-brand-600 font-medium mb-sm">
                Submission Deadline
              </p>
              <p className="text-lg font-semibold text-brand-900">
                {event.submissionDeadline.toLocaleDateString()}
              </p>
              <p className="text-sm text-brand-600 mt-sm">
                {Math.ceil((event.submissionDeadline - new Date()) / (1000 * 60 * 60))}h remaining
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-600 font-medium mb-sm">
                Event Dates
              </p>
              <p className="text-lg font-semibold text-brand-900">
                {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
              </p>
              <StatusBadge status={event.status} className="mt-sm" />
            </div>
            <div>
              <p className="text-xs text-brand-600 font-medium mb-sm">
                Max Team Size
              </p>
              <p className="text-lg font-semibold text-brand-900">
                {event.maxTeamSize} people
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-2xl mt-2xl pt-2xl border-t border-brand-200">
            <Link to="/organizer/submissions">
              <Button variant="secondary" className="w-full">
                View All Submissions
              </Button>
            </Link>
            <Link to="/organizer/judging">
              <Button variant="secondary" className="w-full">
                Manage Judging
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Teams & Submissions Overview */}
      <div className="grid md:grid-cols-2 gap-2xl mb-2xl">
        {/* Recent Teams */}
        <Card>
          <CardHeader title="Teams" subtitle={`${teams.length} teams registered`} />
          <CardContent>
            {teams.length === 0 ? (
              <p className="text-brand-600 text-sm">No teams yet</p>
            ) : (
              <div className="space-y-md">
                {teams.map(team => (
                  <div key={team.id} className="flex items-center justify-between p-md bg-brand-50 rounded-lg">
                    <div>
                      <p className="font-medium text-brand-900">{team.name}</p>
                      <p className="text-xs text-brand-600">
                        {team.members.length} members
                      </p>
                    </div>
                    <Badge variant="primary">{team.track}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader
            title="Submissions"
            subtitle={`${submittedCount} of ${event.submissionCount} submitted`}
          />
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-brand-600 text-sm">No submissions yet</p>
            ) : (
              <div className="space-y-md">
                {submissions.slice(0, 3).map(submission => (
                  <div key={submission.id} className="flex items-center justify-between p-md bg-brand-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-brand-900 text-sm">
                        {submission.title}
                      </p>
                      <p className="text-xs text-brand-600">
                        {submission.team.name}
                      </p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <div className="grid md:grid-cols-3 gap-md">
            <Link to="/organizer/participants">
              <Button variant="secondary" className="w-full justify-center">
                <Users className="w-4 h-4 mr-sm" />
                Manage Participants
              </Button>
            </Link>
            <Link to="/organizer/judges">
              <Button variant="secondary" className="w-full justify-center">
                <Star className="w-4 h-4 mr-sm" />
                Assign Judges
              </Button>
            </Link>
            <Link to="/organizer/rubric">
              <Button variant="secondary" className="w-full justify-center">
                <FileText className="w-4 h-4 mr-sm" />
                Configure Rubric
              </Button>
            </Link>
            <Link to="/organizer/results">
              <Button variant="secondary" className="w-full justify-center">
                <TrendingUp className="w-4 h-4 mr-sm" />
                View Results
              </Button>
            </Link>
            <Link to="/organizer/audit">
              <Button variant="secondary" className="w-full justify-center">
                <Clock className="w-4 h-4 mr-sm" />
                Audit Log
              </Button>
            </Link>
            <Link to="/organizer/settings">
              <Button variant="secondary" className="w-full justify-center">
                <CalendarDays className="w-4 h-4 mr-sm" />
                Event Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
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
