/**
 * Authentication Service for the Deployment Portal
 * 
 * This service manages user authentication and session state throughout the application.
 * It provides a centralized way to handle:
 * 
 * - User login and logout
 * - Session validation and recovery
 * - User state management across components
 * - Persistent login state using localStorage
 * - Server-side session verification
 * 
 * The service uses RxJS BehaviorSubject to provide reactive user state
 * that components can subscribe to for real-time authentication updates.
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Angular core imports for dependency injection and platform detection
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

// HTTP client for API communication
import { HttpClient } from '@angular/common/http';

// RxJS imports for reactive programming
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Platform detection for browser-specific operations
import { isPlatformBrowser } from '@angular/common';

// Custom storage service for localStorage operations
import { StorageService } from './storage.service';

/**
 * Authentication Service
 * 
 * Manages user authentication state and provides methods for login/logout.
 * Uses reactive programming patterns to notify components of authentication changes.
 */
@Injectable({
  providedIn: 'root' // Singleton service available throughout the application
})
export class AuthService {
  // BehaviorSubject holds the current user state and emits to subscribers
  // BehaviorSubject vs Subject: BehaviorSubject has initial value and replays last value to new subscribers
  private userSubject = new BehaviorSubject<any>(null);
  
  // Public observable for components to subscribe to user state changes
  user$ = this.userSubject.asObservable();

  /**
   * Constructor - Initialize authentication service
   * 
   * @param http HttpClient for making API requests
   * @param platformId Platform identifier to detect browser vs server environment
   * @param storageService Custom service for localStorage operations
   */
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private storageService: StorageService
  ) {
    // Only perform browser-specific operations when running in browser
    // This prevents errors during server-side rendering
    if (isPlatformBrowser(this.platformId)) {
      // Defer session check to next tick to ensure DOM is fully initialized
      // setTimeout with 0 pushes execution to end of current call stack
      setTimeout(() => this.checkSession(), 0);
    }
  }

  /**
   * Check for existing authentication session
   * 
   * This method is called during service initialization to restore user state.
   * It implements a two-tier approach:
   * 1. Check localStorage for previously stored user data (fast)
   * 2. Verify with server that session is still valid (authoritative)
   * 
   * This provides both immediate UI updates and server validation.
   */
  private checkSession(): void {
    // STEP 1: Check localStorage for persisted user data
    const storedUser = this.storageService.getItem('user');
    if (storedUser) {
      // Parse stored user data and immediately update UI
      const user = JSON.parse(storedUser);
      this.userSubject.next(user);
      
      // STEP 2: Verify session is still valid on server
      this.getSession().subscribe({
        next: (response) => {
          // Session is valid, update with fresh data from server
          this.setUser(response);
        },
        error: () => {
          // Session expired on server, clear local storage
          this.clearUser();
        }
      });
    } else {
      // STEP 3: No stored user, check if there's an active session on server
      this.getSession().subscribe({
        next: (response) => {
          // Active session found, set user data
          this.setUser(response);
        },
        error: () => {
          // No active session - user needs to log in
          this.clearUser();
        }
      });
    }
  }

  /**
   * Set user data in both memory and persistent storage
   * 
   * @param user User object containing username, role, and session info
   */
  private setUser(user: any): void {
    // Update reactive user state (notifies all subscribers)
    this.userSubject.next(user);
    
    // Persist user data to localStorage for session recovery
    this.storageService.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear user data from both memory and persistent storage
   */
  private clearUser(): void {
    // Clear reactive user state (notifies all subscribers)
    this.userSubject.next(null);
    
    // Remove persisted user data
    this.storageService.removeItem('user');
  }

  // ===== PUBLIC AUTHENTICATION METHODS =====

  /**
   * Authenticate user with username and password
   * 
   * Sends login credentials to the server and handles the response.
   * On successful login, stores user data and creates a session.
   * 
   * @param username User's login username
   * @param password User's login password
   * @returns Observable<any> Login response from server
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post('/api/login', { username, password }, { withCredentials: true })
      .pipe(
        tap(response => {
          // Login successful - store user data and session
          this.setUser(response);
        }),
        catchError(error => {
          // Login failed - ensure user state is cleared
          this.clearUser();
          throw error; // Re-throw error for component to handle
        })
      );
  }

  /**
   * Log out current user
   * 
   * Sends logout request to server to invalidate session,
   * then clears local user data. Handles server errors gracefully
   * by clearing local data even if server request fails.
   * 
   * @returns Observable<any> Logout response
   */
  logout(): Observable<any> {
    return this.http.post('/api/logout', {}, { withCredentials: true })
      .pipe(
        tap(() => {
          // Logout successful - clear user data
          this.clearUser();
        }),
        catchError(() => {
          // Even if logout fails on server, clear local data
          // This ensures UI is updated correctly
          this.clearUser();
          return of({ message: 'Logged out locally' });
        })
      );
  }

  /**
   * Get current session information from server
   * 
   * Validates that the current session is still active on the server.
   * Used for session verification and recovery.
   * 
   * @returns Observable<any> Session information
   */
  getSession(): Observable<any> {
    return this.http.get('/api/session', { withCredentials: true });
  }

  // ===== UTILITY METHODS =====

  /**
   * Get current user data
   * 
   * Returns the current user object without subscribing to changes.
   * Useful for one-time checks or accessing user data in guards.
   * 
   * @returns any Current user object or null if not logged in
   */
  getCurrentUser(): any {
    return this.userSubject.value;
  }

  /**
   * Check if user is currently logged in
   * 
   * Simple boolean check for authentication state.
   * Used in templates and route guards.
   * 
   * @returns boolean True if user is authenticated, false otherwise
   */
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}