'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  useTabs, 
  useAddTab, 
  useSetActiveTab, 
  useUpdateTab,
  useSetBreadcrumbs,
  useSetCurrentFolderId 
} from '@/lib/store-client';
import { Tab, TabType } from '@/lib/types';

export function useTabNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = useTabs();
  const addTab = useAddTab();
  const setActiveTab = useSetActiveTab();
  const updateTab = useUpdateTab();
  const setBreadcrumbs = useSetBreadcrumbs();
  const setCurrentFolderId = useSetCurrentFolderId();

  // Get tab type and info from current route
  const getTabInfoFromRoute = (): { type: TabType; title: string; url: string; folderId?: string; fileId?: string; searchQuery?: string } => {
    const searchQuery = searchParams.get('q');
    
    // Handle search on home page - don't create search tabs
    if (pathname === '/' && searchQuery) {
      return {
        type: 'folder',
        title: `Search: ${searchQuery}`,
        url: `/?q=${encodeURIComponent(searchQuery)}`,
        folderId: 'root',
        searchQuery: searchQuery,
      };
    }
    
    if (pathname === '/search') {
      return {
        type: 'search',
        title: searchQuery ? `Search: ${searchQuery}` : 'Search',
        url: searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search',
        searchQuery: searchQuery || undefined,
      };
    }
    
    if (pathname === '/') {
      return {
        type: 'folder',
        title: 'My BRMH Drive',
        url: '/',
        folderId: 'root',
      };
    }
    
    if (pathname === '/recent') {
      return {
        type: 'recent',
        title: 'Recent',
        url: '/recent',
      };
    }
    
    if (pathname === '/starred') {
      return {
        type: 'starred',
        title: 'Starred',
        url: '/starred',
      };
    }
    
    if (pathname === '/shared') {
      return {
        type: 'shared',
        title: 'Shared with me',
        url: '/shared',
      };
    }
    
    if (pathname === '/trash') {
      return {
        type: 'trash',
        title: 'Trash',
        url: '/trash',
      };
    }
    
    if (pathname === '/settings') {
      return {
        type: 'settings',
        title: 'Settings',
        url: '/settings',
      };
    }
    
    // Preview route
    if (pathname.startsWith('/preview/')) {
      const fileId = pathname.split('/preview/')[1];
      return {
        type: 'preview',
        title: `Preview ${fileId}`, // This will be updated by the preview page
        url: `/preview/${fileId}`,
        fileId,
      };
    }
    
    // Folder route
    if (pathname.startsWith('/folder/')) {
      const folderId = pathname.split('/folder/')[1];
      return {
        type: 'folder',
        title: `Folder ${folderId}`, // This will be updated with actual folder name
        url: `/folder/${folderId}`,
        folderId,
      };
    }
    
    // Root folder
    return {
      type: 'folder',
      title: 'My BRMH Drive',
      url: '/',
      folderId: 'root',
    };
  };

  // Find or create tab for current route
  const ensureTabForCurrentRoute = () => {
    const currentTabInfo = getTabInfoFromRoute();
    const currentUrl = currentTabInfo.url;
    
    // Special handling for search - update the current active tab but KEEP the title
    if (currentTabInfo.type === 'search') {
      const activeTab = tabs.find(tab => tab.isActive);
      if (activeTab) {
        updateTab(activeTab.id, {
          url: currentUrl,
          searchQuery: currentTabInfo.searchQuery,
          isActive: true,
        });
        return;
      }
    }

    // Special handling for folder - update the active tab but KEEP the title
    if (currentTabInfo.type === 'folder') {
      const activeTab = tabs.find(tab => tab.isActive);
      if (activeTab) {
        updateTab(activeTab.id, {
          url: currentUrl,
          folderId: currentTabInfo.folderId,
          isActive: true,
        });
        return;
      }
    }
    
    // Check if there's already a tab for this route
    const existingTab = tabs.find(tab => {
      if (tab.type !== currentTabInfo.type) return false;
      
      if (tab.type === 'search') {
        return tab.searchQuery === currentTabInfo.searchQuery;
      }
      
      if (tab.type === 'folder') {
        return tab.folderId === currentTabInfo.folderId;
      }
      
      // For other types, compare the URL
      return tab.url === currentUrl;
    });
    
    if (existingTab) {
      // Update existing tab and make it active
      updateTab(existingTab.id, {
        title: currentTabInfo.title,
        url: currentUrl,
        isActive: true,
      });
      setActiveTab(existingTab.id);
    } else {
      // Create new tab
      addTab({
        type: currentTabInfo.type,
        title: currentTabInfo.title,
        url: currentUrl,
        folderId: currentTabInfo.folderId,
        searchQuery: currentTabInfo.searchQuery,
      });
    }
  };

  // Update breadcrumbs based on current route
  const updateBreadcrumbsFromRoute = () => {
    const currentTabInfo = getTabInfoFromRoute();
    
    if (currentTabInfo.type === 'folder') {
      if (currentTabInfo.folderId === 'root') {
        setBreadcrumbs([{ id: 'root', name: 'My BRMH Drive' }]);
        setCurrentFolderId(null);
      } else {
        // Defer to folder page, which uses API path with real names
        setCurrentFolderId(currentTabInfo.folderId!);
        return;
      }
    } else {
      setBreadcrumbs([{ id: currentTabInfo.type, name: currentTabInfo.title }]);
      setCurrentFolderId(null);
    }
  };

  // Handle route changes
  useEffect(() => {
    ensureTabForCurrentRoute();
    updateBreadcrumbsFromRoute();
  }, [pathname, searchParams]);

  // Handle tab clicks
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    router.push(tab.url);
  };

  // Create new tab for a specific route
  const createTabForRoute = (type: TabType, title: string, url: string, folderId?: string, searchQuery?: string) => {
    addTab({
      type,
      title,
      url,
      folderId,
      searchQuery,
    });
    router.push(url);
  };

  // Helper function to create or switch to a tab for a specific route
  const navigateToRoute = (type: TabType, title: string, url: string, folderId?: string, searchQuery?: string) => {
    // Special handling for search - update current tab but KEEP the title
    if (type === 'search') {
      const activeTab = tabs.find(tab => tab.isActive);
      if (activeTab) {
        updateTab(activeTab.id, {
          url,
          searchQuery,
          isActive: true,
        });
        router.push(url);
        return;
      }
    }

    // Special handling for folder - keep navigation in the same tab and KEEP the title
    if (type === 'folder') {
      const activeTab = tabs.find(tab => tab.isActive);
      if (activeTab) {
        updateTab(activeTab.id, {
          url,
          folderId,
          isActive: true,
        });
        router.push(url);
        return;
      }
    }
    
    const existingTab = tabs.find(tab => {
      if (tab.type !== type) return false;
      
      if (type === 'search') {
        return tab.searchQuery === searchQuery;
      }
      
      if (type === 'folder') {
        return tab.folderId === folderId;
      }
      
      return tab.url === url;
    });
    
    if (existingTab) {
      // Switch to existing tab
      setActiveTab(existingTab.id);
      router.push(url);
    } else {
      // Create new tab
      addTab({
        type,
        title,
        url,
        folderId,
        searchQuery,
      });
      router.push(url);
    }
  };

  return {
    handleTabClick,
    createTabForRoute,
    navigateToRoute,
    getTabInfoFromRoute,
  };
}
