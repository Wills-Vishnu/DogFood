const FIELD_LABELS = {
  title: 'Project name',
  tagline: 'Tagline',
  description: 'Description',
  track_id: 'Track',
  thumbnail_url: 'Thumbnail',
  demo_video_url: 'Demo video URL',
  repo_url: 'Repository URL',
  live_url: 'Live project URL',
  tags: 'Technologies',
  images: 'Image gallery',
};

export function fieldLabel(key, event) {
  const answer = key.match(/^answers\.(\d+)$/);
  if (answer) {
    const question = event?.questions.find(item => item.id === Number(answer[1]));
    return question ? `"${question.prompt}"` : 'A required question';
  }
  return FIELD_LABELS[key.split('.')[0]] || key;
}

export const describeMissing = (missing, event) => Object.keys(missing || {}).map(key => fieldLabel(key, event));
