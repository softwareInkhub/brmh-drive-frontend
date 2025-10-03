'use client';

import { useBreadcrumbs, useViewMode, useSetViewMode, useSortOption, useSetSortOption } from '@/lib/store-client';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Grid3X3, List, ArrowUpDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { getSortDisplayName } from '@/lib/sorting';

interface PageHeaderProps {
  isMobile?: boolean;
}

export function PageHeader({ isMobile = false }: PageHeaderProps) {
  const breadcrumbs = useBreadcrumbs();
  const viewMode = useViewMode();
  const setViewMode = useSetViewMode();
  const sortOption = useSortOption();
  const setSortOption = useSetSortOption();

  return (
    <div className="border-b border-border bg-background">
      <div className="px-3 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Breadcrumbs */}
          <div className="flex-1 min-w-0">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Right: View Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* View Toggle */}
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r border-border"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {getSortDisplayName(sortOption.field)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setSortOption({ field: 'name', direction: 'asc' })}
                  className={sortOption.field === 'name' && sortOption.direction === 'asc' ? 'bg-accent' : ''}
                >
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption({ field: 'name', direction: 'desc' })}
                  className={sortOption.field === 'name' && sortOption.direction === 'desc' ? 'bg-accent' : ''}
                >
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption({ field: 'modifiedAt', direction: 'desc' })}
                  className={sortOption.field === 'modifiedAt' && sortOption.direction === 'desc' ? 'bg-accent' : ''}
                >
                  Modified (Newest)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption({ field: 'modifiedAt', direction: 'asc' })}
                  className={sortOption.field === 'modifiedAt' && sortOption.direction === 'asc' ? 'bg-accent' : ''}
                >
                  Modified (Oldest)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption({ field: 'size', direction: 'desc' })}
                  className={sortOption.field === 'size' && sortOption.direction === 'desc' ? 'bg-accent' : ''}
                >
                  Size (Largest)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption({ field: 'size', direction: 'asc' })}
                  className={sortOption.field === 'size' && sortOption.direction === 'asc' ? 'bg-accent' : ''}
                >
                  Size (Smallest)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption({ field: 'type', direction: 'asc' })}
                  className={sortOption.field === 'type' && sortOption.direction === 'asc' ? 'bg-accent' : ''}
                >
                  Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
