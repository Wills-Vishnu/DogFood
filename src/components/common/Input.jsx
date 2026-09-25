import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Input = React.forwardRef((
  { label, error, type = 'text', className = '', ...props },
  ref
) => {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-xs mt-xs text-danger-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = React.forwardRef((
  { label, error, rows = 4, className = '', ...props },
  ref
) => {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`input ${error ? 'input-error' : ''} resize-none ${className}`}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-xs mt-xs text-danger-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = React.forwardRef((
  { label, error, options = [], className = '', ...props },
  ref
) => {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center gap-xs mt-xs text-danger-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export const Checkbox = React.forwardRef((
  { label, className = '', ...props },
  ref
) => {
  return (
    <label className="flex items-center gap-md cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        className={`w-4 h-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500 ${className}`}
        {...props}
      />
      {label && <span className="text-sm text-brand-700">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
