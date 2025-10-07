import { ReactNode } from 'react';

export default function DebugAuthLayout({ children }: { children: ReactNode }) {
  // No AuthGuard here - this is a public debug page
  return <>{children}</>;
}

