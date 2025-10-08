'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface UserInfo {
  user: {
    sub: string;
    email: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };
}

export default function DebugCookiesPage() {
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Read all client-accessible cookies
    const allCookies: Record<string, string> = {};
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name) allCookies[name] = value || '';
      });
    }
    setCookies(allCookies);
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://brmh.in/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Cookie Debug Page</h1>
          <p className="text-gray-600 mb-4">
            This page helps diagnose authentication cookie issues in production.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-semibold">Hostname:</span> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Protocol:</span> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Full URL:</span> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Client-Accessible Cookies</h2>
          <p className="text-sm text-gray-600 mb-4">
            Note: HttpOnly cookies (like id_token, access_token) won&apos;t appear here.
          </p>
          {Object.keys(cookies).length === 0 ? (
            <div className="text-gray-500 italic">No client-accessible cookies found</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(cookies).map(([name, value]) => (
                <div key={name} className="border-b pb-2">
                  <div className="font-semibold font-mono">{name}</div>
                  <div className="text-sm text-gray-600 break-all">{value.substring(0, 100)}{value.length > 100 ? '...' : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test /auth/me Endpoint</h2>
          <p className="text-sm text-gray-600 mb-4">
            This tests if the backend can read httpOnly cookies and return user info.
          </p>
          <Button onClick={fetchUserInfo} disabled={loading} className="mb-4">
            {loading ? 'Loading...' : 'Fetch User Info'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <div className="font-semibold text-red-800">Error:</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          {userInfo && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="font-semibold text-green-800 mb-2">User Info Retrieved:</div>
              <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded border">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-6">
          <h2 className="text-lg font-semibold mb-2 text-blue-900">Expected Behavior</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ <strong>auth_valid</strong> cookie should be visible (set by middleware)</li>
            <li>✓ Clicking &quot;Fetch User Info&quot; should return your user data</li>
            <li>✓ HttpOnly cookies (id_token, access_token) won&apos;t be visible here but are sent automatically</li>
            <li>✗ If you see errors, cookies may not be set correctly from auth.brmh.in</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-6">
          <h2 className="text-lg font-semibold mb-2 text-yellow-900">Troubleshooting</h2>
          <div className="space-y-2 text-sm text-yellow-800">
            <p><strong>If no cookies are visible:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Make sure you&apos;ve logged in via auth.brmh.in</li>
              <li>Check that backend sets cookies with domain=&apos;.brmh.in&apos;</li>
              <li>Verify cookies are set with Secure=true and SameSite=&apos;none&apos; or &apos;lax&apos;</li>
            </ul>
            <p className="mt-4"><strong>If /auth/me fails:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Check browser console for CORS errors</li>
              <li>Verify backend is running at https://brmh.in</li>
              <li>Check that cookies are being sent (Network tab → Request Headers)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

