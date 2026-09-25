import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerNormalizationPage = ({ currentUser }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = currentUser || mockUsers.organizer;

  useEffect(() => {
    const loadScores = async () => {
      try {
        const response = await organizerApi.getNormalizedScores('1');
        setScores(response.data);
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
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Score Normalization</h1>
        <p className="text-lg text-brand-600">View raw and normalized scores</p>
      </div>

      <Card className="mb-6">
        <CardHeader title="Normalization Method" />
        <CardContent>
          <p className="text-sm text-brand-600">Z-score normalization with weighted averaging</p>
          <p className="text-xs text-brand-500 mt-2">Normalizes scores across judges to account for individual judging patterns</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {scores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-200">
                    <th className="text-left py-3 px-4 font-semibold text-brand-900">Project</th>
                    <th className="text-left py-3 px-4 font-semibold text-brand-900">Raw Avg</th>
                    <th className="text-left py-3 px-4 font-semibold text-brand-900">Normalized</th>
                    <th className="text-left py-3 px-4 font-semibold text-brand-900">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map(score => (
                    <tr key={score.submissionId} className="border-b border-brand-100 hover:bg-brand-50">
                      <td className="py-3 px-4 text-brand-900 font-medium">{score.submission?.title}</td>
                      <td className="py-3 px-4 text-brand-600">{score.avgRawScore.toFixed(1)}</td>
                      <td className="py-3 px-4 text-brand-900 font-semibold">{score.normalizedScore.toFixed(1)}</td>
                      <td className="py-3 px-4 text-brand-900 font-bold">#{score.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-brand-600 py-8">No scores to display</p>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};
