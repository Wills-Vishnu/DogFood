import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
    secondary: 'badge-neutral',
  };

  return (
    <span className={`badge ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const statuses = {
    draft: { variant: 'warning', label: 'Draft' },
    submitted: { variant: 'success', label: 'Submitted' },
    in_progress: { variant: 'primary', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    pending: { variant: 'warning', label: 'Pending' },
    accepted: { variant: 'success', label: 'Accepted' },
    rejected: { variant: 'danger', label: 'Rejected' },
    upcoming: { variant: 'primary', label: 'Upcoming' },
    active: { variant: 'success', label: 'Active' },
    closed: { variant: 'danger', label: 'Closed' },
    accepting: { variant: 'success', label: 'Accepting' },
  };

  const config = statuses[status] || { variant: 'primary', label: status };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export const StatusIndicator = ({ status, className = '' }) => {
  const config = {
    pending: { icon: Clock, color: 'text-warning-600', label: 'Pending' },
    in_progress: { icon: Clock, color: 'text-accent-600', label: 'In Progress' },
    completed: { icon: CheckCircle, color: 'text-success-600', label: 'Completed' },
    error: { icon: AlertCircle, color: 'text-danger-600', label: 'Error' },
  };

  const cfg = config[status] || config.pending;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-sm ${className}`}>
      <Icon className={`w-4 h-4 ${cfg.color}`} />
      <span className="text-sm text-brand-700">{cfg.label}</span>
    </div>
  );
};

export const Tag = ({ children, variant = 'primary', onRemove, className = '' }) => (
  <span className={`inline-flex items-center gap-sm px-md py-sm rounded-full text-sm bg-${variant}-100 text-${variant}-800 ${className}`}>
    {children}
    {onRemove && (
      <button
        onClick={onRemove}
        className="text-${variant}-600 hover:text-${variant}-700 font-semibold"
      >
        ×
      </button>
    )}
  </span>
);
