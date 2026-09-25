import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef((
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    ...props
  },
  ref
) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
  };

  const sizeClasses = {
    sm: 'btn-small',
    md: '',
    lg: 'btn-large',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
