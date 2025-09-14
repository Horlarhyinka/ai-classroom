'use client'

import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  className, 
  children, 
  onClick,
  hover = false
}) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-xl shadow-apple-sm border border-gray-100',
        hover && 'transition-all duration-200 hover:shadow-apple-md hover:scale-[1.01]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div 
      className={cn('p-6 flex flex-col space-y-1.5', className)}
      >
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return (
    <h3 
      className={cn('text-lg font-semibold text-gray-900', className)}
      >
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, children }) => {
  return (
    <p 
      className={cn('text-sm text-gray-500', className)}
      >
      {children}
    </p>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return (
    <div 
      className={cn('p-6 pt-0', className)}
      >
      {children}
    </div>
  );
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return (
    <div 
      className={cn('p-6 pt-0 flex items-center', className)}
      >
      {children}
    </div>
  );
};