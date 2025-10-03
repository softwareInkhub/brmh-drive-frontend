import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_DRIVE_API_BASE_URL ?? 'http://localhost:5001';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string; fileId: string }> }
) {
  try {
    const { userId, fileId } = await ctx.params;

    // 1) Get preview metadata (presigned URL) from backend
    const metaRes = await fetch(`${API_BASE}/drive/preview/${userId}/${fileId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    if (!metaRes.ok) {
      return NextResponse.json({ error: 'Failed to get preview metadata' }, { status: metaRes.status });
    }
    const meta = await metaRes.json();
    if (!meta?.success || !meta?.previewUrl) {
      return NextResponse.json({ error: 'Preview URL not available' }, { status: 400 });
    }

    // 2) Return the preview URL as JSON for iframe embedding
    // This allows the FilePreview component to use it in an iframe without triggering downloads
    return NextResponse.json({
      success: true,
      previewUrl: meta.previewUrl,
      expiresIn: meta.expiresIn || 3600,
      fileName: meta.fileName || 'Unknown file',
      mimeType: meta.mimeType || 'application/octet-stream',
      size: meta.size || 0
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
