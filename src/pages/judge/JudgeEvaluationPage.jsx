import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Badge, EmptyState, LoadingSpinner, Alert } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { judgeApi, submissionsApi } from '../../api/mockApi';
import { mockUsers } from '../../mocks/data';

export const JudgeEvaluationPage = ({ currentUser }) => {
  const { id: submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [rubric, setRubric] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const user = currentUser || mockUsers.judge1;

  useEffect(() => {
    const loadData = async () => {
      try {
        const subResponse = await submissionsApi.getSubmissionById(submissionId);
        setSubmission(subResponse.data);

        const rubricResponse = await judgeApi.getRubric('1');
        setRubric(rubricResponse.data);

        const evalResponse = await judgeApi.getEvaluation(submissionId, user.id);
        if (evalResponse.data) {
          setEvaluation(evalResponse.data);
          setScores(evalResponse.data.scores || {});
          setFeedback(evalResponse.data.feedback || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [submissionId, user]);

  const handleScoreChange = (criterionId, score) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: Math.min(10, Math.max(0, parseInt(score) || 0)),
    }));
    setIsDirty(true);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
    setIsDirty(true);
  };

  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await judgeApi.saveEvaluationDraft(submissionId, user.id, '1', {
        scores,
        feedback,
        status: 'draft',
      });
      setSuccess('Evaluation draft saved');
      setIsDirty(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (Object.keys(scores).length === 0) {
      setError('Please score all criteria');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await judgeApi.submitEvaluation(submissionId, user.id, '1', {
        scores,
        feedback,
      });
      setSuccess('Evaluation submitted successfully');
      setIsDirty(false);
      setTimeout(() => {
        navigate('/judge/assignments');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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

  if (error && !submission) {
    return (
      <MainLayout currentUser={currentUser}>
        <EmptyState
          icon={AlertCircle}
          title="Error loading evaluation"
          description={error}
        />
      </MainLayout>
    );
  }

  if (!submission) {
    return (
      <MainLayout currentUser={currentUser}>
        <EmptyState title="Submission not found" />
      </MainLayout>
    );
  }

  const isCompleted = evaluation?.status === 'submitted';
  const maxScore = rubric.reduce((sum, c) => sum + c.maxScore, 0);
  const currentTotal = calculateTotal();

  return (
    <MainLayout currentUser={currentUser}>
      <Link to="/judge/assignments" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Assignments
      </Link>

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}
      {success && <Alert type="success" title="Success" message={success} className="mb-6" />}
      {isDirty && <Alert type="warning" title="Unsaved changes" message="You have unsaved scores" className="mb-6" />}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Project Info */}
          <Card>
            <CardHeader title="Project" />
            <CardContent>
              <h2 className="text-2xl font-bold text-brand-900 mb-2">{submission.title}</h2>
              <p className="text-brand-600 mb-4">{submission.tagline}</p>
              <div className="flex gap-2">
                <Badge variant="primary">{submission.track}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Rubric */}
          <Card>
            <CardHeader title="Evaluation Rubric" />
            <CardContent className="space-y-6">
              {rubric.map(criterion => (
                <div key={criterion.id} className="pb-6 border-b border-brand-200 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-brand-900">{criterion.name}</h3>
                      <p className="text-sm text-brand-600">{criterion.description}</p>
                    </div>
                    <span className="text-sm font-medium text-brand-600">Weight: {criterion.weight}%</span>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={scores[criterion.id] || ''}
                      onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                      placeholder="0"
                      disabled={isCompleted}
                      className="input w-20"
                    />
                    <span className="text-sm text-brand-600">/ {criterion.maxScore}</span>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t-2 border-brand-300">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-brand-900">Total Score</span>
                  <span className="text-2xl font-bold text-accent-600">
                    {currentTotal}/{maxScore}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader title="Overall Feedback" />
            <CardContent>
              <textarea
                value={feedback}
                onChange={handleFeedbackChange}
                disabled={isCompleted}
                placeholder="Provide detailed feedback on the project..."
                rows="6"
                className="input w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Status" />
            <CardContent>
              <p className="text-sm text-brand-600 mb-2">
                {isCompleted ? 'This evaluation has been submitted.' : 'Evaluation in progress'}
              </p>
              {isCompleted && evaluation?.submittedAt && (
                <p className="text-xs text-brand-600">
                  Submitted: {evaluation.submittedAt.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Score Summary" />
            <CardContent>
              <div className="space-y-3 text-sm">
                {rubric.map(criterion => (
                  <div key={criterion.id} className="flex justify-between">
                    <span className="text-brand-600">{criterion.name}</span>
                    <span className="font-semibold text-brand-900">
                      {scores[criterion.id] || '—'}/{criterion.maxScore}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-brand-200 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-accent-600">{currentTotal}/{maxScore}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Actions" />
            <CardContent className="space-y-2">
              {!isCompleted && (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleSaveDraft}
                    isLoading={saving}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleSubmitEvaluation}
                    isLoading={submitting}
                    className="w-full"
                  >
                    Submit Evaluation
                  </Button>
                </>
              )}

              {isCompleted && (
                <Link to="/judge/assignments" className="block">
                  <Button variant="secondary" className="w-full">
                    Back to Assignments
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
