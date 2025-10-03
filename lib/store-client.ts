'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewMode, SortOption, ModalState, ID, Tab, TabType, TabState } from './types';

interface UIState {
  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Selection state
  selectedIds: Set<ID>;
  setSelectedIds: (ids: Set<ID>) => void;
  addSelectedId: (id: ID) => void;
  removeSelectedId: (id: ID) => void;
  clearSelection: () => void;
  toggleSelection: (id: ID) => void;
  
  // Modal state
  modals: ModalState;
  openModal: (type: keyof ModalState, data?: ID | boolean | { id: ID; type: 'file' | 'folder' }) => void;
  closeModal: (type: keyof ModalState) => void;
  closeAllModals: () => void;
  
  // Sort state
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Current folder state
  currentFolderId: ID | null;
  setCurrentFolderId: (id: ID | null) => void;
  
  // Breadcrumbs state
  breadcrumbs: Array<{ id: ID; name: string }>;
  setBreadcrumbs: (breadcrumbs: Array<{ id: ID; name: string }>) => void;
  
  // Tab state
  tabState: TabState;
  closedTabs: Set<string>; // Track closed tab IDs to prevent restoration
  addTab: (tab: Omit<Tab, 'id' | 'isActive'>) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepTabId: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // View state
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Selection state
      selectedIds: new Set(),
      setSelectedIds: (ids) => set({ selectedIds: ids }),
      addSelectedId: (id) => {
        const current = get().selectedIds;
        set({ selectedIds: new Set([...current, id]) });
      },
      removeSelectedId: (id) => {
        const current = get().selectedIds;
        const newSet = new Set(current);
        newSet.delete(id);
        set({ selectedIds: newSet });
      },
      clearSelection: () => set({ selectedIds: new Set() }),
      toggleSelection: (id) => {
        const current = get().selectedIds;
        const newSet = new Set(current);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        set({ selectedIds: newSet });
      },
      
      // Modal state
      modals: {},
      openModal: (type, data) => set((state) => ({
        modals: { ...state.modals, [type]: data ?? true }
      })),
      closeModal: (type) => set((state) => {
        const newModals = { ...state.modals };
        delete newModals[type];
        return { modals: newModals };
      }),
      closeAllModals: () => set({ modals: {} }),
      
      // Sort state
      sortOption: { field: 'name', direction: 'asc' },
      setSortOption: (option) => set({ sortOption: option }),
      
      // Search state
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Sidebar state
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // Current folder state
      currentFolderId: null,
      setCurrentFolderId: (id) => set({ currentFolderId: id }),
      
