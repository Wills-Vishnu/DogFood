import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerAssignmentsPage = ({ currentUser }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = currentUser || mockUsers.organizer;

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await organizerApi.getAssignments('1');
        setAssignments(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, []);

  const completed = assignments.filter(a => a.status === 'completed').length;
  const pending = assignments.filter(a => a.status === 'pending').length;

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
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Judge Assignments</h1>
        <p className="text-lg text-brand-600">{completed} completed · {pending} pending</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-success-600">{completed}</p>
            <p className="text-sm text-brand-600 mt-1">Evaluations Complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-accent-600">{pending}</p>
            <p className="text-sm text-brand-600 mt-1">Evaluations Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="p-4 border border-brand-200 rounded-lg hover:bg-brand-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-brand-900">{assignment.submission?.title}</p>
                      <p className="text-sm text-brand-600">{assignment.submission?.team?.name}</p>
                    </div>
                    <Badge variant={assignment.status === 'completed' ? 'success' : 'warning'}>
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-600 py-8">No assignments</p>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};
