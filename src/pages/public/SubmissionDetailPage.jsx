import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  ExternalLink,
  Github,
  Play,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Badge,
  EmptyState,
  Alert,
} from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { mockSubmissions, mockComments } from '../../mocks/data';

export const SubmissionDetailPage = ({ currentUser, onLogout }) => {
  const { id } = useParams();
  const submission = mockSubmissions.find(s => s.id === id);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState(submission?.votes || 0);
  const [comments, setComments] = useState(mockComments.filter(c => c.submissionId === id));
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  if (!submission) {
    return (
      <MainLayout currentUser={currentUser} onLogout={onLogout}>
        <EmptyState
          title="Project not found"
          description="The project you're looking for doesn't exist."
          action={
            <Link to="/gallery">
              <Button variant="primary">Back to Gallery</Button>
            </Link>
          }
        />
      </MainLayout>
    );
  }

  const handleVote = () => {
    if (!hasVoted) {
      setVotes(votes + 1);
      setHasVoted(true);
    } else {
      setVotes(votes - 1);
      setHasVoted(false);
    }
  };

  const handleAddComment = e => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: 'comment' + Math.random().toString(36).substr(2, 9),
        submissionId: submission.id,
        userId: currentUser?.id || 'guest',
        user: currentUser || { name: 'Guest', avatar: '' },
        text: newComment,
        createdAt: new Date(),
        votes: 0,
        replies: [],
      };
      setComments([...comments, comment]);
      setNewComment('');
      setShowCommentForm(false);
    }
  };

  return (
    <MainLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Header */}
      <div className="mb-2xl">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-sm text-accent-600 hover:text-accent-700 mb-lg font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-2xl">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-2xl">
          {/* Project Header */}
          <Card>
            <div className="h-64 bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center">
              <div className="text-6xl font-bold text-accent-600 opacity-20">
                {submission.team.name.charAt(0)}
              </div>
            </div>
            <CardContent className="pt-2xl">
              <div className="mb-lg">
                <h1 className="text-3xl font-bold text-brand-900 mb-md">
                  {submission.title}
                </h1>
                <p className="text-lg text-brand-600 mb-lg">
                  {submission.description}
                </p>

                <div className="flex flex-wrap items-center gap-md mb-lg">
                  <img
                    src={submission.team.members[0]?.avatar}
                    alt={submission.team.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-brand-900">
                    {submission.team.name}
                  </span>
                  <Badge variant="primary">{submission.track}</Badge>
                  {submission.submittedAt && (
                    <span className="text-sm text-brand-600">
                      Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-2xl py-lg border-t border-b border-brand-200">
                  <button
                    onClick={handleVote}
                    className="flex items-center gap-sm text-lg font-semibold transition-colors"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        hasVoted
                          ? 'fill-danger-600 text-danger-600'
                          : 'text-brand-600 hover:text-danger-600'
                      }`}
                    />
                    <span className="text-brand-900">{votes}</span>
                  </button>
                  <div className="flex items-center gap-sm text-lg font-semibold text-brand-700">
                    <MessageCircle className="w-6 h-6" />
                    <span>{comments.length}</span>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div className="mb-lg">
                <p className="text-sm font-medium text-brand-700 mb-md">
                  Technologies Used
                </p>
                <div className="flex flex-wrap gap-sm">
                  {submission.technologies.map(tech => (
                    <Badge key={tech} variant="primary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Links */}
              <div className="space-y-md">
                <p className="text-sm font-medium text-brand-700">Resources</p>
                <div className="flex flex-col sm:flex-row gap-md">
                  {submission.liveUrl && (
                    <a href={submission.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" className="w-full sm:w-auto">
                        <ExternalLink className="w-4 h-4 mr-sm" />
                        Visit Project
                      </Button>
                    </a>
                  )}
                  {submission.repoUrl && (
                    <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="w-full sm:w-auto">
                        <Github className="w-4 h-4 mr-sm" />
                        Source Code
                      </Button>
                    </a>
                  )}
                  {submission.videoUrl && (
                    <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="w-full sm:w-auto">
                        <Play className="w-4 h-4 mr-sm" />
                        Demo Video
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => alert('Project shared!')}
                    className="w-full sm:w-auto"
                  >
                    <Share2 className="w-4 h-4 mr-sm" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader title="Comments" subtitle={`${comments.length} people commenting`} />
            <CardContent>
              {!currentUser && (
                <Alert
                  type="info"
                  message="Sign in to comment on this project"
                  className="mb-lg"
                />
              )}

              {currentUser && !showCommentForm && (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="w-full p-md bg-brand-50 hover:bg-brand-100 rounded-lg text-left text-brand-700 transition-colors mb-lg"
                >
                  What do you think? Add your thoughts...
                </button>
              )}

              {currentUser && showCommentForm && (
                <form onSubmit={handleAddComment} className="mb-lg">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows="4"
                    className="input mb-md"
                  />
                  <div className="flex gap-sm">
                    <Button type="submit" variant="primary">
                      Post Comment
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowCommentForm(false);
                        setNewComment('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {comments.length === 0 ? (
                <p className="text-center text-brand-600 py-lg">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="space-y-lg">
                  {comments.map(comment => (
                    <div key={comment.id} className="border-l-2 border-brand-200 pl-lg">
                      <div className="flex items-start gap-md mb-sm">
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-brand-900">
                            {comment.user.name}
                          </p>
                          <p className="text-xs text-brand-600">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-brand-700 mb-md">{comment.text}</p>
                      <button className="text-sm text-brand-600 hover:text-accent-600 transition-colors">
                        <Heart className="w-4 h-4 inline mr-sm" />
                        {comment.votes}
                      </button>

                      {comment.replies.length > 0 && (
                        <div className="mt-md space-y-md">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="pl-lg">
                              <div className="flex items-start gap-md mb-sm">
                                <img
                                  src={reply.user.avatar}
                                  alt={reply.user.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-brand-900">
                                    {reply.user.name}
                                  </p>
                                  <p className="text-xs text-brand-600">
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-brand-700">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-2xl">
          {/* Judge Scores (if available) */}
          {submission.scores.length > 0 && (
            <Card>
              <CardHeader title="Scores" subtitle="Anonymous judge feedback" />
              <CardContent>
                <div className="space-y-lg">
                  {submission.scores.map((score, idx) => (
                    <div key={idx}>
                      <p className="text-xs text-brand-600 font-medium mb-sm">
                        Judge {idx + 1}
                      </p>
                      <div className="grid grid-cols-2 gap-sm">
                        {Object.entries(score.criteria).map(([key, value]) => (
                          <div key={key} className="bg-brand-50 p-sm rounded">
                            <p className="text-xs text-brand-600 capitalize">
                              {key}
                            </p>
                            <p className="font-semibold text-brand-900">
                              {value}/10
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Info */}
          <Card>
            <CardHeader title="Team" />
            <CardContent>
              <div className="space-y-md">
                {submission.team.members.map(member => (
                  <div key={member.id} className="flex items-start gap-md">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-brand-900">{member.name}</p>
                      <p className="text-xs text-brand-600">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
