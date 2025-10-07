'use client';

import { useEffect, useState } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface ApiResponse {
  user?: {
    email?: string;
    sub?: string;
    [key: string]: unknown;
  };
  error?: string;
  [key: string]: unknown;
}

export default function DebugAuthPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [localStorage, setLocalStorage] = useState<Record<string, string>>({});
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [environment, setEnvironment] = useState<Record<string, string>>({});

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      type
    }]);
  };

  useEffect(() => {
    const init = async () => {
      addLog('🔍 Starting authentication debug...', 'info');

      // Get environment info
      const env = {
        hostname: window.location.hostname,
        href: window.location.href,
        isProduction: window.location.hostname.includes('brmh.in') ? 'true' : 'false',
        userAgent: navigator.userAgent,
      };
      setEnvironment(env);
      addLog(`📍 Hostname: ${env.hostname}`, 'info');
      addLog(`🌐 Is Production: ${env.isProduction}`, 'info');

      // Get all cookies
      const cookiesObj = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {} as Record<string, string>);
      setCookies(cookiesObj);
      
      addLog(`🍪 Found ${Object.keys(cookiesObj).length} readable cookies`, 'info');
      Object.keys(cookiesObj).forEach(key => {
        const value = cookiesObj[key];
        const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
        addLog(`  - ${key}: ${displayValue}`, key.includes('auth') || key.includes('token') ? 'success' : 'info');
      });

      // Check for httpOnly cookies (we can't read them, but we can try to detect them)
      addLog('🔒 Checking for httpOnly cookies (via API)...', 'info');

      // Get localStorage
      const localStorageObj: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          localStorageObj[key] = window.localStorage.getItem(key) || '';
        }
      }
      setLocalStorage(localStorageObj);
      
      addLog(`💾 Found ${Object.keys(localStorageObj).length} localStorage items`, 'info');
      Object.keys(localStorageObj).forEach(key => {
        if (key.includes('token') || key.includes('user') || key.includes('auth')) {
          const value = localStorageObj[key];
          const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
          addLog(`  - ${key}: ${displayValue}`, 'success');
        }
      });

      // Try to call /auth/me
      const apiBaseUrl = env.isProduction === 'true' 
        ? 'https://brmh.in' 
        : 'http://localhost:5001';
      
      addLog(`🌐 Testing /auth/me endpoint at ${apiBaseUrl}`, 'info');
      
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        addLog(`📡 /auth/me response status: ${response.status} ${response.statusText}`, 
          response.ok ? 'success' : 'error');

        if (response.ok) {
          const data = await response.json();
          setApiResponse(data);
          addLog(`✅ /auth/me successful!`, 'success');
          addLog(`👤 User: ${data.user?.email || data.user?.sub || 'unknown'}`, 'success');
        } else {
          const errorText = await response.text();
          setApiResponse({ error: errorText });
          addLog(`❌ /auth/me failed: ${errorText}`, 'error');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setApiResponse({ error: errorMsg });
        addLog(`❌ /auth/me error: ${errorMsg}`, 'error');
      }

      // Check middleware logs (we can't access server logs, but we can check what we have)
      addLog('🔍 Checking authentication status...', 'info');
      
      const hasAuthValid = !!cookiesObj.auth_valid;
      const hasIdToken = !!cookiesObj.id_token;
      const hasAccessToken = !!cookiesObj.access_token;
      
      if (hasAuthValid) {
        addLog('✅ auth_valid flag is SET (middleware approved)', 'success');
      } else {
        addLog('❌ auth_valid flag is NOT SET (middleware did not approve)', 'error');
      }

      if (hasIdToken) {
        addLog('✅ id_token cookie is readable (NOT httpOnly!)', 'warning');
      } else {
        addLog('ℹ️ id_token cookie is NOT readable (probably httpOnly)', 'info');
      }

      if (hasAccessToken) {
        addLog('✅ access_token cookie is readable (NOT httpOnly!)', 'warning');
      } else {
        addLog('ℹ️ access_token cookie is NOT readable (probably httpOnly)', 'info');
      }

      addLog('✅ Debug complete!', 'success');
    };

    init();
  }, []);

  const clearAllData = () => {
    // Clear localStorage
    window.localStorage.clear();
    
    // Clear cookies (both current domain and .brmh.in)
    const cookiesToClear = ['access_token', 'id_token', 'refresh_token', 'auth_valid'];
    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${name}=; domain=.brmh.in; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
    
    addLog('🗑️ Cleared all localStorage and cookies', 'warning');
    
    // Reload after 1 second
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const testLogin = () => {
    const currentUrl = window.location.href;
    const authUrl = `https://auth.brmh.in/login?next=${encodeURIComponent(currentUrl)}`;
    addLog(`🔀 Redirecting to login: ${authUrl}`, 'info');
    setTimeout(() => {
      window.location.href = authUrl;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔍 Drive Authentication Debug</h1>
          <p className="text-gray-400">Real-time authentication debugging for drive.brmh.in</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Environment Info */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">🌐 Environment</h2>
            <div className="space-y-2 font-mono text-sm">
              {Object.entries(environment).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">{key}:</span>
                  <span className="text-green-400 break-all ml-4">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API Response */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">📡 /auth/me Response</h2>
            <div className="font-mono text-sm">
              {apiResponse ? (
                <pre className="whitespace-pre-wrap break-words bg-gray-900 p-4 rounded overflow-x-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cookies */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">🍪 Cookies ({Object.keys(cookies).length})</h2>
            <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
              {Object.keys(cookies).length > 0 ? (
                Object.entries(cookies).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-700 pb-2">
                    <div className="text-green-400 font-semibold">{key}</div>
                    <div className="text-gray-400 break-all text-xs mt-1">
                      {value.length > 100 ? value.substring(0, 100) + '...' : value}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No readable cookies found</p>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-400">
              ℹ️ httpOnly cookies (id_token, access_token, refresh_token) cannot be read by JavaScript
            </div>
          </div>

          {/* localStorage */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-green-400">💾 localStorage ({Object.keys(localStorage).length})</h2>
            <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
              {Object.keys(localStorage).length > 0 ? (
                Object.entries(localStorage).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-700 pb-2">
                    <div className="text-green-400 font-semibold">{key}</div>
                    <div className="text-gray-400 break-all text-xs mt-1">
                      {value.length > 100 ? value.substring(0, 100) + '...' : value}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No localStorage items found</p>
              )}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl mb-8">
          <h2 className="text-2xl font-bold mb-4 text-red-400">📋 Debug Logs ({logs.length})</h2>
          <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto bg-gray-900 p-4 rounded">
            {logs.map((log, idx) => (
              <div key={idx} className={`${
                log.type === 'success' ? 'text-green-400' :
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                'text-gray-300'
              }`}>
                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={clearAllData}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🗑️ Clear All Data & Reload
          </button>
          <button
            onClick={testLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔐 Test Login Flow
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Reload Page
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3 text-blue-300">📖 How to Use This Debug Page</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Check the <span className="text-yellow-400">Cookies</span> section for <code className="bg-gray-800 px-2 py-1 rounded">auth_valid</code> flag</li>
            <li>Check the <span className="text-purple-400">/auth/me Response</span> to see if backend recognizes you</li>
            <li>Check the <span className="text-red-400">Debug Logs</span> for any errors</li>
            <li>If you see <code className="bg-gray-800 px-2 py-1 rounded">auth_valid</code> cookie but still redirect, there&apos;s a bug in AuthGuard</li>
            <li>If you don&apos;t see <code className="bg-gray-800 px-2 py-1 rounded">auth_valid</code> cookie, middleware is not setting it</li>
            <li>Click <span className="text-blue-400">Test Login Flow</span> to login and come back here</li>
          </ol>
        </div>

        {/* Expected vs Actual */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-green-300">✅ Expected (Working)</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
              <li><code className="bg-gray-800 px-2 py-1 rounded">auth_valid</code> = &quot;1&quot; (in Cookies)</li>
              <li>/auth/me returns <code className="bg-gray-800 px-2 py-1 rounded">200 OK</code></li>
              <li>/auth/me has user.email or user.sub</li>
              <li>No redirect to auth.brmh.in</li>
            </ul>
          </div>
          
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3 text-red-300">❌ Problem Indicators</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
              <li>No <code className="bg-gray-800 px-2 py-1 rounded">auth_valid</code> cookie → Middleware not working</li>
              <li>/auth/me returns <code className="bg-gray-800 px-2 py-1 rounded">401 Unauthorized</code> → No valid cookies</li>
              <li>Has <code className="bg-gray-800 px-2 py-1 rounded">auth_valid</code> but still redirects → AuthGuard bug</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

