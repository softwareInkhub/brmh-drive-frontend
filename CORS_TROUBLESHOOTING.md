# CORS Troubleshooting Guide for BRMH Drive

## Current Issue
The BRMH Drive frontend at `https://drive.brmh.in` is experiencing CORS errors when making requests to the backend at `https://brmh.in`. The specific error is:

```
Access to fetch at 'https://brmh.in/drive/files/{userId}?parentId=ROOT' from origin 'https://drive.brmh.in' has been blocked by CORS policy: Request header field cache-control is not allowed by Access-Control-Allow-Headers in preflight response.
```

**Note**: `{userId}` is dynamically obtained from the authenticated user's SSO token (e.g., using `getCurrentUserId()` from `@/lib/config`).

## Root Cause
The backend server at `https://brmh.in` needs to be configured to allow cross-origin requests from `https://drive.brmh.in` with the following headers:
- `Authorization` (for authentication tokens)
- `Content-Type` (for JSON requests)
- `Cache-Control` (if needed for caching control)

## Backend CORS Configuration Required

The backend server needs to include these CORS headers in its responses:

```
Access-Control-Allow-Origin: https://drive.brmh.in
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma
Access-Control-Allow-Credentials: true
```

### For Express.js Backend:
```javascript
app.use(cors({
  origin: ['https://drive.brmh.in', 'https://auth.brmh.in', 'https://app.brmh.in'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
```

### For Nginx Reverse Proxy:
```nginx
location /drive/ {
    add_header 'Access-Control-Allow-Origin' 'https://drive.brmh.in' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Cache-Control, Pragma' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://drive.brmh.in';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Cache-Control, Pragma';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    proxy_pass http://backend;
}
```

## Frontend Fixes Applied

1. **Removed problematic headers**: Removed `Cache-Control` and `Pragma` headers that were causing CORS preflight failures.

2. **Improved authentication**: Added proper token handling from both cookies (SSO) and localStorage.

3. **Better error handling**: Added specific error messages for CORS and network issues.

4. **Simplified requests**: Only send necessary headers to minimize CORS preflight complexity.

## Testing CORS Fix

To test if CORS is working:

1. Open browser developer tools
2. Go to Network tab
3. Visit `https://drive.brmh.in`
4. Check if requests to `https://brmh.in/drive/*` are successful
5. Look for preflight OPTIONS requests and ensure they return 200 status

## Temporary Workaround

If backend CORS cannot be configured immediately, consider:

1. **Proxy through Next.js API routes**: Create API routes in the drive frontend that proxy requests to the backend
2. **Use same domain**: Deploy drive frontend to a subdirectory of `https://brmh.in/drive/` instead of a subdomain

## Status

✅ Frontend CORS handling improved
❌ Backend CORS configuration still needed
❌ Authentication integration with SSO system needed

## Next Steps

1. Configure backend CORS settings as described above
2. Test the complete flow
3. Verify authentication works with SSO tokens
4. Monitor for any remaining CORS issues
