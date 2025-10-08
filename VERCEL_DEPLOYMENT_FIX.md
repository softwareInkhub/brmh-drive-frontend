# Vercel Deployment Fix for drive.brmh.in

## Problem
When deployed to Vercel at `drive.brmh.in`, the profile button doesn't show and S3 buckets/DynamoDB data aren't fetched, even though everything works locally.

## Root Cause
The authentication flow uses **httpOnly cookies** that are set by `auth.brmh.in` and need to be accessible to `drive.brmh.in`. The frontend JavaScript cannot directly read httpOnly cookies, so it needs to call the `/auth/me` endpoint to get user information.

## Solution Applied

### 1. Backend Configuration ✅
The backend already correctly sets cookies with:
- `domain: '.brmh.in'` (allows subdomain sharing)
- `httpOnly: true` (security)
- `secure: true` (HTTPS required)
- `sameSite: 'none'` in production (cross-subdomain)

### 2. Frontend Updates ✅

#### a. Updated `sso-utils.ts`
- Added `getUserAsync()` method that calls `/auth/me` endpoint
- Updated `isAuthenticated()` to check for `auth_valid` flag cookie
- Separated localhost (localStorage) from production (cookie) logic

#### b. Updated `auth-context.tsx`
- Changed to use `getUserAsync()` instead of sync `getUser()`
- Properly handles async user info fetching

#### c. Updated Environment Variables
Added both required environment variables:
```env
NEXT_PUBLIC_DRIVE_API_BASE_URL=https://brmh.in
NEXT_PUBLIC_API_BASE_URL=https://brmh.in
```

### 3. Middleware Configuration ✅
The middleware already:
- Checks for httpOnly cookies (id_token, access_token)
- Sets a client-readable `auth_valid` flag cookie
- Redirects unauthenticated users to auth.brmh.in

## Vercel Environment Variables Setup

### Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

