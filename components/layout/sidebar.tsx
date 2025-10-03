'use client';

// import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStorageInfo } from '@/lib/hooks';
import { useSidebarCollapsed, useSetSidebarCollapsed } from '@/lib/store-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  Clock, 
  Star, 
  Users, 
  Trash2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Folder,
  HardDrive
} from 'lucide-react';

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Recent', href: '/recent', icon: Clock },
  { name: 'Starred', href: '/starred', icon: Star },
  { name: 'Shared with Me', href: '/shared', icon: Users },
  { name: 'Trash', href: '/trash', icon: Trash2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  onMobileMenuClose?: () => void;
}

export function Sidebar({ onMobileMenuClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarCollapsed = useSidebarCollapsed();
  const setSidebarCollapsed = useSetSidebarCollapsed();
  // Use mock storage data until backend implements the endpoint
  const storageInfo = {
    usedBytes: 3.9 * 1024 * 1024 * 1024, // 3.9 GB
    quotaBytes: 9.3 * 1024 * 1024 * 1024, // 9.3 GB
  };

  const storagePercentage = Math.round((storageInfo.usedBytes / storageInfo.quotaBytes) * 100);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className={cn(
      "brmh-sidebar h-screen flex flex-col transition-all duration-300",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">BRMH Drive</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 p-0"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href} onClick={onMobileMenuClose}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10",
                  sidebarCollapsed && "px-2"
                )}
              >
                <Icon className={cn("w-4 h-4", !sidebarCollapsed && "mr-3")} />
                {!sidebarCollapsed && item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Quick Access */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Quick Access</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              {/* Mock quick access folders */}
              {['Documents', 'Images', 'Videos', 'Music', 'Projects', 'Backups'].map((name) => (
                <Button
                  key={name}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-sm"
                  onClick={onMobileMenuClose}
                >
                  <Folder className="w-3 h-3 mr-2" />
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Storage */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage</span>
                  <span className="text-xs text-muted-foreground">
                    {storagePercentage}% used
                  </span>
                </div>
                <Progress value={storagePercentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {storageInfo && (
                    <>
                      {formatBytes(storageInfo.usedBytes)} of {formatBytes(storageInfo.quotaBytes)} used
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
