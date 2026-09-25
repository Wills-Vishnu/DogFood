import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerResultsPage = ({ currentUser }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = currentUser || mockUsers.organizer;

  useEffect(() => {
    const loadScores = async () => {
      try {
        const response = await organizerApi.getNormalizedScores('1');
        setScores(response.data.sort((a, b) => b.normalizedScore - a.normalizedScore));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadScores();
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
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Final Results</h1>
        <p className="text-lg text-brand-600">Ranked by normalized scores</p>
      </div>

      <div className="space-y-4">
        {scores.map((score, idx) => (
          <Card key={score.submissionId} className={idx === 0 ? 'border-2 border-accent-600' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-2xl font-bold text-accent-600 w-10 text-center">
                    {idx === 0 ? <Trophy className="w-6 h-6" /> : `#${idx + 1}`}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-900">{score.submission?.title}</h3>
                    <p className="text-sm text-brand-600 mt-1">Team: {score.submission?.team?.name}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-3xl font-bold text-brand-900">{score.normalizedScore.toFixed(1)}</p>
                  <p className="text-xs text-brand-600 mt-1">Raw avg: {score.avgRawScore.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};
