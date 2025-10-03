'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useTabs, 
  useActiveTab, 
  useAddTab, 
  useRemoveTab, 
  useSetActiveTab, 
  useCloseAllTabs, 
  useCloseOtherTabs 
} from '@/lib/store-client';
import { useTabNavigation } from '@/lib/use-tab-navigation';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  X, 
  Plus, 
  MoreHorizontal, 
  Pin, 
  PinOff,
  Folder,
  Search,
  Clock,
  Star,
  Users,
  Trash2,
  Settings,
  File,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tab, TabType } from '@/lib/types';

interface TabBarProps {
  isMobile?: boolean;
}

const getTabIcon = (type: TabType) => {
  switch (type) {
    case 'folder':
      return <Folder className="w-3 h-3" />;
    case 'search':
      return <Search className="w-3 h-3" />;
    case 'recent':
      return <Clock className="w-3 h-3" />;
    case 'starred':
      return <Star className="w-3 h-3" />;
    case 'shared':
      return <Users className="w-3 h-3" />;
    case 'trash':
      return <Trash2 className="w-3 h-3" />;
    case 'settings':
      return <Settings className="w-3 h-3" />;
    case 'preview':
      return <File className="w-3 h-3" />;
    default:
      return <Folder className="w-3 h-3" />;
  }
};

export function TabBar({ isMobile = false }: TabBarProps) {
  const router = useRouter();
  const tabs = useTabs();
  const activeTab = useActiveTab();
  const addTab = useAddTab();
  const removeTab = useRemoveTab();
  const setActiveTab = useSetActiveTab();
  const closeAllTabs = useCloseAllTabs();
  const closeOtherTabs = useCloseOtherTabs();
  const { handleTabClick } = useTabNavigation();
  
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll state
  const checkScrollState = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    const nextCanScrollLeft = scrollLeft > 0;
    const nextCanScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
    const nextShowScrollButtons = scrollWidth > clientWidth;

    // Only update when values actually change to avoid update loops
    setCanScrollLeft((prev) => (prev !== nextCanScrollLeft ? nextCanScrollLeft : prev));
    setCanScrollRight((prev) => (prev !== nextCanScrollRight ? nextCanScrollRight : prev));
    setShowScrollButtons((prev) => (prev !== nextShowScrollButtons ? nextShowScrollButtons : prev));
  };

  useEffect(() => {
    // initialize once and when tabs count changes (not on every re-render)
    const container = scrollContainerRef.current;
    const handle = () => checkScrollState();
    // Schedule measurement after paint
    requestAnimationFrame(handle);
    if (container) {
      container.addEventListener('scroll', handle);
    }
    window.addEventListener('resize', handle);
    return () => {
      if (container) container.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
  }, [tabs.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const onTabClick = (tab: Tab) => {
    handleTabClick(tab);
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    
    // If we're closing the active tab, switch to the previous tab first
    if (activeTab && activeTab.id === tabId) {
      const currentIndex = tabs.findIndex(tab => tab.id === tabId);
      const previousTab = tabs[currentIndex - 1] || tabs[currentIndex + 1];
      
      if (previousTab) {
        // Switch to the previous tab and navigate to its URL
        setActiveTab(previousTab.id);
        router.push(previousTab.url);
      } else {
        // No other tabs, navigate to home page
        router.push('/');
      }
    }
    
    removeTab(tabId);
  };

  const handleNewTab = () => {
    // Check if there's already a "My BRMH Drive" tab
    const existingHomeTab = tabs.find(tab => 
      tab.type === 'folder' && tab.folderId === 'root'
    );
    
    if (existingHomeTab) {
      // Switch to existing home tab
      setActiveTab(existingHomeTab.id);
      router.push('/');
    } else {
      // Create new tab
      addTab({
        type: 'folder',
        title: 'New Tab',
        url: '/',
        folderId: 'root',
      });
    }
  };

  const handleTabContextMenu = (e: React.MouseEvent, tab: Tab) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const scrollToActiveTab = () => {
    if (scrollContainerRef.current && activeTab) {
      const activeTabElement = scrollContainerRef.current.querySelector(`[data-tab-id="${activeTab.id}"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  useEffect(() => {
    scrollToActiveTab();
  }, [activeTab?.id]);

  if (isMobile) {
    // Mobile: Show only active tab with dropdown for others
    return (
      <div className="h-10 border-b border-border bg-background flex items-center px-2 py-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {activeTab && (
            <div className="flex items-center space-x-1 min-w-0 flex-1">
              {getTabIcon(activeTab.type)}
              <span className="text-sm truncate">{activeTab.title}</span>
            </div>
          )}
          
          {tabs.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {tabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.id}
                    onClick={() => onTabClick(tab)}
                    className={cn(
                      "flex items-center justify-between",
                      tab.isActive && "bg-accent"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      {getTabIcon(tab.type)}
                      <span className="truncate max-w-[200px]">{tab.title}</span>
                    </div>
                    {!tab.isPinned && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTabClose(e, tab.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleNewTab}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Tab
                </DropdownMenuItem>
                {tabs.length > 1 && (
                  <>
                    <DropdownMenuItem onClick={() => closeOtherTabs(activeTab?.id || '')}>
                      Close Others
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={closeAllTabs}>
                      Close All
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewTab}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Desktop: Full tab bar
  return (
    <div className="h-10 border-b border-border bg-background flex items-center py-2">
      {/* Scroll Left Button */}
      {showScrollButtons && canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => scroll('left')}
          className="h-8 w-8 p-0 ml-1 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Tabs Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-hide min-w-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-center space-x-1 px-1 min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              className={cn(
                "group flex items-center space-x-1 px-3 py-1.5 rounded-t-md cursor-pointer transition-all duration-200 min-w-0 max-w-[240px]",
                tab.isActive
                  ? "bg-background border-t border-l border-r border-border shadow-sm"
                  : "bg-muted/50 hover:bg-muted border-t border-l border-r border-transparent hover:border-border/50"
              )}
              onClick={() => onTabClick(tab)}
              onContextMenu={(e) => handleTabContextMenu(e, tab)}
            >
              {/* Tab Icon */}
              <div className="shrink-0">
                {getTabIcon(tab.type)}
              </div>
              
              {/* Tab Title */}
              <span className={cn(
                "text-sm truncate",
                tab.isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {tab.title}
              </span>
              
              {/* Pin Icon */}
              {tab.isPinned && (
                <Pin className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
              
              {/* Close Button */}
              {!tab.isPinned && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => handleTabClose(e, tab.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Right Button */}
      {showScrollButtons && canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => scroll('right')}
          className="h-8 w-8 p-0 mr-1 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* New Tab Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNewTab}
        className="h-8 w-8 p-0 mr-2 shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
