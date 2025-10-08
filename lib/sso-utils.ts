/**
 * Shared SSO utilities for all *.brmh.in domains
 * This file can be copied to other apps or published as a package
 */

export interface SSOTokens {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
}

export interface SSOUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export class SSOUtils {
  private static readonly AUTH_DOMAIN = 'https://auth.brmh.in';
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brmh.in';
  private static readonly COOKIE_DOMAIN = '.brmh.in';

  /**
   * Check if user is authenticated via cookies (primary method for SSO)
   */
  static isAuthenticated(): boolean {
    if (typeof document === 'undefined') return false;

    // For localhost development, check localStorage
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      const accessToken = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      const idToken = localStorage.getItem('id_token') || localStorage.getItem('idToken');
      return !!(accessToken || idToken);
    }

    // For production, check if the middleware has set the auth_valid flag
    // This flag is set by middleware when httpOnly cookies are present
    const cookies = this.getCookies();
    return !!(cookies.auth_valid || cookies.access_token || cookies.id_token);
  }

  /**
   * Get all auth cookies
   */
  static getCookies(): Record<string, string> {
    if (typeof document === 'undefined') return {};

    return document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Get tokens from cookies or localStorage
   */
  static getTokens(): SSOTokens {
    // For localhost development, check localStorage
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocalhost) {
      return {
        accessToken: localStorage.getItem('access_token') || localStorage.getItem('accessToken') || undefined,
        idToken: localStorage.getItem('id_token') || localStorage.getItem('idToken') || undefined,
        refreshToken: localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken') || undefined,
      };
    }

    // For production, check cookies
    const cookies = this.getCookies();
    return {
      accessToken: cookies.access_token,
      idToken: cookies.id_token,
      refreshToken: cookies.refresh_token,
    };
  }

  /**
   * Get user info from ID token
   */
  static getUser(): SSOUser | null {
    // For production with httpOnly cookies, we need to call /auth/me
    // For localhost, we can parse the token from localStorage
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (isLocalhost) {
      const tokens = this.getTokens();
      if (!tokens.idToken) return null;

      try {
        const payload = JSON.parse(atob(tokens.idToken.split('.')[1]));
        return {
          sub: payload.sub,
          email: payload.email,
          email_verified: payload.email_verified,
          name:
            payload.name ||
            `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
          given_name: payload.given_name,
          family_name: payload.family_name,
          picture: payload.picture,
        };
      } catch (error) {
        console.error('[SSO] Failed to parse ID token:', error);
        return null;
      }
    }
    
    // For production, user info will be fetched async via getUserAsync
    // Return null here as this is a sync method
    return null;
  }
  
  /**
   * Get user info asynchronously (for production with httpOnly cookies)
   */
  static async getUserAsync(): Promise<SSOUser | null> {
    // For localhost, use sync method
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocalhost) {
      return this.getUser();
    }
    
    // For production, call /auth/me which has access to httpOnly cookies
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Important: send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('[SSO] Failed to fetch user from /auth/me:', response.status);
        return null;
      }
      
      const data = await response.json();
      const user = data.user;
      
      return {
        sub: user.sub,
        email: user.email,
        email_verified: user.email_verified,
        name: user.name || `${user.given_name || ''} ${user.family_name || ''}`.trim(),
        given_name: user.given_name,
        family_name: user.family_name,
        picture: user.picture,
      };
    } catch (error) {
      console.error('[SSO] Error fetching user from /auth/me:', error);
      return null;
    }
  }

  /**
   * Validate token with backend
   */
  static async validateToken(token?: string): Promise<boolean> {
    const tokens = this.getTokens();
    const tokenToValidate = token || tokens.accessToken || tokens.idToken;
    
    // If no token provided, try cookie-based auth
    if (!tokenToValidate) {
      try {
        const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        return response.ok;
      } catch (error) {
        console.error('[SSO] Cookie-based validation failed:', error);
        return false;
      }
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      // If validation fails, try cookie-based auth as fallback
      if (!response.ok) {
        const fallbackResponse = await fetch(`${this.API_BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        return fallbackResponse.ok;
      }
      
      return true;
    } catch (error) {
      console.error('[SSO] Token validation failed:', error);
      
      // Try cookie-based auth as fallback
      try {
        const fallbackResponse = await fetch(`${this.API_BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        return fallbackResponse.ok;
      } catch (fallbackError) {
        console.error('[SSO] Cookie-based fallback validation failed:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Redirect to auth.brmh.in for login
   */
  static redirectToLogin(returnUrl?: string): void {
    const currentUrl =
      returnUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const loginUrl = new URL('/login', this.AUTH_DOMAIN);
    if (currentUrl) {
      loginUrl.searchParams.set('next', currentUrl);
    }

    if (typeof window !== 'undefined') {
      window.location.href = loginUrl.toString();
    }
  }


  /**
   * Clear all auth cookies
   */
  static clearCookies(): void {
    if (typeof document === 'undefined') return;

    const cookiesToClear = ['access_token', 'id_token', 'refresh_token'];
    cookiesToClear.forEach((cookieName) => {
      // Clear for current domain
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      // Clear for .brmh.in domain
      document.cookie = `${cookieName}=; domain=${this.COOKIE_DOMAIN}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  }

  /**
   * Sync tokens from cookies to localStorage (for apps that expect localStorage)
   */
  static syncTokensToLocalStorage(): void {
    if (typeof window === 'undefined') return;

    const tokens = this.getTokens();
    const user = this.getUser();

    try {
      // Store tokens in both formats for compatibility
      if (tokens.accessToken) {
        localStorage.setItem('access_token', tokens.accessToken);
        localStorage.setItem('accessToken', tokens.accessToken);
      }
      if (tokens.idToken) {
        localStorage.setItem('id_token', tokens.idToken);
        localStorage.setItem('idToken', tokens.idToken);
      }
      if (tokens.refreshToken) {
        localStorage.setItem('refresh_token', tokens.refreshToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }

      // Store user info
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user_id', user.sub);
        if (user.email) localStorage.setItem('user_email', user.email);
        if (user.name) localStorage.setItem('user_name', user.name);
      }
    } catch (error) {
      console.error('[SSO] Failed to sync tokens to localStorage:', error);
    }
  }

  /**
   * Refresh tokens
   */
  static async refreshTokens(): Promise<boolean> {
    const tokens = this.getTokens();
    if (!tokens.refreshToken) return false;

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      });

      if (response.ok) {
        // Tokens should be updated via cookies by the backend
        return true;
      }
      return false;
    } catch (error) {
      console.error('[SSO] Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      const tokens = this.getTokens();

      // Call backend logout endpoint to revoke tokens
      if (tokens.refreshToken) {
        await fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ refresh_token: tokens.refreshToken }),
        });
      }

      // Clear all auth data
      this.clearCookies();
      this.clearLocalStorage();
    } catch (error) {
      console.error('[SSO] Logout failed:', error);
      // Clear data anyway
      this.clearCookies();
      this.clearLocalStorage();
    }
  }

  /**
   * Clear localStorage auth data
   */
  static clearLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;

    const keysToRemove = [
      'access_token',
      'accessToken',
      'id_token',
      'idToken',
      'refresh_token',
      'refreshToken',
      'user',
      'user_id',
      'user_email',
      'user_name',
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Initialize SSO for an app (call this on app startup)
   */
  static async initialize(): Promise<{
    isAuthenticated: boolean;
    user: SSOUser | null;
  }> {
    // Check if authenticated via cookies
    const isAuthenticated = this.isAuthenticated();

    if (isAuthenticated) {
      // Sync tokens to localStorage for backward compatibility
      this.syncTokensToLocalStorage();

      // Validate token
      const isValid = await this.validateToken();
      if (!isValid) {
        // Try to refresh
        const refreshed = await this.refreshTokens();
        if (!refreshed) {
          this.clearCookies();
          return { isAuthenticated: false, user: null };
        }
      }

      const user = this.getUser();
      return { isAuthenticated: true, user };
    }

    return { isAuthenticated: false, user: null };
  }
}

// Export for backward compatibility
export const AuthService = SSOUtils;
