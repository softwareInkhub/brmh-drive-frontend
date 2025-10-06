'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}
      ></div>
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" text="Authenticating..." />
    </div>
  );
}
