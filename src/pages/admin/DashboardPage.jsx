import React from 'react';
import {
  Users,
  Settings,
  Database,
  BarChart3,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
} from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { mockUsers, mockEvents } from '../../mocks/data';

export const AdminDashboard = ({ currentUser, onLogout }) => {
  const usersByRole = Object.values(mockUsers).reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = 0;
    acc[user.role]++;
    return acc;
  }, {});

  return (
    <MainLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Header */}
      <div className="mb-2xl">
        <h1 className="text-3xl font-bold text-brand-900 mb-md">
          System Administration
        </h1>
        <p className="text-brand-600">
          Manage users, events, and system settings
        </p>
      </div>

      {/* System Stats */}
      <div className="grid md:grid-cols-4 gap-lg mb-2xl">
        <StatCard
          icon={Users}
          label="Total Users"
          value={Object.keys(mockUsers).length}
          color="accent"
        />
        <StatCard
          icon={Database}
          label="Events"
          value={mockEvents.length}
          color="accent"
        />
        <StatCard
          icon={BarChart3}
          label="System Health"
          value="Healthy"
          color="success"
        />
        <StatCard
          icon={Settings}
          label="Version"
          value="1.0.0"
          color="accent"
        />
      </div>

      {/* User Management */}
      <Card className="mb-2xl">
        <CardHeader title="Users by Role" />
        <CardContent>
          <div className="space-y-md">
            {Object.entries(usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-md bg-brand-50 rounded-lg">
                <div>
                  <p className="font-medium text-brand-900 capitalize">
                    {role}s
                  </p>
                  <p className="text-xs text-brand-600">
                    {count} active
                  </p>
                </div>
                <Badge variant="primary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events Overview */}
      <Card>
        <CardHeader title="Events" />
        <CardContent>
          <div className="space-y-md">
            {mockEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-md bg-brand-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-brand-900">{event.name}</p>
                  <p className="text-xs text-brand-600">
                    {event.participantCount} participants • {event.teamCount} teams
                  </p>
                </div>
                <Badge variant="primary">{event.status}</Badge>
              </div>
            ))}
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
