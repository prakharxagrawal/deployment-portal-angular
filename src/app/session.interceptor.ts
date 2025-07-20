/**
 * Session Interceptor for Authentication Management
 * 
 * This HTTP interceptor automatically handles session-based authentication for the deployment portal:
 * 
 * OUTGOING REQUESTS:
 * - Adds credentials (session cookies) to all API calls
 * - Adds cache-control headers to prevent caching of sensitive data
 * 
 * INCOMING RESPONSES:
 * - Monitors for 401 (Unauthorized) responses
 * - Automatically logs out users when sessions expire
 * - Handles authentication errors globally
 * 
 * This interceptor ensures seamless authentication without requiring each service
 * to manually handle session management.
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Angular core imports for dependency injection
import { Injectable } from '@angular/core';

// HTTP client imports for interceptor functionality
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';

// RxJS imports for reactive programming
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Custom authentication service for logout functionality
import { AuthService } from './auth.service';

/**
 * HTTP Interceptor for Session Management
 * 
 * Implements Angular's HttpInterceptor interface to automatically:
 * 1. Add session credentials to API requests
 * 2. Handle session expiration responses
 * 3. Automatically logout users on authentication failures
 */
@Injectable() // Makes this class available for dependency injection
export class SessionInterceptor implements HttpInterceptor {

  /**
   * Constructor - Inject AuthService for logout functionality
   * @param authService Service for handling authentication operations
   */
  constructor(private authService: AuthService) {}

  /**
   * Intercept HTTP requests and responses
   * 
   * This method is called for every HTTP request made by the application.
   * It modifies outgoing requests and handles incoming responses.
   * 
   * @param req The outgoing HTTP request
   * @param next The next handler in the interceptor chain
   * @returns Observable of HTTP events
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // STEP 1: Modify API requests to include credentials and cache control
    const apiReq = req.url.startsWith('/api') ? 
      req.clone({ 
        setHeaders: { 'Cache-Control': 'no-cache' }, // Prevent caching of API responses
        withCredentials: true // Include session cookies in the request
      }) : 
      req; // Non-API requests are passed through unchanged

    // STEP 2: Send the request and handle responses
    return next.handle(apiReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // STEP 3: Handle authentication errors (401 Unauthorized)
        if (error.status === 401 && !req.url.includes('/api/login')) {
          // Session has expired or user is not authenticated
          // Exclude login endpoint to avoid infinite logout loops
          console.log('Session expired, logging out user');
          
          // Automatically log out the user to clear local session state
          this.authService.logout().subscribe();
        }
        
        // STEP 4: Re-throw the error for the original caller to handle
        return throwError(() => error);
      })
    );
  }
}
