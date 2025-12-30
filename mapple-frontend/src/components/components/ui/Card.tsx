import React from 'react';

// FIX: Allow passing additional props (like onClick) to the Card component.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div className={`bg-surface rounded-3xl shadow-soft border border-transparent ${className}`} {...props}>
      {children}
    </div>
  );
};

// FIX: Allow passing additional props (like onClick) to the CardContent component to resolve errors.
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', ...props }) => {
    return <div className={`p-6 ${className}`} {...props}>{children}</div>;
}

// FIX: Allow passing additional props (like onClick) to the CardHeader component.
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', ...props }) => {
    return <div className={`p-6 border-b border-gray-50 ${className}`} {...props}>{children}</div>
}