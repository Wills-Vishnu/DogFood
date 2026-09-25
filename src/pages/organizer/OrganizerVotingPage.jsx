import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerVotingPage = ({ currentUser }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = currentUser || mockUsers.organizer;

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await organizerApi.getVotingConfig('1');
        setConfig(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
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
      <Link to="/organizer/dashboard" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Community Voting</h1>
        <p className="text-lg text-brand-600">Configure voting settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader title="Voting Status" />
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-brand-900 font-medium">Current State</span>
              <Badge variant={config?.state === 'active' ? 'success' : 'warning'}>
                {config?.state || 'not_started'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Access Control" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-brand-900">Type: {config?.accessType}</p>
              <p className="text-xs text-brand-600 mt-1">
                {config?.accessType === 'open_link' ? 'Public voting via shareable link' :
                  config?.accessType === 'email_gated' ? 'Email-gated voting' :
                  'Authenticated voting only'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Display Settings" />
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-900">Hide Results During Voting</p>
                <p className="text-xs text-brand-600">Voters won't see current tallies</p>
              </div>
              <Check className={`w-5 h-5 ${config?.hideResultsDuringVoting ? 'text-success-600' : 'text-brand-300'}`} />
            </div>
            <div className="border-t border-brand-200 pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-900">Randomize Project Order</p>
                <p className="text-xs text-brand-600">Mitigates position bias</p>
              </div>
              <Check className={`w-5 h-5 ${config?.randomizeProjectOrder ? 'text-accent-600' : 'text-brand-300'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Anti-Abuse" />
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-brand-900">Rate Limiting</p>
              <p className="text-sm text-brand-600 mt-1">
                {config?.voterAntiAbuse?.rateLimitPerHour} votes/hour per IP
              </p>
              <p className="text-xs text-brand-500 mt-1">Frontend cannot enforce; backend will validate</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="primary">Save Changes</Button>
          <Button variant="secondary">Start Voting</Button>
        </div>
      </div>
    </MainLayout>
  );
};
