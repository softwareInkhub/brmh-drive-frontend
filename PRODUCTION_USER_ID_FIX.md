# Production User ID Fix

## Issue
✅ Profile button now showing in production
❌ **But folders/files not loading** - API calls going to `/drive/folders/anonymous` instead of `/drive/folders/b4e834e8-5081-7069-3dab-7c98bbcf78a7`

## Root Cause
The `getCurrentUserId()` function needs the user ID **synchronously** to construct API endpoints, but in production the user info is fetched **asynchronously** via `/auth/me` (because of httpOnly cookies).

**The timing issue:**
```
1. Page loads → API client tries to fetch folders
2. API client calls getCurrentUserId() synchronously
3. But user info is still being fetched from /auth/me (async)
4. getCurrentUserId() returns 'anonymous' (no user yet)
5. API calls go to /drive/folders/anonymous ❌
```

## Solution Applied

### 1. Store User ID in localStorage After Fetch
When `getUserAsync()` successfully fetches user info from `/auth/me`, it now stores the user ID in localStorage:

```typescript
localStorage.setItem('user_id', user.sub);
localStorage.setItem('user_email', user.email);
```

### 2. Check localStorage in getCurrentUserId()
The `getCurrentUserId()` function now checks localStorage as a fallback:

```typescript
export function getCurrentUserId(): string {
  // Try sync method (works in localhost)
  const user = SSOUtils.getUser();
  if (user?.sub) return user.sub;
  
  // In production, check localStorage where async fetch stored it
  if (typeof localStorage !== 'undefined') {
    const userId = localStorage.getItem('user_id');
    if (userId) return userId;
  }
  
  // Fallback to anonymous
  return 'anonymous';
}
```

## Files Modified
1. `lib/sso-utils.ts` - Added localStorage storage in `getUserAsync()`
2. `lib/config.ts` - Updated `getCurrentUserId()` to check localStorage

## How to Deploy

### Option 1: Redeploy to Vercel (Recommended)
```bash
git add .
git commit -m "Fix: Store user ID in localStorage for sync API access"
git push
```
Vercel will auto-deploy.

### Option 2: Manual Deploy
In Vercel Dashboard:
- Go to Deployments
- Click on latest deployment → Redeploy

## Verification Steps

1. **Clear browser cache and localStorage:**
   ```
   F12 → Application → Storage → Clear site data
   ```

2. **Visit production site:**
   ```
   https://drive.brmh.in
   ```

3. **Login if needed**

4. **Check browser console:**
   ```javascript
   // You should see:
   localStorage.getItem('user_id')
   // Returns: "b4e834e8-5081-7069-3dab-7c98bbcf78a7"
   ```

5. **Check Network tab:**
   ```
   Look for requests to:
   ✅ /drive/folders/b4e834e8-5081-7069-3dab-7c98bbcf78a7
   ❌ NOT /drive/folders/anonymous
   ```

6. **Verify folders/files load:**
   - You should see your folders and files
   - Upload should work
   - All drive operations should function

## Expected Behavior After Fix

### Login Flow:
```
1. Page loads
2. AuthContext calls getUserAsync()
3. getUserAsync() fetches from /auth/me
4. User ID stored in localStorage: user_id = "b4e834e8-..."
5. API calls now use correct user ID
6. ✅ Folders and files load
```

### API Calls:
```
✅ GET https://brmh.in/drive/folders/b4e834e8-5081-7069-3dab-7c98bbcf78a7?parentId=ROOT
✅ GET https://brmh.in/drive/files/b4e834e8-5081-7069-3dab-7c98bbcf78a7?parentId=ROOT
✅ POST https://brmh.in/drive/upload (with userId in body)
```

## Debug

### If still showing anonymous:

**Check 1: Is user_id in localStorage?**
```javascript
// Open console on drive.brmh.in
console.log(localStorage.getItem('user_id'));
// Should show your user ID, not null
```

**Check 2: Is getUserAsync() being called?**
```javascript
// Check console for:
[SSO] Failed to fetch user from /auth/me: 401
// If you see this, cookies aren't being sent
```

**Check 3: Are cookies present?**
```
Visit: https://drive.brmh.in/debug-cookies
Click "Fetch User Info"
Should show your user data
```

### If localStorage is empty:

1. **Make sure you're logged in**
2. **Check that /auth/me returns user data** (use debug-cookies page)
3. **Look for errors in browser console**
4. **Try clearing all data and logging in fresh**

## Why This Approach?

### Alternative Approaches Considered:

❌ **Make all API calls async to wait for user**
- Would require massive refactoring
- React Query hooks expect sync userId
- Would break existing patterns

❌ **Use React Context for userId**
- Context can't be accessed outside React components
- API client is a class that needs userId immediately

✅ **Store in localStorage (chosen approach)**
- Simple and reliable
- Works with existing sync API
- No refactoring needed
- User ID doesn't change during session
- Compatible with both localhost and production

## Technical Details

### Localhost vs Production Flow:

**Localhost:**
```
1. Uses localStorage for tokens (not httpOnly)
2. getUser() works synchronously
3. getCurrentUserId() gets user.sub directly
4. ✅ No localStorage fallback needed
```

**Production:**
```
1. Uses httpOnly cookies (more secure)
2. getUser() returns null (can't read httpOnly cookies)
3. getUserAsync() fetches from /auth/me
4. User ID stored in localStorage for sync access
5. getCurrentUserId() reads from localStorage
6. ✅ API calls work with correct user ID
```

## Success Indicators

After deployment, you should see:

1. ✅ Profile button visible with your info
2. ✅ Folders and files loading
3. ✅ localStorage contains user_id
4. ✅ API calls use your actual user ID (not anonymous)
5. ✅ Upload, download, share all working
6. ✅ No 401 or 403 errors in console
7. ✅ Debug page shows correct user data

## Rollback Plan

If this causes issues:

1. The localStorage fallback is **additive** (doesn't break anything)
2. Worst case: Clear localStorage and re-login
3. Previous behavior: uses 'anonymous' if user not found (same as before)

## Summary

**Before Fix:**
- Profile ✅ (async user fetch works)
- Folders/Files ❌ (sync getCurrentUserId returns 'anonymous')

**After Fix:**
- Profile ✅ (async user fetch works)
- Folders/Files ✅ (localStorage provides userId for sync access)

The fix bridges the async/sync gap by caching the user ID in localStorage once it's fetched, making it available for synchronous API calls.

