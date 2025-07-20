/**
 * Deployment Service for the Deployment Portal
 * 
 * This service handles all deployment-related HTTP operations and provides
 * a centralized API for components to interact with the backend.
 * 
 * Key responsibilities:
 * - CRUD operations for deployments
 * - Release management (create, retrieve)
 * - Service lookup and search
 * - CSV report generation with filtering
 * - Authentication session management
 * 
 * All methods include withCredentials: true to maintain session state.
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Angular core imports
import { Injectable } from '@angular/core';

// HTTP client for API communication
import { HttpClient } from '@angular/common/http';

// RxJS for reactive programming
import { Observable } from 'rxjs';

// TypeScript interfaces for type safety
import { Service } from './models/service.interface';
import { Deployment } from './models/deployment.interface';

/**
 * Service for managing deployment-related API operations
 * 
 * Provides methods for all deployment portal functionality including
 * CRUD operations, reporting, and service management.
 */
@Injectable({
  providedIn: 'root' // Singleton service available throughout the application
})
export class DeploymentService {

  /**
   * Constructor - Inject HTTP client for API communication
   * @param http Angular HTTP client for making API requests
   */
  constructor(private http: HttpClient) {}

  // ===== CSV EXPORT AND REPORTING =====

  /**
   * Export deployments as CSV with optional filtering
   * 
   * Generates and downloads a CSV file containing deployment data.
   * Supports filtering by release, environment, team, and date range.
   * 
   * @param release Filter by specific release (e.g., "2024-12")
   * @param environment Filter by environment (UAT1, UAT2, UAT3, PERF, PROD)
   * @param team Filter by team name
   * @param startDate Optional start date for date range filter (YYYY-MM-DD)
   * @param endDate Optional end date for date range filter (YYYY-MM-DD)
   * @returns Observable<Blob> CSV file as binary data for download
   */
  exportCSV(release: string, environment: string, team: string, startDate: string = '', endDate: string = ''): Observable<Blob> {
    // Build parameters object for the API request
    const params: any = { 
      release: release || '', // Empty string if no release filter
      environment: environment || '', // Empty string if no environment filter
      team: team || '' // Empty string if no team filter
    };
    
    // Add date range parameters only if provided
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }
    
    // Make API request expecting binary blob response (CSV file)
    return this.http.get('/api/reports/general', {
      params: params,
      responseType: 'blob', // Important: tells Angular to expect binary data
      withCredentials: true // Include session cookies
    });
  }

  // ===== RELEASE MANAGEMENT =====

  /**
   * Retrieve all releases from the backend
   * 
   * Gets a list of all releases in the system, ordered by name (latest first).
   * Used for populating release dropdown menus and filters.
   * 
   * @returns Observable<any> Array of release objects
   */
  getReleases(): Observable<any> {
    return this.http.get('/api/releases', { withCredentials: true });
  }

  /**
   * Create a new release
   * 
   * Sends a new release object to the backend for creation.
   * Validates YYYY-MM format and uniqueness on the server side.
   * 
   * @param release Release object with name and description
   * @returns Observable<any> Creation response from server
   */
  createRelease(release: any): Observable<any> {
    return this.http.post('/api/releases', release, { withCredentials: true });
  }

  // ===== DEPLOYMENT MANAGEMENT =====

  /**
   * Retrieve deployments with optional filtering
   * 
   * Gets a list of deployments with optional search and configuration filters.
   * Results are automatically sorted by date requested (latest first).
   * 
   * @param search Optional search term for universal search across multiple fields
   * @param configFilter Optional filter for configuration deployments ("yes"/"no")
   * @returns Observable<any> Array of deployment objects
   */
  getDeployments(search?: string, configFilter?: string): Observable<any> {
    // Build parameters object only including provided filters
    const params: Record<string, string> = {};
    if (search !== undefined) {
      params['search'] = search;
    }
    if (configFilter !== undefined) {
      params['config'] = configFilter;
    }
    
    return this.http.get('/api/deployments', { params, withCredentials: true });
  }

  /**
   * Create a new deployment request
   * 
   * Sends a new deployment object to the backend. The server will automatically:
   * - Generate unique MSDR serial number
   * - Set initial status to "Open"
   * - Set creation timestamp
   * 
   * @param deployment Deployment object with user-provided data
   * @returns Observable<any> Creation response from server
   */
  createDeployment(deployment: any): Observable<any> {
    return this.http.post('/api/deployments', deployment, { withCredentials: true });
  }

  /**
   * Update an existing deployment
   * 
   * Sends updated deployment data to the server. Includes business logic
   * validation for production ready flags and status transitions.
   * 
   * @param id Deployment ID to update
   * @param deployment Updated deployment object
   * @returns Observable<any> Update response from server
   */
  updateDeployment(id: string, deployment: any): Observable<any> {
    return this.http.put(`/api/deployments/${id}`, deployment, { withCredentials: true });
  }

  /**
   * Delete a deployment request
   * 
   * Completely removes a deployment from the system.
   * Used primarily for cleanup of test data or incorrect entries.
   * 
   * @param id Deployment ID to delete
   * @returns Observable<any> Deletion response from server
   */
  deleteDeployment(id: string): Observable<any> {
    return this.http.delete(`/api/deployments/${id}`, { withCredentials: true });
  }

  // ===== LEGACY REPORTING METHOD =====

  /**
   * Generate report (legacy method)
   * 
   * @deprecated Use exportCSV() method instead for more comprehensive filtering
   * 
   * This method is kept for backward compatibility but has limited filtering options.
   * The exportCSV() method provides more features including date range filtering.
   * 
   * @param release Filter by release name
   * @param environment Filter by environment
   * @returns Observable<any> Report data as text
   */
  generateReport(release: string, environment: string): Observable<any> {
    return this.http.get('/api/reports/general', { 
      params: { release, environment }, 
      responseType: 'text', // Expects text response instead of blob
      withCredentials: true 
    });
  }

  // ===== AUTHENTICATION =====

  /**
   * Logout current user
   * 
   * Note: This method duplicates functionality from AuthService.
   * Consider using AuthService.logout() directly for consistency.
   * 
   * @returns Observable<any> Logout response
   */
  logout(): Observable<any> {
    return this.http.post('/api/logout', {}, { withCredentials: true });
  }

  // ===== SERVICE MANAGEMENT =====

  /**
   * Get all available services
   * 
   * Retrieves a complete list of services available for deployment requests.
   * Services are returned sorted alphabetically by name.
   * 
   * @returns Observable<Service[]> Array of service objects
   */
  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>('/api/services', { withCredentials: true });
  }

  /**
   * Search services by name
   * 
   * Provides typeahead/autocomplete functionality for service selection.
   * Performs case-insensitive partial matching on service names.
   * 
   * @param query Search term to match against service names
   * @returns Observable<Service[]> Array of matching service objects
   */
  searchServices(query: string): Observable<Service[]> {
    return this.http.get<Service[]>(`/api/services/search?query=${query}`, { withCredentials: true });
  }
}