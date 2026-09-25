import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { Button, EmptyState } from '../common';

export const EventSwitcher = ({ items, current, onSelect }) =>
  items.length > 1 ? (
    <select
      className="input sm:w-72"
      value={current.event.id}
      onChange={e => onSelect(e.target.value)}
      aria-label="Choose event"
    >
      {items.map(item => (
        <option key={item.event.id} value={item.event.id}>
          {item.event.name}
        </option>
      ))}
    </select>
  ) : null;

export const NoRegisteredEvents = () => (
  <EmptyState
    icon={CalendarPlus}
    title="You haven't joined an event yet"
    description="Register for a hackathon to form a team and submit a project."
    action={
      <Link to="/events">
        <Button variant="primary">Browse Events</Button>
      </Link>
    }
  />
);

export const PageHeader = ({ title, subtitle, items, current, onSelect }) => (
  <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
      <h1 className="text-4xl font-bold text-brand-900 mb-2">{title}</h1>
      {subtitle && <p className="text-lg text-brand-600">{subtitle}</p>}
    </div>
    {current && <EventSwitcher items={items} current={current} onSelect={onSelect} />}
  </div>
);
