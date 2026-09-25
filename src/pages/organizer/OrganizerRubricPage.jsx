import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { organizerApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const OrganizerRubricPage = ({ currentUser }) => {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalWeight, setTotalWeight] = useState(0);

  const user = currentUser || mockUsers.organizer;

  useEffect(() => {
    const loadRubric = async () => {
      try {
        const response = await organizerApi.getRubric('1');
        setCriteria(response.data);
        setTotalWeight(response.data.reduce((sum, c) => sum + c.weight, 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRubric();
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
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Evaluation Rubric</h1>
        <p className="text-lg text-brand-600">Configure scoring criteria</p>
      </div>

      <Card className="mb-6">
        <CardHeader title="Total Weight" />
        <CardContent>
          <div className={`text-3xl font-bold ${totalWeight === 100 ? 'text-success-600' : 'text-accent-600'}`}>
            {totalWeight}%
          </div>
          {totalWeight !== 100 && (
            <p className="text-sm text-accent-600 mt-2">Weight must equal 100%</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {criteria.map(criterion => (
          <Card key={criterion.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-brand-900">{criterion.name}</h3>
                  <p className="text-sm text-brand-600 mt-1">{criterion.description}</p>
                </div>
                <Badge variant="primary">{criterion.weight}%</Badge>
              </div>
              <div className="text-sm text-brand-600">Max score: {criterion.maxScore}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        <Button variant="primary">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </MainLayout>
  );
};
