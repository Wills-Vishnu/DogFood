import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, Play } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader } from '../common';
import { formatDate } from '../../utils/format';

export const ProjectThumbnail = ({ url, title, className = '' }) =>
  url ? (
    <img src={url} alt="" className={`w-full object-cover ${className}`} />
  ) : (
    <div className={`bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center ${className}`}>
      <span className="text-4xl font-bold text-accent-600 opacity-30">{(title || '?').charAt(0)}</span>
    </div>
  );

const ExternalButton = ({ href, icon: Icon, label, variant = 'secondary' }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    <Button variant={variant}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  </a>
);

// Shared by the public project page and the participant preview so both render identically.
export const ProjectShowcase = ({ project, actions }) => (
  <div className="grid lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-8">
      <Card className="overflow-hidden">
        <ProjectThumbnail url={project.thumbnailUrl} title={project.title} className="h-64" />
        <CardContent className="pt-8">
          <h1 className="text-3xl font-bold text-brand-900 mb-2">{project.title || 'Untitled project'}</h1>
          <p className="text-lg text-brand-600 mb-4">{project.tagline}</p>
          {project.trackName && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="primary">{project.trackName}</Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {project.liveUrl && <ExternalButton href={project.liveUrl} icon={ExternalLink} label="Visit Project" variant="primary" />}
            {project.repoUrl && <ExternalButton href={project.repoUrl} icon={Github} label="Source Code" />}
            {project.videoUrl && <ExternalButton href={project.videoUrl} icon={Play} label="Demo Video" />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="About This Project" />
        <CardContent>
          <p className="text-brand-700 whitespace-pre-line">{project.description}</p>
        </CardContent>
      </Card>

      {project.images.length > 0 && (
        <Card>
          <CardHeader title="Image Gallery" />
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {project.images.map((url, index) => (
                <a key={`${url}-${index}`} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-56 object-cover rounded-lg" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {project.tags.length > 0 && (
        <Card>
          <CardHeader title="Technologies" subtitle="Tech stack used" />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tech => (
                <Badge key={tech} variant="primary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    <div className="space-y-6">
      {actions}
      <Card>
        <CardHeader title="Team" subtitle={project.teamName} />
        <CardContent>
          <ul className="space-y-2">
            {project.members.map(name => (
              <li key={name} className="p-3 bg-brand-50 rounded-lg font-medium text-brand-900">
                {name}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Info" />
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-brand-600 font-medium">Event</p>
            <Link to={`/events/${project.event.id}`} className="text-accent-600 hover:text-accent-700">
              {project.event.name}
            </Link>
          </div>
          {project.trackName && (
            <div>
              <p className="text-brand-600 font-medium">Track</p>
              <p className="text-brand-900">{project.trackName}</p>
            </div>
          )}
          <div>
            <p className="text-brand-600 font-medium">Submitted</p>
            <p className="text-brand-900">{project.submittedAt ? formatDate(project.submittedAt) : 'Not yet submitted'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
