'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const router = useRouter();

  const addDebugLog = (message: string) => {
    console.log(`[Drive AuthGuard] ${message}`);
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple runs
      if (hasChecked) {
        addDebugLog(`⏸️ Auth check already completed, skipping...`);
        return;
      }
      
      setHasChecked(true);
      
      // Determine API URL based on environment
      const isProduction = window.location.hostname.includes('brmh.in') && !window.location.hostname.includes('localhost');
      const API_BASE_URL = isProduction 
        ? (process.env.NEXT_PUBLIC_AWS_URL || 'https://brmh.in')
        : (process.env.NEXT_PUBLIC_DRIVE_API_BASE_URL || 'http://localhost:5001');
      
      addDebugLog(`🔍 Starting authentication check...`);
      addDebugLog(`🌐 API Base URL: ${API_BASE_URL} (${isProduction ? 'production' : 'development'})`);
      addDebugLog(`📍 Current URL: ${window.location.href.substring(0, 100)}`);
      
      // CRITICAL: Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // FIRST: Check for tokens in URL hash (from auth.brmh.in redirect)
      let tokensExtractedFromHash = false;
      if (window.location.hash) {
        addDebugLog(`🔗 URL hash detected, extracting tokens...`);
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const hashAccessToken = params.get('access_token');
        const hashIdToken = params.get('id_token');
        const hashRefreshToken = params.get('refresh_token');
        
        if (hashAccessToken || hashIdToken) {
          addDebugLog(`✅ Tokens found in URL hash, storing in localStorage...`);
          
          if (hashAccessToken) {
            localStorage.setItem('access_token', hashAccessToken);
            localStorage.setItem('accessToken', hashAccessToken);
            addDebugLog(`💾 Stored access_token (${hashAccessToken.substring(0, 30)}...)`);
          }
          
          if (hashIdToken) {
            localStorage.setItem('id_token', hashIdToken);
            localStorage.setItem('idToken', hashIdToken);
            addDebugLog(`💾 Stored id_token`);
            
            // Extract user info from ID token
            try {
              const payload = JSON.parse(atob(hashIdToken.split('.')[1]));
              if (payload.sub) {
                localStorage.setItem('user_id', payload.sub);
                addDebugLog(`👤 User ID: ${payload.sub}`);
              }
              if (payload.email) {
                localStorage.setItem('user_email', payload.email);
                addDebugLog(`📧 User email: ${payload.email}`);
              }
              if (payload['cognito:username']) {
                localStorage.setItem('user_name', payload['cognito:username']);
              }
            } catch (e) {
              addDebugLog(`⚠️ Could not parse ID token: ${e}`);
            }
          }
          
          if (hashRefreshToken) {
            localStorage.setItem('refresh_token', hashRefreshToken);
            localStorage.setItem('refreshToken', hashRefreshToken);
            addDebugLog(`💾 Stored refresh_token`);
          }
          
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          addDebugLog(`🧹 Cleared URL hash`);
          addDebugLog(`✨ Token extraction complete!`);
          
          tokensExtractedFromHash = true;
        }
      } else {
        addDebugLog(`ℹ️ No URL hash present`);
      }
      
      // NOW check for tokens in localStorage (after hash extraction is complete)
      let accessToken = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      let idToken = localStorage.getItem('id_token') || localStorage.getItem('idToken');
      
      addDebugLog(`📦 Token check in localStorage: accessToken=${!!accessToken}, idToken=${!!idToken}`);
      
      if (tokensExtractedFromHash) {
        addDebugLog(`✨ Just extracted tokens from hash, proceeding with validation...`);
      }
      
      // If no tokens in localStorage, try cookie-based auth for production
      if (!accessToken && !idToken) {
        addDebugLog(`🍪 No tokens in localStorage, checking for cookie-based auth...`);
        
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include'
          });
          
          if (response.ok) {
            const userData = await response.json();
            addDebugLog(`✅ Authenticated via cookies! User: ${userData.user?.email || userData.user?.sub}`);
            
            // Store user data in localStorage for app compatibility
            if (userData.user) {
              if (userData.user.sub) localStorage.setItem('user_id', userData.user.sub);
              if (userData.user.email) localStorage.setItem('user_email', userData.user.email);
              if (userData.user['cognito:username']) localStorage.setItem('user_name', userData.user['cognito:username']);
            }
            
            // CRITICAL: Set authenticated state IMMEDIATELY
            setIsAuthenticated(true);
            setIsChecking(false);
            addDebugLog(`🎉 Cookie-based authentication successful!`);
            
            // Exit early to prevent any redirects
            return;
          } else {
            addDebugLog(`❌ Cookie-based auth failed, redirecting to login...`);
          }
        } catch (error) {
          addDebugLog(`⚠️ Cookie auth check failed: ${error}`);
        }
        
        // No tokens and no valid cookies, redirect to auth.brmh.in
        const currentUrl = window.location.href.split('#')[0];
        const authUrl = `https://auth.brmh.in/login?next=${encodeURIComponent(currentUrl)}`;
        addDebugLog(`❌ No authentication found, will redirect to auth in 2 seconds...`);
        addDebugLog(`🔀 Redirect URL: ${authUrl}`);
        
        setTimeout(() => {
          window.location.href = authUrl;
        }, 2000);
        return;
      }

      // Validate token with backend
      addDebugLog(`🌐 Validating token with backend: ${API_BASE_URL}/auth/validate`);
      addDebugLog(`🔑 Using token: ${accessToken?.substring(0, 30)}...`);
      
      try {
        addDebugLog(`📡 Sending validation request...`);
        
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
          
          // CRITICAL: Set authenticated state IMMEDIATELY
          setIsAuthenticated(true);
          setIsChecking(false);
          addDebugLog(`🎉 Authentication complete! Rendering app...`);
          
          // Exit early to prevent any redirects
          return;
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          addDebugLog(`❌ Token validation failed (${response.status}): ${JSON.stringify(errorData)}`);
          addDebugLog(`🔍 Full error details: ${JSON.stringify(errorData, null, 2)}`);
          
          // Token invalid, clear and redirect
          addDebugLog(`🗑️ Clearing invalid tokens...`);
          localStorage.clear();
          const currentUrl = window.location.href.split('#')[0];
          const authUrl = `https://auth.brmh.in/login?next=${encodeURIComponent(currentUrl)}`;
          addDebugLog(`🔀 Will redirect to auth in 5 seconds: ${authUrl}`);
          addDebugLog(`⏰ You have 5 seconds to read this error!`);
          
          setTimeout(() => {
            window.location.href = authUrl;
          }, 5000); // Give 5 seconds to read error
          return;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addDebugLog(`⚠️ Token validation network error: ${errorMessage}`);
        addDebugLog(`🔍 Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
        addDebugLog(`🔍 Error stack: ${error instanceof Error ? error.stack?.substring(0, 200) : 'N/A'}`);
        
        // Check if this is a connection refused error (backend not running)
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('ECONNREFUSED')) {  
          addDebugLog(`🔌 Backend connection failed - backend not running or unreachable`);
          addDebugLog(`⚠️ THIS IS THE PROBLEM: Backend at ${API_BASE_URL} is not responding!`);
          addDebugLog(`💡 Fix: Make sure backend is running on port 5001`);
          addDebugLog(`💡 Run: cd brmh-backend && npm start`);
          addDebugLog(`⏸️ Waiting 10 seconds before redirect so you can read this...`);
          
          setTimeout(() => {
            const currentUrl = window.location.href.split('#')[0];
            const authUrl = `https://auth.brmh.in/login?next=${encodeURIComponent(currentUrl)}`;
            window.location.href = authUrl;
          }, 10000); // Give 10 seconds to read
          return;
        } else {
          addDebugLog(`❌ Unexpected network error: ${errorMessage}`);
          addDebugLog(`🗑️ Clearing tokens due to network error...`);
          localStorage.clear();
          const currentUrl = window.location.href.split('#')[0];
          const authUrl = `https://auth.brmh.in/login?next=${encodeURIComponent(currentUrl)}`;
          addDebugLog(`🔀 Redirecting to auth in 5 seconds: ${authUrl}`);
          
          setTimeout(() => {
            window.location.href = authUrl;
          }, 5000);
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