      // Breadcrumbs state
      breadcrumbs: [{ id: 'root', name: 'My BRMH Drive' }],
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      
      // Tab state
      tabState: {
        tabs: [
          {
            id: 'tab-1',
            type: 'folder',
            title: 'My BRMH Drive',
            url: '/',
            folderId: 'root',
            isActive: true,
            isPinned: true,
          }
        ],
        activeTabId: 'tab-1',
        nextTabId: 2,
      },
      closedTabs: new Set(),
      addTab: (newTab) => {
        const state = get();
        
        // Special handling for search tabs - don't create new tabs, just update current active tab
        if (newTab.type === 'search') {
          const activeTab = state.tabState.tabs.find(tab => tab.isActive);
          if (activeTab) {
            const updatedTabs = state.tabState.tabs.map(tab => 
              tab.id === activeTab.id 
                ? { ...tab, title: newTab.title, url: newTab.url, searchQuery: newTab.searchQuery, isActive: true }
                : tab // Keep other tabs unchanged
            );
            
            set({
              tabState: {
                ...state.tabState,
                tabs: updatedTabs,
                activeTabId: activeTab.id,
              }
            });
            return;
          }
        }
        
        // Check if a tab with the same type and identifier already exists
        const existingTab = state.tabState.tabs.find(tab => {
          if (tab.type !== newTab.type) return false;
          
          if (tab.type === 'search') {
            return tab.searchQuery === newTab.searchQuery;
          }
          
          if (tab.type === 'folder') {
            return tab.folderId === newTab.folderId;
          }
          
          // For other types, compare the URL
          return tab.url === newTab.url;
        });
        
        if (existingTab) {
          // If tab exists, just make it active instead of creating a new one
          const updatedTabs = state.tabState.tabs.map(t => ({
            ...t,
            isActive: t.id === existingTab.id,
          }));
          
          set({
            tabState: {
              ...state.tabState,
              tabs: updatedTabs,
              activeTabId: existingTab.id,
            }
          });
          return;
        }
        
        // Create new tab only if it doesn't exist
        const tabId = `tab-${state.tabState.nextTabId}`;
        const tab: Tab = {
          ...newTab,
          id: tabId,
          isActive: true,
        };
        
        // Deactivate all other tabs
        const updatedTabs = state.tabState.tabs.map(t => ({ ...t, isActive: false }));
        
        set({
          tabState: {
            tabs: [...updatedTabs, tab],
            activeTabId: tabId,
            nextTabId: state.tabState.nextTabId + 1,
          }
        });
      },
      removeTab: (tabId) => {
        const state = get();
        const tabs = state.tabState.tabs.filter(tab => tab.id !== tabId);
        
        // Add the closed tab to the closedTabs set
        const currentClosedTabs = state.closedTabs instanceof Set ? state.closedTabs : new Set();
        const newClosedTabs = new Set(currentClosedTabs);
        newClosedTabs.add(tabId);
        
        if (tabs.length === 0) {
          // If no tabs left, create a default tab
          const defaultTab: Tab = {
            id: 'tab-default',
            type: 'folder',
            title: 'My BRMH Drive',
            url: '/',
            folderId: 'root',
            isActive: true,
            isPinned: true,
          };
          set({
            tabState: {
              tabs: [defaultTab],
              activeTabId: 'tab-default',
              nextTabId: state.tabState.nextTabId,
            },
            closedTabs: newClosedTabs,
          });
        } else {
          // If we removed the active tab, activate the last tab
          let newActiveTabId = state.tabState.activeTabId;
          if (state.tabState.activeTabId === tabId) {
            newActiveTabId = tabs[tabs.length - 1].id;
            tabs[tabs.length - 1].isActive = true;
          }
          
          set({
            tabState: {
              ...state.tabState,
              tabs,
              activeTabId: newActiveTabId,
            },
            closedTabs: newClosedTabs,
          });
        }
      },
      setActiveTab: (tabId) => {
        const state = get();
        const updatedTabs = state.tabState.tabs.map(tab => ({
          ...tab,
          isActive: tab.id === tabId,
        }));
        
        set({
          tabState: {
            ...state.tabState,
            tabs: updatedTabs,
            activeTabId: tabId,
          }
        });
      },
      updateTab: (tabId, updates) => {
        const state = get();
        const tabs = state.tabState.tabs;
        const idx = tabs.findIndex((t) => t.id === tabId);
        if (idx === -1) return;
        const currentTab = tabs[idx];
        // Determine if the provided updates actually change anything
        let hasChange = false;
        for (const key of Object.keys(updates) as Array<keyof Tab>) {
          if (currentTab[key] !== updates[key]) {
            hasChange = true;
            break;
          }
        }
        if (!hasChange) return; // avoid unnecessary state updates -> prevents update loops

        const nextTab = { ...currentTab, ...updates } as Tab;
        const updatedTabs = tabs.map((tab) => (tab.id === tabId ? nextTab : tab));

        set({
          tabState: {
            ...state.tabState,
            tabs: updatedTabs,
          },
        });
      },
      closeAllTabs: () => {
        const defaultTab: Tab = {
          id: 'tab-default',
          type: 'folder',
          title: 'My BRMH Drive',
          url: '/',
          folderId: 'root',
          isActive: true,
          isPinned: true,
        };
        
        set({
          tabState: {
            tabs: [defaultTab],
            activeTabId: 'tab-default',
            nextTabId: 2,
          }
        });
      },
      closeOtherTabs: (keepTabId) => {
        const state = get();
        const keepTab = state.tabState.tabs.find(tab => tab.id === keepTabId);
        
        if (keepTab) {
          set({
            tabState: {
              tabs: [{ ...keepTab, isActive: true }],
              activeTabId: keepTabId,
              nextTabId: state.tabState.nextTabId,
            }
          });
        }
      },
    }),
    {
      name: 'brmh-drive-ui',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
        sortOption: state.sortOption,
        tabState: state.tabState,
        closedTabs: state.closedTabs,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert closedTabs back to Set if it's not already
          if (!(state.closedTabs instanceof Set)) {
            state.closedTabs = new Set(Array.isArray(state.closedTabs) ? state.closedTabs : []);
          }
          
          // Filter out closed tabs when restoring from storage
          const filteredTabs = state.tabState.tabs.filter(tab => !state.closedTabs.has(tab.id));
          
          // If no tabs left after filtering, create a default home tab
          if (filteredTabs.length === 0) {
            const defaultTab: Tab = {
              id: 'tab-default',
              type: 'folder',
              title: 'My BRMH Drive',
              url: '/',
              folderId: 'root',
              isActive: true,
              isPinned: true,
            };
            state.tabState.tabs = [defaultTab];
            state.tabState.activeTabId = 'tab-default';
          } else {
            state.tabState.tabs = filteredTabs;
            // Ensure at least one tab is active
            if (!filteredTabs.some(tab => tab.isActive)) {
              filteredTabs[0].isActive = true;
              state.tabState.activeTabId = filteredTabs[0].id;
            }
          }
        }
      },
    }
  )
);

