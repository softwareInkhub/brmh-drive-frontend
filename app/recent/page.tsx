'use client';

import { useViewMode, useSelectedIds } from '@/lib/store-client';

export default function RecentPage() {
  const viewMode = useViewMode();
  const selectedIds = useSelectedIds();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Recent</h1>
        <p className="text-muted-foreground">
          Files and folders you&apos;ve recently accessed
        </p>
      </div>

      {/* Empty State - Recent functionality not yet implemented in backend */}
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Recent activity coming soon</h2>
        <p className="text-muted-foreground mt-2">
          Recent files and folders will appear here once the feature is implemented.
        </p>
      </div>
    </div>
  );
}
