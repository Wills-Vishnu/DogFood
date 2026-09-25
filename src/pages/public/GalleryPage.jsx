import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Grid,
  List,
} from 'lucide-react';
import { Button, Card, CardContent, Badge, EmptyState } from '../../components/common';
import { mockSubmissions, mockEvents } from '../../mocks/data';

export const GalleryPage = ({ currentUser }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0].id);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [votes, setVotes] = useState({});

  const event = mockEvents.find(e => e.id === selectedEvent);
  let filtered = mockSubmissions.filter(s => s.eventId === selectedEvent);

  if (search) {
    filtered = filtered.filter(
      s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (selectedTrack) {
    filtered = filtered.filter(s => s.track === selectedTrack);
  }

  if (sortBy === 'votes') {
    filtered.sort((a, b) => (b.votes + (votes[b.id] ? 1 : 0)) - (a.votes + (votes[a.id] ? 1 : 0)));
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => b.submittedAt - a.submittedAt);
  }

  const toggleVote = (submissionId) => {
    setVotes(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId],
    }));
  };

  if (!event) {
    return (
      <EmptyState
        title="No events available"
        description="Check back soon for upcoming hackathons."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-lg py-2xl">
      {/* Header */}
      <div className="mb-2xl">
        <h1 className="text-3xl font-bold text-brand-900 mb-md">{event.name}</h1>
        <p className="text-brand-600">{event.description}</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-brand-200 p-lg mb-2xl space-y-lg">
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex-1 relative">
            <Search className="absolute left-md top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-2xl"
            />
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-md rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-brand-600 hover:bg-brand-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-md rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent-100 text-accent-700'
                  : 'text-brand-600 hover:bg-brand-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-md">
          {event.tracks && event.tracks.length > 0 && (
            <div className="flex-1">
              <label className="text-sm font-medium text-brand-700 mb-sm block">
                Track
              </label>
              <select
                value={selectedTrack || ''}
                onChange={e => setSelectedTrack(e.target.value || null)}
                className="input"
              >
                <option value="">All Tracks</option>
                {event.tracks.map(track => (
                  <option key={track.id} value={track.name}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1">
            <label className="text-sm font-medium text-brand-700 mb-sm block">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input"
            >
              <option value="newest">Newest First</option>
              <option value="votes">Most Votes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try adjusting your filters or search terms."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2xl">
          {filtered.map(submission => (
            <ProjectCard
              key={submission.id}
              submission={submission}
              hasVoted={votes[submission.id]}
              onVote={() => toggleVote(submission.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-lg">
          {filtered.map(submission => (
            <ProjectListItem
              key={submission.id}
              submission={submission}
              hasVoted={votes[submission.id]}
              onVote={() => toggleVote(submission.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ submission, hasVoted, onVote }) => (
  <Link to={`/submission/${submission.id}`}>
    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
      <div className="h-40 bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-accent-600 opacity-20">
            {submission.team.name.charAt(0)}
          </div>
        </div>
      </div>
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-md flex-1">
          <h3 className="font-semibold text-lg text-brand-900 mb-sm line-clamp-2">
            {submission.title}
          </h3>
          <p className="text-sm text-brand-600 line-clamp-2">
            {submission.description}
          </p>
        </div>

        <div className="space-y-md border-t border-brand-200 pt-md">
          <div>
            <p className="text-xs text-brand-600 font-medium mb-sm">
              {submission.team.name}
            </p>
            <Badge variant="primary">{submission.track}</Badge>
          </div>

          <div className="flex items-center gap-lg text-sm text-brand-600">
            <button
              onClick={e => {
                e.preventDefault();
                onVote();
              }}
              className="flex items-center gap-sm hover:text-accent-600 transition-colors"
            >
              <Heart className={`w-4 h-4 ${hasVoted ? 'fill-danger-600 text-danger-600' : ''}`} />
              <span>{submission.votes}</span>
            </button>
            <div className="flex items-center gap-sm">
              <MessageCircle className="w-4 h-4" />
              <span>Comments</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

const ProjectListItem = ({ submission, hasVoted, onVote }) => (
  <Link to={`/submission/${submission.id}`}>
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="py-lg flex items-center gap-2xl">
        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center flex-shrink-0">
          <div className="text-4xl font-bold text-accent-600 opacity-20">
            {submission.team.name.charAt(0)}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg text-brand-900 mb-sm">
            {submission.title}
          </h3>
          <p className="text-sm text-brand-600 mb-md line-clamp-2">
            {submission.description}
          </p>
          <div className="flex flex-wrap items-center gap-md">
            <span className="text-xs text-brand-600 font-medium">
              {submission.team.name}
            </span>
            <Badge variant="primary">{submission.track}</Badge>
          </div>
        </div>

        <div className="flex flex-col items-end gap-md text-sm text-brand-600">
          <button
            onClick={e => {
              e.preventDefault();
              onVote();
            }}
            className="flex items-center gap-sm hover:text-accent-600 transition-colors whitespace-nowrap"
          >
            <Heart className={`w-4 h-4 ${hasVoted ? 'fill-danger-600 text-danger-600' : ''}`} />
            <span>{submission.votes} votes</span>
          </button>
        </div>
      </CardContent>
    </Card>
  </Link>
);
