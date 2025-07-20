/**
 * Application Configuration for the Deployment Portal
 * 
 * This file defines the global providers and configuration for the Angular application.
 * It sets up essential services and features that the entire application needs:
 * 
 * - HTTP client for API communication
 * - Animations for Material Design components
 * - Session interceptor for authentication
 * - Date adapter for date picker components
 * - Client hydration for server-side rendering support
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Core Angular imports for application configuration
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Custom session interceptor for handling authentication
import { SessionInterceptor } from './session.interceptor';

// Material Design date adapter for date picker components
import { provideNativeDateAdapter } from '@angular/material/core';

/**
 * Main application configuration object
 * 
 * This configuration is passed to bootstrapApplication() in main.ts
 * and provides all the necessary services for the application to function.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Client-side hydration support for server-side rendering
    // Improves performance by preserving server-rendered content
    provideClientHydration(),
    
    // HTTP client configuration with fetch API support
    // Enables the application to make HTTP requests to the backend
    provideHttpClient(withFetch()),
    
    // Angular animations for Material Design components
    // Required for smooth transitions, overlays, and Material UI effects
    provideAnimations(),
    
    // Native date adapter for Material date picker components
    // Allows date pickers to work with JavaScript Date objects
    provideNativeDateAdapter(),
    
    // Session interceptor for authentication handling
    // Automatically adds session credentials to HTTP requests
    // and handles authentication errors globally
    {
      provide: HTTP_INTERCEPTORS, // Angular's HTTP interceptor token
      useClass: SessionInterceptor, // Our custom interceptor class
      multi: true // Allow multiple interceptors (this is one of potentially many)
    }
  ]
};