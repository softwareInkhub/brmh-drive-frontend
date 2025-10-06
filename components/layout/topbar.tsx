'use client';

import { useState } from 'react';
import {
  useSearchQuery,
  useSetSearchQuery,
  useOpenModal,
} from '@/lib/store-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, HelpCircle, Bell, Menu, X, XCircle } from 'lucide-react';
import { UserProfileDropdown } from '@/components/ui/user-profile-dropdown';

interface TopbarProps {
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Topbar({
  isMobile = false,
  mobileMenuOpen = false,
  onMobileMenuToggle,
}: TopbarProps) {
  const searchQuery = useSearchQuery();
  const setSearchQuery = useSetSearchQuery();
  const openModal = useOpenModal();
  const router = useRouter();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleNewClick = () => {
    openModal('new');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/') {
      e.preventDefault();
      // Focus search input
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleSearchSubmit = () => {
    // Update the URL with search query to stay on home page
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    // If we're on search page, navigate back to home
    if (window.location.pathname === '/search') {
      router.push('/');
    }
  };

  const handleMobileSearchClick = () => {
    setShowMobileSearch(true);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/search');
    }
    setShowMobileSearch(false);
  };

  return (
    <>
      {/* Mobile Search Overlay */}
      {isMobile && showMobileSearch && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          <div className="h-16 border-b border-border flex items-center justify-between px-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileSearch(false)}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
            <form
              onSubmit={handleMobileSearchSubmit}
              className="flex-1 mx-3 relative"
            >
              <Input
                placeholder="Search in Drive"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
                autoFocus
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={handleClearSearch}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </form>
            <Button
              type="submit"
              onClick={handleMobileSearchSubmit}
              className="shrink-0"
            >
              Search
            </Button>
          </div>
        </div>
      )}

      <div className="h-16 border-b border-border bg-background flex items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile Menu + Desktop Search */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* Desktop Search (Left side) */}
          {!isMobile && (
            <div className="max-w-xl w-96">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
                className="relative"
              >
                <Input
                  placeholder="Search in Drive"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-4 pr-12"
                  autoComplete="off"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={handleClearSearch}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Mobile Search Button */}
          {isMobile && !showMobileSearch && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={handleMobileSearchClick}
            >
              <Search className="w-4 h-4" />
            </Button>
          )}

          {/* New Button */}
          <Button
            onClick={handleNewClick}
            className="bg-primary hover:bg-primary/90 shrink-0"
            size={isMobile ? 'sm' : 'default'}
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            {!isMobile && 'New'}
          </Button>

          {/* Help (Hidden on mobile) */}
          {!isMobile && (
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="shrink-0">
            <Bell className="w-4 h-4" />
          </Button>

          {/* User Profile Dropdown */}
          <UserProfileDropdown />
        </div>
      </div>
    </>
  );
}
