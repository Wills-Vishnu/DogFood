import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export const Skeleton = ({ className = '' }) => (
  <div className={`bg-brand-200 animate-pulse rounded ${className}`} />
);

export const CardSkeleton = ({ count = 3 }) => (
  <div className="space-y-lg">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-lg space-y-lg">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
);

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader2 className={`animate-spin text-accent-600 ${sizes[size]} ${className}`} />
  );
};

export const LoadingPage = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-lg" />
      <p className="text-brand-600">{message}</p>
    </div>
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center max-w-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full mb-lg">
        <AlertCircle className="w-8 h-8 text-danger-600" />
      </div>
      <h3 className="text-lg font-semibold text-brand-900 mb-sm">{title}</h3>
      {message && <p className="text-brand-600 mb-lg">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
  <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
    <div className="text-center max-w-sm">
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-full mb-lg">
          <Icon className="w-8 h-8 text-brand-600" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-brand-900 mb-sm">{title}</h3>
      {description && <p className="text-brand-600 mb-lg">{description}</p>}
      {action}
    </div>
  </div>
);

export const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  const types = {
    info: { bg: 'bg-accent-50', border: 'border-accent-200', text: 'text-accent-800', icon: 'text-accent-600' },
    success: { bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-800', icon: 'text-success-600' },
    warning: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-800', icon: 'text-warning-600' },
    error: { bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-800', icon: 'text-danger-600' },
  };

  const config = types[type];

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-lg px-lg py-md flex items-start justify-between ${className}`}
    >
      <div>
        {title && <h4 className={`font-semibold ${config.text}`}>{title}</h4>}
        {message && <p className={`text-sm mt-xs ${config.text}`}>{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`text-xl ${config.icon} hover:opacity-60 ml-lg flex-shrink-0`}
        >
          ×
        </button>
      )}
    </div>
  );
};
