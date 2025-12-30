
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  // FIX: Add 'purple' to the list of available colors to support all order statuses.
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    // FIX: Add styles for the 'purple' color variant.
    purple: 'bg-purple-100 text-purple-800',
  };

  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  return (
    <span className={`${baseClasses} ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};