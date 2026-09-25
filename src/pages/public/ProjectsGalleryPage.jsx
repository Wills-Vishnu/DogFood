import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge, Button, Card, CardContent, EmptyState, ErrorState, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { galleryApi } from '../../api/endpoints';
import { ProjectThumbnail } from '../../components/projects/ProjectShowcase';
import { formatDate } from '../../utils/format';

const PAGE_SIZE = 12;

export const ProjectsGalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = searchParams.get('event') || '';
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [trackId, setTrackId] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ events: [], tracks: [], tags: [] });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [query, eventId, trackId, tag, sort]);

  useEffect(() => {
    galleryApi
      .filters(eventId || undefined)
      .then(setFilters)
      .catch(() => setFilters({ events: [], tracks: [], tags: [] }));
  }, [eventId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    galleryApi
      .projects({ q: query, event_id: eventId, track_id: trackId, tag, sort, page, page_size: PAGE_SIZE })
      .then(data => active && setResult(data))
      .catch(err => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query, eventId, trackId, tag, sort, page, reloadKey]);

  const setEvent = value => {
    setTrackId('');
    setSearchParams(value ? { event: value } : {});
  };

  const hasFilters = query || eventId || trackId || tag;
  const clearFilters = () => {
    setSearch('');
    setTrackId('');
    setTag('');
    setEvent('');
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Project Gallery</h1>
        <p className="text-lg text-brand-600">Explore submitted hackathon projects</p>
      </div>

      <div className="bg-white rounded-lg border border-brand-200 p-6 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
            <input
              type="text"
              placeholder="Search by name, tagline, technology, track or team..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-12"
              aria-label="Search projects"
              maxLength={100}
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input sm:w-44" aria-label="Sort">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Name (A–Z)</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <select value={eventId} onChange={e => setEvent(e.target.value)} className="input" aria-label="Event">
            <option value="">All Events</option>
            {filters.events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          <select value={trackId} onChange={e => setTrackId(e.target.value)} className="input" aria-label="Track">
            <option value="">All Tracks</option>
            {filters.tracks.map(track => (
              <option key={track.id} value={track.id}>
                {track.name}
                {!eventId && filters.events.length > 1
                  ? ` (${filters.events.find(event => event.id === track.event_id)?.name || 'event'})`
                  : ''}
              </option>
            ))}
          </select>
          <select value={tag} onChange={e => setTag(e.target.value)} className="input" aria-label="Technology">
            <option value="">All Technologies</option>
            {filters.tags.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && !result ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load projects" message={error} onRetry={() => setReloadKey(key => key + 1)} />
      ) : result.items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects found"
          description={hasFilters ? 'Try adjusting your search or filters.' : 'Submitted projects will appear here.'}
          action={
            hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-brand-600 mb-4">
            {result.total} project{result.total === 1 ? '' : 's'}
            {loading && <LoadingSpinner size="sm" className="inline ml-2" />}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.items.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {result.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-brand-600">
                Page {result.page} of {result.pages}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= result.pages} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

const ProjectCard = ({ project }) => (
  <Link to={`/gallery/${project.id}`} className="block h-full">
    <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer overflow-hidden flex flex-col">
      <ProjectThumbnail url={project.thumbnail_url} title={project.title} className="h-40 rounded-t-lg" />
      <CardContent className="pt-6 space-y-4 flex-1 flex flex-col">
        <div>
          <h3 className="font-semibold text-lg text-brand-900 mb-1">{project.title}</h3>
          <p className="text-sm text-brand-600 line-clamp-2">{project.tagline}</p>
        </div>

        <div>
          <p className="text-xs text-brand-600 font-medium mb-2">
            {project.team_name} · {project.event_name}
          </p>
          {project.track_name && <Badge variant="primary">{project.track_name}</Badge>}
        </div>

        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map(tech => (
            <span key={tech} className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded">
              {tech}
            </span>
          ))}
          {project.tags.length > 3 && <span className="text-xs text-brand-600 px-2 py-1">+{project.tags.length - 3}</span>}
        </div>

        <div className="flex items-center justify-between text-sm text-brand-600 pt-2 border-t border-brand-200 mt-auto">
          <span>{formatDate(project.submitted_at)}</span>
          <span className="text-accent-600 font-medium">View →</span>
        </div>
      </CardContent>
    </Card>
  </Link>
);
