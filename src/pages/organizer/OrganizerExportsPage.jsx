import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button, Card, CardContent, CardHeader } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerExportsPage = ({ currentUser }) => {
  const [exporting, setExporting] = useState({});
  const user = currentUser || mockUsers.organizer;

  const handleExport = async (type) => {
    setExporting(prev => ({ ...prev, [type]: true }));
    try {
      switch (type) {
        case 'participants':
          await organizerApi.exportParticipants('1');
          break;
        case 'submissions':
          await organizerApi.exportSubmissions('1');
          break;
        case 'scores':
          await organizerApi.exportScores('1');
          break;
        case 'results':
          await organizerApi.exportResults('1');
          break;
      }
      setTimeout(() => setExporting(prev => ({ ...prev, [type]: false })), 1000);
    } catch (err) {
      console.error(err);
      setExporting(prev => ({ ...prev, [type]: false }));
    }
  };

  const exports = [
    {
      id: 'participants',
      name: 'Participants',
      description: 'CSV with all registered participants',
      fields: 'Name, Email, Team, Registration Date',
    },
    {
      id: 'submissions',
      name: 'Submissions',
      description: 'CSV with all project submissions',
      fields: 'Project, Team, Track, Status, Submission Time',
    },
    {
      id: 'scores',
      name: 'Judge Scores',
      description: 'CSV with raw judge scores and feedback',
      fields: 'Project, Judge, Scores, Feedback, Submitted At',
    },
    {
      id: 'results',
      name: 'Final Results',
      description: 'CSV with ranked projects and final scores',
      fields: 'Rank, Project, Team, Raw Score, Normalized Score',
    },
  ];

  return (
    <MainLayout currentUser={currentUser}>
      <Link to="/organizer/dashboard" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Export Data</h1>
        <p className="text-lg text-brand-600">Download event data as CSV</p>
      </div>

      <div className="grid gap-4">
        {exports.map(exp => (
          <Card key={exp.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-accent-600" />
                    <h3 className="font-bold text-brand-900">{exp.name}</h3>
                  </div>
                  <p className="text-sm text-brand-600 mb-2">{exp.description}</p>
                  <p className="text-xs text-brand-500">Fields: {exp.fields}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleExport(exp.id)}
                  isLoading={exporting[exp.id]}
                  className="flex-shrink-0 ml-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exporting[exp.id] ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-brand-50 border-brand-200">
        <CardHeader title="Export Guidelines" />
        <CardContent className="text-sm text-brand-600 space-y-2">
          <p>• Exports contain public and organizer-visible data only</p>
          <p>• Judge feedback and confidential notes are included</p>
          <p>• Data is downloaded to your device; use securely</p>
          <p>• CSV files can be opened in Excel, Google Sheets, etc.</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
};
