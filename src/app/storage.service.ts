/**
 * Storage Service for Browser LocalStorage Operations
 * 
 * This service provides a safe abstraction layer for browser localStorage operations
 * that works correctly with Angular Universal (Server-Side Rendering).
 * 
 * KEY FEATURES:
 * - Platform detection to prevent SSR errors
 * - Safe localStorage access with fallbacks
 * - Consistent API for storage operations
 * - Null handling for server environments
 * 
 * WHY THIS SERVICE IS NEEDED:
 * - localStorage is only available in browser environments
 * - Direct localStorage access causes errors during server-side rendering
 * - This service provides graceful fallbacks and platform detection
 * - Centralizes storage logic for easier testing and maintenance
 * 
 * USAGE:
 * - Authentication state persistence
 * - User preferences storage
 * - Session recovery after page refresh
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Angular core imports for dependency injection and platform detection
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Safe LocalStorage Service
 * 
 * Provides browser-safe localStorage operations that work with SSR.
 * All methods check for browser environment before accessing localStorage.
 */
@Injectable({
  providedIn: 'root' // Singleton service available throughout the application
})
export class StorageService {
  
  /**
   * Constructor - Inject platform identifier for browser detection
   * @param platformId Angular platform identifier token
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Retrieve item from localStorage
   * 
   * Safely gets an item from localStorage with browser detection.
   * Returns null in server environments or if item doesn't exist.
   * 
   * @param key Storage key to retrieve
   * @returns String value from storage or null
   */
  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    // Return null in server environment (SSR)
    return null;
  }

  /**
   * Store item in localStorage
   * 
   * Safely sets an item in localStorage with browser detection.
   * No-op in server environments.
   * 
   * @param key Storage key to set
   * @param value String value to store
   */
  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
    // No-op in server environment (SSR)
  }

  /**
   * Remove item from localStorage
   * 
   * Safely removes an item from localStorage with browser detection.
   * No-op in server environments.
   * 
   * @param key Storage key to remove
   */
  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
    // No-op in server environment (SSR)
  }

  /**
   * Clear all items from localStorage
   * 
   * Safely clears all localStorage data with browser detection.
   * No-op in server environments.
   * 
   * WARNING: This removes ALL localStorage data, not just app-specific data.
   * Use with caution in shared browser environments.
   */
  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    // No-op in server environment (SSR)
  }
}
