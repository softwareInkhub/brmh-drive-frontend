import { render, screen } from '@testing-library/react';
import { FolderCard } from '@/components/ui/folder-card';
import { FolderItem } from '@/lib/types';

// Mock the store
jest.mock('@/lib/store', () => ({
  useSelectionActions: () => ({
    toggleSelection: jest.fn(),
  }),
  useModalActions: () => ({
    openModal: jest.fn(),
  }),
}));

describe('FolderCard', () => {
  const mockFolder: FolderItem = {
    id: 'test-folder-1',
    name: 'Test Folder',
    type: 'folder',
    owner: 'John Doe',
    modifiedAt: '2024-01-15T10:30:00Z',
    parentId: null,
    childrenCount: 5,
  };

  it('renders folder name correctly', () => {
    render(<FolderCard folder={mockFolder} />);
    
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
    expect(screen.getByText('Folder')).toBeInTheDocument();
  });

  it('displays folder metadata', () => {
    render(<FolderCard folder={mockFolder} />);
    
    expect(screen.getByText('5 items')).toBeInTheDocument();
  });

  it('shows folder icon', () => {
    render(<FolderCard folder={mockFolder} />);
    
    // Check if folder icon is present (Lucide icons render as SVG)
    const folderIcon = document.querySelector('svg');
    expect(folderIcon).toBeInTheDocument();
  });

  it('applies selected state correctly', () => {
    render(<FolderCard folder={mockFolder} isSelected={true} />);
    
    const card = screen.getByRole('button', { name: /test folder/i });
    expect(card).toHaveClass('ring-2', 'ring-primary');
  });
});
