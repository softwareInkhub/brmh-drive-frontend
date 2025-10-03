'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { API_BASE, API_ENDPOINTS } from '@/lib/config';

interface FilePreviewProps {
  fileId: string;
  userId: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  onFileNameLoaded?: (fileName: string) => void;
}

interface PreviewData {
  success: boolean;
  previewUrl: string;
  expiresIn: number;
  fileName: string;
  mimeType: string;
  size: number;
}

// CSV Preview Component
function CSVPreview({ url, fileName }: { url: string; fileName: string }) {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch CSV data');
        }
        
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim());
        const data = lines.map(line => {
          // Simple CSV parsing - split by comma and handle quoted values
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        });
        
        setCsvData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load CSV');
      } finally {
        setLoading(false);
      }
    };

    fetchCSV();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Skeleton className="h-8 w-8 rounded-full mx-auto mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] border rounded-lg overflow-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {csvData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex === 0 ? "bg-muted font-medium" : "hover:bg-muted/50"}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 border-b border-border">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FilePreview({ fileId, userId, fileName, mimeType, size, onFileNameLoaded }: FilePreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Loading preview for fileId:', fileId);
        const url = `/api/drive/preview-content/${userId}/${fileId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to get preview: ${response.status} ${response.statusText}`);
        }
        
        const data: PreviewData = await response.json();
        console.log('Preview data received:', data);
        
        if (data.success) {
          setPreviewData(data);
          // Call the callback to update tab title
          if (onFileNameLoaded) {
            onFileNameLoaded(data.fileName);
          }
        } else {
          throw new Error('Preview generation failed');
        }
      } catch (err) {
        console.error('Preview failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    if (fileId && userId) {
      loadPreview();
    }
  }, [fileId, userId]);

  const handleDownload = () => {
    if (previewData?.previewUrl) {
      const link = document.createElement('a');
      link.href = previewData.previewUrl;
      link.download = previewData.fileName;
      link.click();
    }
  };

  const renderPreview = () => {
    if (!previewData) return null;

    const { previewUrl, mimeType, fileName } = previewData;
    // Use the presigned URL directly for rendering
    const displayUrl = previewUrl;

    // Images
    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-[500px]">
          <img 
            src={displayUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onError={() => setError('Failed to load image')}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    // PDFs
    if (mimeType === 'application/pdf') {
      return (
        <div className="h-[500px] border rounded-lg overflow-hidden">
          <iframe 
            src={displayUrl}
            className="w-full h-full border-0"
            title={fileName}
            onError={() => setError('Failed to load PDF preview')}
          />
        </div>
      );
    }

    // Videos
    if (mimeType.startsWith('video/')) {
      return (
        <div className="h-[500px] border rounded-lg overflow-hidden">
          <video 
            controls 
            className="w-full h-full"
            onError={() => setError('Failed to load video')}
          >
            <source src={displayUrl} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio
    if (mimeType.startsWith('audio/')) {
      return (
        <div className="h-32 border rounded-lg overflow-hidden flex items-center justify-center">
          <audio 
            controls 
            className="w-full"
            onError={() => setError('Failed to load audio')}
          >
            <source src={displayUrl} type={mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // Microsoft Office documents (DOCX, XLSX, PPTX)
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        mimeType === 'application/msword' ||
        mimeType === 'application/vnd.ms-excel' ||
        mimeType === 'application/vnd.ms-powerpoint') {
      // Use Google Docs Viewer for Office documents
      // const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(displayUrl)}&embedded=true`;
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(displayUrl)}`;
      return (
        <div className="h-[500px] border rounded-lg overflow-hidden">
          <iframe 
            src={officeViewerUrl}
            className="w-full h-full border-0"
            title={fileName}
            onError={() => setError('Failed to load document preview')}
          />
        </div>
      );
    }

    // CSV files - display as table to prevent downloads
    if (mimeType === 'text/csv' || mimeType === 'application/csv') {
      return <CSVPreview url={displayUrl} fileName={fileName} />;
    }

    // Plain text files, JSON, XML - these can be displayed directly
    if (mimeType === 'text/plain' || 
        mimeType === 'text/html' ||
        mimeType === 'text/css' ||
        mimeType === 'text/javascript' ||
        mimeType === 'application/javascript' ||
        mimeType === 'application/json' || 
        mimeType === 'application/xml' ||
        mimeType === 'text/xml') {
      return (
        <div className="h-[500px] border rounded-lg overflow-hidden">
          <iframe 
            src={displayUrl}
            className="w-full h-full border-0"
            title={fileName}
            onError={() => setError('Failed to load document preview')}
          />
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Preview not available for this file type
          </p>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download file
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <Skeleton className="h-8 w-8 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download file
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold truncate">
            {previewData?.fileName || fileName || 'Loading...'}
          </h1>
          <p className="text-muted-foreground">
            {previewData?.mimeType || mimeType} • File Preview
            {previewData?.size && ` • ${(previewData.size / 1024).toFixed(1)} KB`}
          </p>
        </div>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="border rounded-lg p-4">
        {renderPreview()}
      </div>
    </div>
  );
}
