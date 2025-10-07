'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_DRIVE_API_BASE_URL || 'http://localhost:5001';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const addDebugLog = (message: string) => {
    console.log(`[Drive AuthGuard] ${message}`);
  };

  useEffect(() => {
    const checkAuth = async () => {
      addDebugLog('🔍 Starting authentication check...');
      
      // Check for tokens in localStorage
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      const idToken = localStorage.getItem('id_token') || localStorage.getItem('idToken');
      
      addDebugLog(`🔑 Found tokens: access=${!!accessToken}, id=${!!idToken}`);
      
      if (!accessToken) {
        addDebugLog('❌ No access token found, redirecting to auth...');
        const currentUrl = window.location.href.split('#')[0]; // Remove hash before redirect
        const authUrl = `https://auth.brmh.in/login?next=${encodeURIComponent(currentUrl)}`;
        addDebugLog(`🔀 Redirecting to: ${authUrl}`);
        window.location.href = authUrl;
        return;
      }

      // Validate token with backend
      addDebugLog(`🌐 Validating token with backend: ${API_BASE_URL}/auth/validate`);
      addDebugLog(`🔑 Using token: ${accessToken?.substring(0, 30)}...`);
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        addDebugLog(`📡 Validation response: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const data = await response.json();
          addDebugLog(`✅ Token validated successfully!`);
          addDebugLog(`👤 User data: ${JSON.stringify(data).substring(0, 150)}`);
          setIsAuthenticated(true);
          addDebugLog(`🎉 Authentication complete! Rendering app...`);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          addDebugLog(`❌ Token validation failed (${response.status}): ${JSON.stringify(errorData)}`);
          
          // Token invalid, clear and redirect
          addDebugLog(`🗑️ Clearing invalid tokens...`);
          localStorage.clear();
          const currentUrl = window.location.href.split('#')[0]; // Remove hash before redirect
          const authUrl = `https://auth.brmh.in/login?next=${encodeURIComponent(currentUrl)}`;
          addDebugLog(`🔀 Will redirect to auth in 2 seconds: ${authUrl}`);
          
          setTimeout(() => {
            window.location.href = authUrl;
          }, 2000);
          return;
        }
      } catch (error) {
        addDebugLog(`⚠️ Token validation network error: ${error}`);
        
        // Check if this is a connection refused error (backend not running)
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          addDebugLog(`🔌 Backend is not running (connection refused). This is expected in development.`);
          addDebugLog(`✅ Allowing access with existing tokens (development mode)`);
          setIsAuthenticated(true);
        } else {
          addDebugLog(`❌ Unexpected network error: ${error.message}`);
          addDebugLog(`🗑️ Clearing tokens due to network error...`);
          localStorage.clear();
          const currentUrl = window.location.href.split('#')[0];
          const authUrl = `https://auth.brmh.in/login?next=${encodeURIComponent(currentUrl)}`;
          addDebugLog(`🔀 Redirecting to auth: ${authUrl}`);
          window.location.href = authUrl;
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authenticating...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your authentication.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
