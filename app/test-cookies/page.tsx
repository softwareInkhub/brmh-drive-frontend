'use client';

import { useEffect, useState } from 'react';

export default function TestCookiesPage() {
  const [cookies, setCookies] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<string>('');

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie;
    setCookies(allCookies || 'No cookies found');

    // Try /auth/me
    const testApi = async () => {
      try {
        const response = await fetch('https://brmh.in/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        setApiResponse(`Status: ${response.status}\n${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        setApiResponse(`Error: ${error}`);
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: '#00ff00', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔍 Cookie & Auth Test</h1>
      
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px', color: '#ffff00' }}>📍 Current Location:</h2>
        <p>{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px', color: '#ffff00' }}>🍪 Cookies:</h2>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{cookies}</pre>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px', color: '#ffff00' }}>📡 /auth/me Response:</h2>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{apiResponse || 'Loading...'}</pre>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px', color: '#ffff00' }}>🔑 What to check:</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ auth_valid cookie should be present</li>
          <li>✅ /auth/me should return 200 with user info</li>
          <li>❌ If no cookies: Backend didn&apos;t set them</li>
          <li>❌ If 401: Backend can&apos;t read httpOnly cookies</li>
        </ul>
      </div>

      <button 
        onClick={() => {
          window.location.href = `https://auth.brmh.in/login?next=${encodeURIComponent(window.location.href)}`;
        }}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        🔐 Login
      </button>

      <button 
        onClick={() => {
          window.location.reload();
        }}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        🔄 Reload
      </button>
    </div>
  );
}

