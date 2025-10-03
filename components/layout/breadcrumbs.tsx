'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  // On mobile, show only the last item or first + last if more than 2 items
  const shouldShowMobile = items.length > 2;
  const displayItems = shouldShowMobile ? [items[0], items[items.length - 1]] : items;

  return (
    <nav className={cn("flex items-center space-x-1", className)}>
      {displayItems.map((item, index) => {
        const originalIndex = items.findIndex(originalItem => originalItem.id === item.id);
        const isLast = originalIndex === items.length - 1;
        const isFirst = originalIndex === 0;
        
        return (
          <div key={item.id} className="flex items-center">
            {isFirst && (
              <Home className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mr-1" />
            )}
            
            {isLast ? (
              // Last item (current page) - not clickable
              <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[120px] sm:max-w-none">
                {item.name}
              </span>
            ) : (
              // Clickable breadcrumb items
              <Link
                href={item.id === 'root' ? '/' : `/folder/${item.id}`}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-[80px] sm:max-w-none"
              >
                {item.name}
              </Link>
            )}
            
            {!isLast && (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mx-1" />
            )}
            
            {/* Show ellipsis on mobile when there are hidden items */}
            {shouldShowMobile && isFirst && (
              <span className="text-xs text-muted-foreground mx-1">...</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
