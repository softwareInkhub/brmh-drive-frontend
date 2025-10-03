import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewMode, SortOption, ModalState, ID } from './types';

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
  openModal: (type: keyof ModalState, id?: ID) => void;
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
      openModal: (type, id) => set((state) => ({
        modals: { ...state.modals, [type]: id ?? true }
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
    }),
    {
      name: 'brmh-drive-ui',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
        sortOption: state.sortOption,
      }),
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