// Selectors for common use cases
export const useViewMode = () => useUIStore((state) => state.viewMode);
export const useSetViewMode = () => useUIStore((state) => state.setViewMode);

export const useSelectedIds = () => useUIStore((state) => state.selectedIds);
export const useSetSelectedIds = () => useUIStore((state) => state.setSelectedIds);
export const useAddSelectedId = () => useUIStore((state) => state.addSelectedId);
export const useRemoveSelectedId = () => useUIStore((state) => state.removeSelectedId);
export const useClearSelection = () => useUIStore((state) => state.clearSelection);
export const useToggleSelection = () => useUIStore((state) => state.toggleSelection);

export const useModals = () => useUIStore((state) => state.modals);
export const useOpenModal = () => useUIStore((state) => state.openModal);
export const useCloseModal = () => useUIStore((state) => state.closeModal);
export const useCloseAllModals = () => useUIStore((state) => state.closeAllModals);

export const useSearchQuery = () => useUIStore((state) => state.searchQuery);
export const useSetSearchQuery = () => useUIStore((state) => state.setSearchQuery);

export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed);
export const useSetSidebarCollapsed = () => useUIStore((state) => state.setSidebarCollapsed);

export const useCurrentFolderId = () => useUIStore((state) => state.currentFolderId);
export const useSetCurrentFolderId = () => useUIStore((state) => state.setCurrentFolderId);
export const useBreadcrumbs = () => useUIStore((state) => state.breadcrumbs);
export const useSetBreadcrumbs = () => useUIStore((state) => state.setBreadcrumbs);

export const useSortOption = () => useUIStore((state) => state.sortOption);
export const useSetSortOption = () => useUIStore((state) => state.setSortOption);

// Tab selectors
export const useTabState = () => useUIStore((state) => state.tabState);
export const useTabs = () => useUIStore((state) => state.tabState.tabs);
export const useActiveTab = () => useUIStore((state) => state.tabState.tabs.find(tab => tab.isActive));
export const useAddTab = () => useUIStore((state) => state.addTab);
export const useRemoveTab = () => useUIStore((state) => state.removeTab);
export const useSetActiveTab = () => useUIStore((state) => state.setActiveTab);
export const useUpdateTab = () => useUIStore((state) => state.updateTab);
export const useCloseAllTabs = () => useUIStore((state) => state.closeAllTabs);
export const useCloseOtherTabs = () => useUIStore((state) => state.closeOtherTabs);