| Variable Name | Value | Used For |
|--------------|-------|----------|
| `NEXT_PUBLIC_DRIVE_API_BASE_URL` | `https://brmh.in` | Drive API endpoints (/drive/*) |
| `NEXT_PUBLIC_API_BASE_URL` | `https://brmh.in` | Auth API endpoints (/auth/*) |

### Optional Variables

| Variable Name | Value | Purpose |
|--------------|-------|---------|
| `NEXT_PUBLIC_DEVTOOLS` | `true` | Enable React Query DevTools in production |
| `NODE_ENV` | `production` | Automatically set by Vercel |

## Deployment Steps

### 1. Set Environment Variables
```bash
# In Vercel Dashboard
Settings → Environment Variables → Add New

Name: NEXT_PUBLIC_DRIVE_API_BASE_URL
Value: https://brmh.in
Environments: ✓ Production ✓ Preview ✓ Development

Name: NEXT_PUBLIC_API_BASE_URL
Value: https://brmh.in
Environments: ✓ Production ✓ Preview ✓ Development
```

### 2. Redeploy
After adding environment variables:
```bash
# Option 1: In Vercel Dashboard
Deployments → Latest → Redeploy

# Option 2: Push to git (triggers auto-deploy)
git add .
git commit -m "Fix production authentication"
git push
```

### 3. Verify Deployment
Visit: `https://drive.brmh.in/debug-cookies`

This debug page will show:
- Current cookies (client-accessible only)
- Environment information
- Test the `/auth/me` endpoint
- Troubleshooting tips

## Expected Behavior After Fix

### ✅ What Should Work
1. **Login Flow:**
   - User visits `drive.brmh.in`
   - Gets redirected to `auth.brmh.in/login`
   - After login, redirected back with httpOnly cookies set
   - Cookies are accessible across all `*.brmh.in` subdomains

2. **User Profile:**
   - Profile button appears in top-right corner
   - Shows user name, email, and avatar
   - Dropdown menu works (Profile, Settings, Logout)

3. **Data Fetching:**
   - S3 buckets are listed
   - DynamoDB data is fetched
   - All drive operations work (upload, download, share, etc.)

### ❌ What Won't Work Without This Fix
- Profile button not showing (user = null)
- API calls failing with 401 Unauthorized
- Automatic redirect to login page
- No S3/DynamoDB data

## Troubleshooting

### Profile Button Still Not Showing

**Check 1: Environment Variables**
```bash
# In Vercel Dashboard → Settings → Environment Variables
# Verify both variables are set and redeployed
```

**Check 2: Cookie Domain**
```javascript
// Visit https://drive.brmh.in/debug-cookies
// You should see 'auth_valid' cookie
// If not, check backend logs for cookie setting
```

**Check 3: Backend Logs**
```bash
# On your backend server, check logs for:
[Auth] Setting cookies with options: { domain: '.brmh.in', secure: true, sameSite: 'none' }
```

### API Calls Failing with CORS

**Issue:** `Network error: Cannot reach server`

**Solution:**
1. Verify backend is running and accessible at `https://brmh.in`
2. Check backend CORS configuration allows `https://drive.brmh.in`
3. Ensure `credentials: 'include'` is set in fetch calls (already done)

### Cookies Not Being Set

**Issue:** No cookies visible in debug page

**Solution:**
1. Verify you logged in via `https://auth.brmh.in`
2. Check backend sets cookies with `domain: '.brmh.in'`
3. Verify HTTPS is used (cookies with `secure: true` require HTTPS)
4. Check browser console for cookie warnings

## Testing the Fix

### 1. Clear Browser Data
```
1. Open DevTools (F12)
2. Application → Storage → Clear site data
3. Close and reopen browser
```

### 2. Fresh Login
```
1. Visit https://drive.brmh.in
2. Should redirect to https://auth.brmh.in/login
3. Login with credentials
4. Should redirect back to https://drive.brmh.in
5. Profile button should appear immediately
```

### 3. Verify Data
```
1. Check browser DevTools → Network tab
2. See requests to https://brmh.in/drive/* endpoints
3. Requests should include cookies (even if httpOnly)
4. Responses should return 200 with data
```

### 4. Use Debug Page
```
1. Visit https://drive.brmh.in/debug-cookies
2. Click "Fetch User Info"
3. Should see your user data (email, name, etc.)
```

## Architecture Overview

```
┌─────────────────┐
│  auth.brmh.in   │ Sets httpOnly cookies with domain='.brmh.in'
│  (Auth UI)      │ Cookies: id_token, access_token, refresh_token
└────────┬────────┘
         │
         │ Cookies shared across *.brmh.in
         │
         ▼
┌─────────────────┐
│ drive.brmh.in   │ Reads cookies via middleware (server-side)
│ (Drive Frontend)│ Gets user info via /auth/me endpoint
└────────┬────────┘
         │
         │ API calls with credentials: 'include'
         │
         ▼
┌─────────────────┐
│   brmh.in       │ Validates httpOnly cookies
│   (Backend API) │ Returns user data and drive resources
└─────────────────┘
```

## Key Changes Summary

### Files Modified
1. `brmh-drive-frontend/lib/sso-utils.ts` - Added async user fetching
2. `brmh-drive-frontend/lib/auth-context.tsx` - Uses async getUserAsync()
3. `brmh-drive-frontend/.env` - Added NEXT_PUBLIC_API_BASE_URL
4. `brmh-drive-frontend/env.example` - Documented both env vars
5. `brmh-drive-frontend/app/debug-cookies/page.tsx` - New debug page

### No Changes Needed
- Backend cookie configuration (already correct)
- Middleware (already handles httpOnly cookies)
- API client (already sends credentials: 'include')

## Support

If issues persist after following this guide:

1. **Check Debug Page:** `https://drive.brmh.in/debug-cookies`
2. **Review Browser Console:** Look for errors or CORS issues
3. **Check Backend Logs:** Verify cookies are being set correctly
4. **Test Locally:** Confirm localhost works with localStorage

## Verification Checklist

- [ ] Environment variables set in Vercel
- [ ] Redeployed after adding env vars
- [ ] Can login via auth.brmh.in
- [ ] Profile button shows after login
- [ ] Can fetch drive data (folders/files)
- [ ] Debug page shows user info
- [ ] No console errors

