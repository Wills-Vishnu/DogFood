import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerAuditPage = ({ currentUser }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const user = currentUser || mockUsers.organizer;

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await organizerApi.getAuditLog('1');
        setLogs(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filtered = logs.filter(log =>
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Audit Log</h1>
        <p className="text-lg text-brand-600">Event activity and changes</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-lg border border-brand-200">
            <Search className="w-5 h-5 text-brand-600" />
            <input
              type="text"
              placeholder="Search audit log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-brand-900 placeholder-brand-500 outline-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map(log => (
                <div key={log.id} className="p-4 border border-brand-200 rounded-lg hover:bg-brand-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-brand-900">{log.target}</p>
                      <p className="text-xs text-brand-600 mt-1">{log.actor?.name}</p>
                    </div>
                    <Badge variant={log.status === 'success' ? 'success' : 'warning'}>
                      {log.action}
                    </Badge>
                  </div>
                  <p className="text-xs text-brand-600 mt-2">{log.details}</p>
                  <p className="text-xs text-brand-500 mt-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-600 py-8">No audit logs found</p>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};
