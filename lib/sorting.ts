import { FolderItem, FileItem, SortOption } from './types';
import { DriveFolder, DriveFile } from './drive-types';

// Helper function to get file type category for sorting
function getFileTypeCategory(item: FolderItem | FileItem | DriveFolder | DriveFile): string {
  if (item.type === 'folder') {
    return 'folder';
  }
  
  // For files, categorize by MIME type
  const mime = ('mime' in item ? item.mime : item.mimeType).toLowerCase();
  
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('pdf')) return 'document';
  if (mime.includes('word') || mime.includes('document')) return 'document';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'spreadsheet';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'presentation';
  if (mime.includes('text/')) return 'text';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('archive')) return 'archive';
  
  return 'other';
}

// Define the order for type categories
const typeCategoryOrder = [
  'folder',
  'image', 
  'video',
  'audio',
  'document',
  'spreadsheet',
  'presentation',
  'text',
  'archive',
  'other'
];

export function sortItems<T extends FolderItem | FileItem | DriveFolder | DriveFile>(
  items: T[],
  sortOption: SortOption
): T[] {
  return [...items].sort((a, b) => {
    let comparison = 0;

    switch (sortOption.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        // Get the type categories for both items
        const aCategory = getFileTypeCategory(a);
        const bCategory = getFileTypeCategory(b);
        
        // Get the index in the predefined order
        const aIndex = typeCategoryOrder.indexOf(aCategory);
        const bIndex = typeCategoryOrder.indexOf(bCategory);
        
        // Compare by category order first
        comparison = aIndex - bIndex;
        
        // If same category, sort by name within that category
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name);
        }
        break;
      case 'modifiedAt':
        const aDate = 'modifiedAt' in a ? a.modifiedAt : a.updatedAt;
        const bDate = 'modifiedAt' in b ? b.modifiedAt : b.updatedAt;
        comparison = new Date(aDate).getTime() - new Date(bDate).getTime();
        break;
      case 'size':
        // For folders, use childrenCount as size, for files use actual size
        const aSize = a.type === 'folder' ? (a.childrenCount || 0) : a.size;
        const bSize = b.type === 'folder' ? (b.childrenCount || 0) : b.size;
        comparison = aSize - bSize;
        break;
      default:
        comparison = 0;
    }

    return sortOption.direction === 'desc' ? -comparison : comparison;
  });
}

export function getSortDisplayName(field: string): string {
  switch (field) {
    case 'name':
      return 'Name';
    case 'type':
      return 'Type';
    case 'modifiedAt':
      return 'Modified';
    case 'size':
      return 'Size';
    default:
      return field;
  }
}

// Helper function to get user-friendly type category name
export function getTypeCategoryName(category: string): string {
  switch (category) {
    case 'folder': return 'Folders';
    case 'image': return 'Images';
    case 'video': return 'Videos';
    case 'audio': return 'Audio';
    case 'document': return 'Documents';
    case 'spreadsheet': return 'Spreadsheets';
    case 'presentation': return 'Presentations';
    case 'text': return 'Text Files';
    case 'archive': return 'Archives';
    case 'other': return 'Other Files';
    default: return category;
  }
}
