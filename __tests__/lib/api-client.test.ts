import { DriveApiClient, DriveApiError } from '@/lib/api-client';
import { DeleteFolderResponse } from '@/lib/drive-types';

// Mock fetch globally
global.fetch = jest.fn();

describe('DriveApiClient - deleteFolder', () => {
  let apiClient: DriveApiClient;
  const mockUserId = 'user123';
  const mockFolderId = 'FOLDER_abc123';

  beforeEach(() => {
    apiClient = new DriveApiClient(mockUserId);
    jest.clearAllMocks();
  });

  it('should successfully delete a folder and return the correct response', async () => {
    const mockResponse: DeleteFolderResponse = {
      success: true,
      folderId: 'FOLDER_abc123',
      folderName: 'My Documents',
      deletedAt: '2025-01-27T10:35:00.000Z',
      deletedItems: {
        files: 5,
        folders: 2,
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.deleteFolder(mockFolderId);

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:5001/drive/folder/${mockUserId}/${mockFolderId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    expect(result).toEqual({
      success: true,
      data: mockResponse,
    });
  });

  it('should handle API errors correctly', async () => {
    const mockErrorResponse = {
      error: 'Failed to delete 2 files: document.pdf, image.jpg',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => mockErrorResponse,
    });

    await expect(apiClient.deleteFolder(mockFolderId)).rejects.toThrow(DriveApiError);

    try {
      await apiClient.deleteFolder(mockFolderId);
    } catch (error) {
      expect(error).toBeInstanceOf(DriveApiError);
      expect((error as DriveApiError).message).toBe('Failed to delete 2 files: document.pdf, image.jpg');
      expect((error as DriveApiError).status).toBe(500);
    }
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(apiClient.deleteFolder(mockFolderId)).rejects.toThrow(DriveApiError);

    try {
      await apiClient.deleteFolder(mockFolderId);
    } catch (error) {
      expect(error).toBeInstanceOf(DriveApiError);
      expect((error as DriveApiError).message).toBe('Network error');
      expect((error as DriveApiError).status).toBe(0);
    }
  });

  it('should handle malformed JSON responses', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(apiClient.deleteFolder(mockFolderId)).rejects.toThrow(DriveApiError);

    try {
      await apiClient.deleteFolder(mockFolderId);
    } catch (error) {
      expect(error).toBeInstanceOf(DriveApiError);
      expect((error as DriveApiError).message).toBe('HTTP 500: Internal Server Error');
      expect((error as DriveApiError).status).toBe(500);
    }
  });
});
