import React from 'react';

export const Card = ({ children, className = '', elevated = false }) => (
  <div className={`card ${elevated ? 'card-lg' : ''} ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, children, className = '' }) => (
  <div className={`border-b border-brand-200 px-lg py-lg ${className}`}>
    {title && <h3 className="text-lg font-semibold text-brand-900">{title}</h3>}
    {subtitle && <p className="text-sm text-brand-600 mt-xs">{subtitle}</p>}
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-lg py-lg ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-brand-200 px-lg py-lg bg-brand-50 rounded-b-lg flex items-center justify-between ${className}`}>
    {children}
  </div>
);
