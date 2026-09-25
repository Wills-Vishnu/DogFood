import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { Button, EmptyState } from '../common';

export const OrganizerEventPicker = ({ events, selected, onSelect }) => (
  <select
    className="input sm:w-72"
    value={selected?.id || ''}
    onChange={e => onSelect(e.target.value)}
    aria-label="Choose event"
  >
    {events.map(event => (
      <option key={event.id} value={event.id}>
        {event.name}
        {event.is_published ? '' : ' (draft)'}
      </option>
    ))}
  </select>
);

export const NoManagedEvents = () => (
  <EmptyState
    icon={CalendarPlus}
    title="No events yet"
    description="Create your first hackathon to start accepting participants."
    action={
      <Link to="/organizer/events/new">
        <Button variant="primary">Create Event</Button>
      </Link>
    }
  />
);

export const OrganizerHeader = ({ title, subtitle, events, selected, onSelect, actions }) => (
  <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div>
      <h1 className="text-4xl font-bold text-brand-900 mb-2">{title}</h1>
      {subtitle && <p className="text-lg text-brand-600">{subtitle}</p>}
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      {events && events.length > 1 && <OrganizerEventPicker events={events} selected={selected} onSelect={onSelect} />}
      {actions}
    </div>
  </div>
);
