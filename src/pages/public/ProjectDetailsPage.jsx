import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderX } from 'lucide-react';
import { Button, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner } from '../../components/common/ProtectedPage';
import { ProjectShowcase } from '../../components/projects/ProjectShowcase';
import { MainLayout } from '../../layouts/MainLayout';
import { galleryApi } from '../../api/endpoints';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProject(await galleryApi.project(id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <MainLayout>
        <PageSpinner />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        {error.status === 404 ? (
          <EmptyState
            icon={FolderX}
            title="Project not found"
            description="This project doesn't exist or hasn't been submitted yet."
            action={
              <Link to="/gallery">
                <Button variant="primary">Back to Gallery</Button>
              </Link>
            }
          />
        ) : (
          <ErrorState title="Couldn't load this project" message={error.message} onRetry={load} />
        )}
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Link to="/gallery" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Gallery
      </Link>
      <ProjectShowcase
        project={{
          title: project.title,
          tagline: project.tagline,
          description: project.description,
          thumbnailUrl: project.thumbnail_url,
          images: project.images,
          liveUrl: project.live_url,
          repoUrl: project.repo_url,
          videoUrl: project.demo_video_url,
          tags: project.tags,
          trackName: project.track?.name,
          teamName: project.team.name,
          members: project.team.members,
          event: project.event,
          submittedAt: project.submitted_at,
        }}
      />
    </MainLayout>
  );
};
