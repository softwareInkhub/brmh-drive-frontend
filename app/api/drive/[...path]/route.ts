import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = 'https://brmh.in';

// Helper function to get auth token from cookies
function getAuthTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('access_token')?.value;
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return cookieToken || null;
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_BASE}/drive/${path}${url.search}`;
  
  console.log(`[Drive Proxy] ${request.method} ${backendUrl}`);
  
  // Get auth token
  const authToken = getAuthTokenFromRequest(request);
  
  // Build headers for backend request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Copy other relevant headers
  const userAgent = request.headers.get('user-agent');
  if (userAgent) {
    headers['User-Agent'] = userAgent;
  }
  
  try {
    let body: any = undefined;
    
    // Handle request body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        body = await request.text();
      } else if (contentType?.includes('multipart/form-data')) {
        // For FormData, we need to forward it as-is
        body = await request.formData();
        delete headers['Content-Type']; // Let fetch set the boundary
      }
    }
    
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
    });
    
    console.log(`[Drive Proxy] Response: ${response.status} ${response.statusText}`);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let responseData: any;
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Return response with proper headers
    return new NextResponse(
      typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
      {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('[Drive Proxy] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Proxy request failed',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle all HTTP methods
export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return handleRequest(request, context);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
