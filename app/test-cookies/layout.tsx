import { ReactNode } from 'react';

export default function TestCookiesLayout({ children }: { children: ReactNode }) {
  // Completely bypass the root layout - no AuthGuard, no providers, nothing
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

