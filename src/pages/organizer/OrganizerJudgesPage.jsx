import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Plus } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerJudgesPage = ({ currentUser }) => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  const user = currentUser || mockUsers.organizer;

  useEffect(() => {
    const loadJudges = async () => {
      try {
        const response = await organizerApi.getJudges('1');
        setJudges(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJudges();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await organizerApi.inviteJudge('1', inviteEmail);
      setInviteEmail('');
      const response = await organizerApi.getJudges('1');
      setJudges(response.data);
    } catch (err) {
      console.error(err);
    }
  };

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
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Judges</h1>
        <p className="text-lg text-brand-600">{judges.length} judges invited</p>
      </div>

      <Card className="mb-6">
        <CardHeader title="Invite Judge" />
        <CardContent>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="judge@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 input"
            />
            <Button variant="primary" onClick={handleInvite}>
              <Mail className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {judges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-200">
                    <th className="text-left py-3 px-4 font-semibold text-brand-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-brand-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-brand-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-brand-900">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {judges.map(judge => (
                    <tr key={judge.id} className="border-b border-brand-100 hover:bg-brand-50">
                      <td className="py-3 px-4 text-brand-900 font-medium">{judge.name}</td>
                      <td className="py-3 px-4 text-brand-600">{judge.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={judge.status === 'accepted' ? 'success' : 'warning'}>
                          {judge.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-brand-900">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-brand-600 py-8">No judges invited yet</p>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};
