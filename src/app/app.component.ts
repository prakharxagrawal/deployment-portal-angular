/**
 * Main Application Component for the Deployment Portal
 * 
 * This is the root component that orchestrates the entire deployment portal application.
 * It manages the overall application state and coordinates between different features:
 * 
 * KEY RESPONSIBILITIES:
 * - User authentication and session management
 * - Deployment CRUD operations and filtering
 * - Release management with admin controls
 * - CSV export functionality with date range filtering
 * - Modal dialog management for forms
 * - Global application state management
 * 
 * COMPONENT STRUCTURE:
 * - Uses standalone component architecture (Angular 16+)
 * - Imports all necessary Material Design modules
 * - Coordinates multiple child components
 * - Manages application-wide state and data flow
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Angular core imports
import { Component, OnInit, inject } from '@angular/core';

// Child component imports
import { RequestListComponent } from './request-list/request-list.component';
import { RequestDetailsComponent } from './request-details/request-details.component';
import { LoginComponent } from './login/login.component';
import { MainHeaderComponent } from './main-header/main-header.component';
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component';
import { BottomToolbarComponent } from './bottom-toolbar/bottom-toolbar.component';

// Angular common imports for platform detection and directives
import { CommonModule, isPlatformBrowser } from '@angular/common';

// Service imports for data management
import { AuthService } from './auth.service';
import { DeploymentService } from './deployment.service';

// Platform detection for browser-specific operations
import { Inject, PLATFORM_ID } from '@angular/core';

// Angular Material imports for UI components
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

// Form handling imports
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Dialog and additional Material imports
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Dialog component imports
import { NewRequestDialogComponent } from './new-request-dialog.component';
import { CreateReleaseDialogComponent } from './create-release-dialog/create-release-dialog.component';

/**
 * Root Application Component
 * 
 * This component serves as the main container for the entire application,
 * managing authentication, data flow, and component coordination.
 */
@Component({
  selector: 'app-root', // HTML tag to use this component
  standalone: true, // Standalone component (no NgModule required)
  templateUrl: './app.component.html', // External HTML template
  styleUrls: ['./app.component.css'], // External CSS styles
  imports: [
    // Angular modules and directives
    CommonModule, // Common Angular directives (ngIf, ngFor, etc.)
    FormsModule, // Template-driven forms
    ReactiveFormsModule, // Reactive forms
    
    // Material Design UI components
    MatButtonModule, // Material buttons
    MatInputModule, // Material input fields
    MatSelectModule, // Material dropdown selects
    MatSidenavModule, // Material side navigation
    MatListModule, // Material lists
    MatCardModule, // Material cards
    MatDialogModule, // Material dialogs
    MatIconModule, // Material icons
    MatFormFieldModule, // Material form fields
    ScrollingModule, // Virtual scrolling for large lists
    
    // Child components
    LoginComponent, // User authentication component
    RequestListComponent, // Deployment list display
    RequestDetailsComponent, // Deployment detail view
    MainHeaderComponent, // Application header
    MainToolbarComponent, // Main action toolbar
    BottomToolbarComponent, // Export and filtering toolbar
    CreateReleaseDialogComponent // Release creation dialog
  ]
})
export class AppComponent implements OnInit {
  // ===== COMPONENT PROPERTIES =====
  
  /**
   * Application title displayed in the header
   */
  title = 'Microservices Request Page for CRS Olympus';
  
  // ===== USER AUTHENTICATION STATE =====
  /**
   * Current authenticated user object
   * Contains username, role, and session information
   */
  user: any = null;
  
  // ===== DEPLOYMENT DATA AND FILTERING =====
  /**
   * Complete list of deployments from the server
   */
  deployments: any[] = [];
  
  /**
   * Filtered list of deployments based on current filter criteria
   * This is what gets displayed in the UI
   */
  filteredDeployments: any[] = [];
  
  // ===== MAIN FILTER PROPERTIES =====
  /**
   * Filter by deployment status (Open, In Progress, Pending, Completed)
   */
  statusFilter: string = '';
  
  /**
   * Filter by environment (UAT1, UAT2, UAT3, PERF, PROD)
   */
  envFilter: string = '';
  
  /**
   * Filter by release version (e.g., 2024-12, 2024-11)
   */
  releaseFilter: string = '';
  
  /**
   * Filter by configuration deployment status (yes/no)
   */
  configFilter: string = '';
  
  /**
   * Filter by service name
   */
  serviceFilter: string = '';
  
  /**
   * Universal search query across multiple fields
   */
  searchQuery: string = '';
  
  /**
   * Filter by team name
   */
  teamFilter: string = '';
  
  // ===== REFERENCE DATA =====
  /**
   * List of available releases loaded from server
   */
  releases: string[] = [];
  
  /**
   * Currently selected deployment for detail view
   */
  selectedDeployment: any = null;
  
  /**
   * Controls whether to show login form or main application
   */
  showLogin = true;
  
  /**
   * Predefined list of team names for filtering and selection
   */
  teams: string[] = ['Phoenix', 'Avengers', 'Transformers', 'Hyper Care', 'CRUD', 'Crusaders'];

  // ===== CSV EXPORT FILTERS (Bottom Toolbar) =====
  /**
   * Separate filters used specifically for CSV export functionality
   * These are independent of the main UI filters to allow different filter combinations
   */
  exportReleaseFilter: string = '';
  exportEnvFilter: string = '';
  exportTeamFilter: string = '';
  exportStartDate: string = '';
  exportEndDate: string = '';

  // ===== CONSTRUCTOR AND DEPENDENCY INJECTION =====
  /**
   * Constructor - Inject required services and dependencies
   * 
   * @param authService Service for user authentication and session management
   * @param deploymentService Service for deployment CRUD operations and API calls
   * @param platformId Platform identifier for browser/server detection
   * @param dialog Material Dialog service for opening modal dialogs
   */
  constructor(
    private authService: AuthService,
    private deploymentService: DeploymentService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
  ) {}

  // ===== DIALOG MANAGEMENT METHODS =====

  /**
   * Open the new request form dialog
   * 
   * Creates a modal dialog for users to submit new deployment requests.
   * Passes current releases and user info to the dialog for form population.
   * Handles successful submission by creating the deployment on the server.
   */
  openNewRequestForm() {
    // Open the dialog with required data
    const dialogRef = this.dialog.open(NewRequestDialogComponent, {
      width: '600px', // Set dialog width
      data: { 
        releases: this.releases, // Available releases for selection
        user: this.user // Current user info
      }
    });
    
    // Handle dialog close and process result
    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          // STEP 1: Add the current user as the creator
          result.createdBy = this.user.username;
          
          // STEP 2: Submit the new deployment to the server
          this.deploymentService.createDeployment(result).subscribe({
            next: () => {
              // STEP 3: Reload the deployment list to show the new request
              this.loadDeployments();
              alert('Deployment created');
            },
            error: () => alert('Error creating deployment')
          });
        }
      }
    });
  }

  /**
   * Open the create release dialog (Admin only)
   * 
   * Provides administrators with a form to create new releases.
   * Validates YYYY-MM format and prevents duplicates on the server side.
   * Reloads the release list upon successful creation.
   */
  openCreateReleaseDialog() {
    // Open the release creation dialog
    const dialogRef = this.dialog.open(CreateReleaseDialogComponent, {
      width: '400px', // Smaller dialog for simple form
      data: {} // No initial data needed
    });
    
    // Handle dialog result
    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          // STEP 1: Submit the new release to the server
          this.deploymentService.createRelease(result).subscribe({
            next: () => {
              // STEP 2: Reload releases to show the new one in dropdowns
              this.loadReleases();
              alert('Release created successfully');
            },
            error: (error) => {
              console.error('Error creating release:', error);
              alert('Error creating release');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error in create release dialog:', error);
      }
    });
  }

  // ===== TOOLBAR EVENT HANDLERS =====

  /**
   * Handle new request button click from toolbar
   * 
   * Wrapper method to maintain consistency in event handling.
   */
  onNewRequest() {
    this.openNewRequestForm();
  }

  /**
   * Handle edit request action from toolbar
   * 
   * Opens the same form dialog but pre-populated with existing deployment data.
   * Only available when a deployment is selected.
   */
  onEditRequest() {
    // Ensure a deployment is selected before editing
    if (!this.selectedDeployment) return;
    
    // Open dialog with existing deployment data for editing
    const dialogRef = this.dialog.open(NewRequestDialogComponent, {
      width: '600px',
      data: {
        releases: this.releases, // Available releases
        user: this.user, // Current user info
        deployment: { ...this.selectedDeployment } // Copy of selected deployment
      }
    });
    
    // Handle dialog result for update operation
    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          // STEP 1: Preserve immutable fields from original deployment
          // Only allow certain fields to be updated, e.g. status, environments, etc.
          // Keep serialNumber, createdBy, dateRequested, id from original
          const updatePayload = {
            ...result,
            serialNumber: this.selectedDeployment.serialNumber,
            createdBy: this.selectedDeployment.createdBy,
            dateRequested: this.selectedDeployment.dateRequested,
            id: this.selectedDeployment.id
          };
          
          // STEP 2: Send update request to server
          this.deploymentService.updateDeployment(this.selectedDeployment.id, updatePayload).subscribe({
            next: () => {
              // STEP 3: Reload deployments to reflect changes
              this.loadDeployments();
              alert('Deployment updated');
            },
            error: () => alert('Error updating deployment')
          });
        }
      },
      error: () => alert('Error updating deployment')
    });
  }

  // ===== COMPONENT LIFECYCLE =====

  /**
   * Angular OnInit lifecycle hook
   * 
   * Initializes the component by:
   * 1. Subscribing to authentication state changes
   * 2. Loading initial data when user is authenticated
   * 3. Handling login/logout state transitions
   * 
   * Only runs in browser environment to avoid SSR issues.
   */
  ngOnInit() {
    // Only execute initialization logic in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // STEP 1: Subscribe to user authentication state changes
      this.authService.user$.subscribe(user => {
        // STEP 2: Handle legacy role mapping (user -> developer)
        if (user && user.role === 'user') {
          user.role = 'developer';
        }
        
        // STEP 3: Update component state based on authentication
        this.user = user;
        this.showLogin = !user; // Show login form if no user
        
        // STEP 4: Load application data only when user is authenticated
        if (user) {
          this.loadDeployments();
          this.loadReleases();
        } else {
          // STEP 5: Clear sensitive data when user is not authenticated
          this.deployments = [];
          this.filteredDeployments = [];
          this.releases = [];
          this.selectedDeployment = null;
        }
      });
    }
  }

  // ===== DATA LOADING METHODS =====

  /**
   * Load deployments from the server with optional search
   * 
   * Fetches deployment data and applies current filters.
   * Auto-selects the first deployment for detail view.
   * Handles both initial load and search scenarios.
   * 
   * @param search Optional search term for server-side filtering
   */
  loadDeployments(search?: string) {
    console.log('Loading deployments with search:', search);
    
    // STEP 1: Fetch deployments with search and config filter
    this.deploymentService.getDeployments(search, this.configFilter).subscribe({
      next: data => {
        console.log('Deployments loaded:', data);
        
        // STEP 2: Store deployments (already sorted by backend - latest first)
        this.deployments = data;
        
        // STEP 3: Apply client-side filters for UI state
        this.applyFilters();
        
        // STEP 4: Auto-select first deployment if none selected or if search changed
        if (this.deployments.length > 0 && (!this.selectedDeployment || search)) {
          this.selectedDeployment = this.deployments[0];
          console.log('Auto-selected deployment:', this.selectedDeployment);
        }
      },
      error: (error) => {
        console.error('Error loading deployments:', error);
        alert('Error loading deployments: ' + error.message);
      }
    });
  }

  /**
   * Apply client-side filters to the deployment list
   * 
   * Filters the deployments array based on current filter settings.
   * Note: Search functionality is handled server-side in loadDeployments().
   * This method handles UI-state filters like status, environment, etc.
   */
  applyFilters() {
    let filtered = this.deployments;
    
    // FILTER 1: Status filter (Open, In Progress, Pending, Completed)
    if (this.statusFilter) {
      filtered = filtered.filter(d => (d.status || '').toLowerCase() === this.statusFilter.toLowerCase());
    }
    
    // FILTER 2: Environment filter with readiness logic
    // When PERF is selected: show requests deployed to PERF OR marked as performance ready
    // When PROD is selected: show requests deployed to PROD OR marked as production ready
    // For other environments: show requests deployed to that specific environment
    if (this.envFilter) {
      if (this.envFilter === 'PERF') {
        filtered = filtered.filter(d => 
          (d.environments || []).includes('PERF') || d.performanceReady === true
        );
      } else if (this.envFilter === 'PROD') {
        filtered = filtered.filter(d => 
          (d.environments || []).includes('PROD') || d.productionReady === true
        );
      } else {
        // For UAT1, UAT2, UAT3 - show only requests deployed to that environment
        filtered = filtered.filter(d => (d.environments || []).includes(this.envFilter));
      }
    }
    
    // FILTER 3: Release filter (exact match on release name)
    if (this.releaseFilter) {
      filtered = filtered.filter(d => d.release === this.releaseFilter);
    }
    
    // FILTER 4: Team filter (case-insensitive team name match)
    if (this.teamFilter) {
      filtered = filtered.filter(d => (d.team || '').toLowerCase() === this.teamFilter.toLowerCase());
    }
    
    // FILTER 5: Service filter (exact match on service name)
    if (this.serviceFilter) {
      filtered = filtered.filter(d => d.service === this.serviceFilter);
    }
    
    // Note: searchQuery is now handled by backend in loadDeployments(), not here
    this.filteredDeployments = filtered;
  }

  /**
   * Load available releases from the server
   * 
   * Fetches all releases and extracts their names for dropdown menus.
   * Used in both filter dropdowns and form dialogs.
   */
  loadReleases() {
    this.deploymentService.getReleases().subscribe({
      next: data => {
        // Extract release names from release objects
        this.releases = data.map((r: any) => r.name);
      },
      error: () => alert('Error loading releases')
    });
  }

  // ===== SELECTION AND UI EVENT HANDLERS =====

  /**
   * Handle deployment selection from the list
   * 
   * Updates the selected deployment for the detail view and logs
   * the selection for debugging purposes.
   * 
   * @param deployment The deployment object selected by the user
   */
  selectDeployment(deployment: any) {
    console.log('Selecting deployment:', deployment);
    this.selectedDeployment = deployment;
    console.log('canEditRequest result:', this.canEditRequest());
  }

  // ===== FILTER EVENT HANDLERS =====
  // These methods handle filter changes from the UI and apply them to the data

  /**
   * Handle status filter change
   * @param value Selected status value (Open, In Progress, Pending, Completed)
   */
  onStatusFilterChange(value: string) {
    this.statusFilter = value;
    this.applyFilters(); // Apply client-side filtering
  }

  /**
   * Handle environment filter change
   * @param value Selected environment value (UAT1, UAT2, UAT3, PERF, PROD)
   */
  onEnvFilterChange(value: string) {
    this.envFilter = value;
    this.applyFilters(); // Apply client-side filtering
  }

  /**
   * Handle release filter change
   * @param value Selected release name (e.g., 2024-12)
   */
  onReleaseFilterChange(value: string) {
    this.releaseFilter = value;
    this.applyFilters(); // Apply client-side filtering
  }
  
  /**
   * Handle configuration filter change
   * 
   * This filter requires server-side processing, so it reloads deployments
   * with the new config filter applied on the backend.
   * 
   * @param value Configuration filter value (yes/no/all)
   */
  onConfigFilterChange(value: string) {
    this.configFilter = value;
    // Reload deployments with new config filter (server-side filtering)
    this.loadDeployments(this.searchQuery.trim() || undefined);
  }
  
  /**
   * Handle service filter change
   * @param value Selected service name
   */
  onServiceFilterChange(value: string) {
    this.serviceFilter = value;
    this.applyFilters(); // Apply client-side filtering
  }
  
  /**
   * Handle search query change
   * 
   * Triggers server-side search for universal filtering across
   * multiple deployment fields (MSDR, service, dates, etc.).
   * 
   * @param value Search query string
   */
  onSearchChange(value: string) {
    this.searchQuery = value;
    // Use backend search instead of local filtering for comprehensive results
    this.loadDeployments(value.trim() || undefined);
  }

  /**
   * Handle team filter change
   * @param value Selected team name
   */
  onTeamFilterChange(value: string) {
    this.teamFilter = value;
    this.applyFilters(); // Apply client-side filtering
  }
  
  // ===== CSV EXPORT FILTER HANDLERS =====
  // These handlers manage the separate export filters in the bottom toolbar
  // They don't affect the main deployment list, only the CSV export functionality
  
  /**
   * Handle export release filter change (bottom toolbar)
   * @param value Release name for CSV export filtering
   */
  onExportReleaseFilterChange(value: string) {
    this.exportReleaseFilter = value;
  }

  /**
   * Handle export environment filter change (bottom toolbar)
   * @param value Environment name for CSV export filtering
   */
  onExportEnvFilterChange(value: string) {
    this.exportEnvFilter = value;
  }

  /**
   * Handle export team filter change (bottom toolbar)
   * @param value Team name for CSV export filtering
   */
  onExportTeamFilterChange(value: string) {
    this.exportTeamFilter = value;
  }

  /**
   * Handle export start date change (bottom toolbar)
   * @param value Start date for CSV export date range filtering
   */
  onExportStartDateChange(value: string) {
    this.exportStartDate = value;
  }

  /**
   * Handle export end date change (bottom toolbar)
   * @param value End date for CSV export date range filtering
   */
  onExportEndDateChange(value: string) {
    this.exportEndDate = value;
  }
  
  /**
   * Handle CSV export request
   * 
   * Generates and downloads a CSV file based on the export filters.
   * Creates a downloadable blob and triggers browser download.
   * 
   * @param event Export parameters including filters and date range
   */
  onExportCSV(event: {release: string, env: string, team: string, startDate: string, endDate: string}) {
    // STEP 1: Call backend to generate CSV with specified filters
    this.deploymentService.exportCSV(event.release, event.env, event.team, event.startDate, event.endDate).subscribe({
      next: (blob: Blob) => {
        // STEP 2: Create downloadable URL from blob data
        const url = window.URL.createObjectURL(blob);
        
        // STEP 3: Create temporary download link element
        const a = document.createElement('a');
        a.href = url;
        a.download = `deployments_${event.release || 'all'}_${event.env || 'all'}_${event.team || 'all'}.csv`;
        
        // STEP 4: Trigger download by simulating click
        document.body.appendChild(a);
        a.click();
        
        // STEP 5: Clean up temporary elements and URLs
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error exporting CSV')
    });
  }

  // ===== UI UTILITY METHODS =====

  /**
   * Get color code for deployment status
   * 
   * Returns appropriate color for status indicators in the UI.
   * Used for status badges and visual feedback.
   * 
   * @param status Deployment status string
   * @returns CSS color code for the status
   */
  getStatusColor(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'open': return '#1976d2'; // Blue - new requests
      case 'in progress': return '#ffb300'; // Yellow - work in progress
      case 'pending': return '#e53935'; // Red - waiting for action
      case 'completed': return '#43a047'; // Green - finished
      default: return '#1976d2'; // Default to blue (Open status)
    }
  }

  // ===== AUTHENTICATION METHODS =====

  /**
   * Handle successful login from login component
   * 
   * Updates the user state and hides the login form when user successfully authenticates.
   * This method is called by the login component's output event.
   * 
   * @param user The authenticated user object from the login component
   */
  onLogin(user: any) {
    this.user = user;
    this.showLogin = false;
    // Data will be loaded automatically via the user$ subscription in ngOnInit
  }

  /**
   * Handle user logout
   * 
   * Clears user session and resets application state to login screen.
   * Cleans up all user-specific data and selections.
   */
  logout() {
    this.authService.logout().subscribe(() => {
      // Clear all user-related state
      this.user = null;
      this.showLogin = true;
      this.deployments = [];
      this.releases = [];
      this.selectedDeployment = null;
    });
  }

  // ===== LEGACY METHODS =====

  /**
   * Create release using prompt dialog (legacy method)
   * 
   * @deprecated Use openCreateReleaseDialog() instead for better UX
   * 
   * This method uses browser prompt() which provides poor user experience.
   * The new dialog-based approach is preferred for consistency.
   */
  createRelease() {
    if (isPlatformBrowser(this.platformId)) {
      const release = prompt('Enter new release name:');
      if (release) {
        this.deploymentService.createRelease(release).subscribe({
          next: () => this.loadReleases(),
          error: () => alert('Error creating release')
        });
      }
    }
  }

  // ===== DEPLOYMENT UPDATE HANDLERS =====

  /**
   * Handle RLM ID updates from detail view
   * 
   * Auto-saves RLM changes for admin and superadmin users.
   * This provides seamless inline editing for environment IDs.
   * 
   * @param deployment Updated deployment object with new RLM IDs
   */
  onRlmUpdate(deployment: any) {
    // Only allow RLM updates for admin roles
    if (this.user && (this.user.role === 'admin' || this.user.role === 'superadmin') && deployment.id) {
      this.deploymentService.updateDeployment(deployment.id, deployment).subscribe({
        next: () => {
          // Silently update - no alert needed for RLM changes (seamless UX)
          this.loadDeployments();
        },
        error: () => alert('Error updating RLM IDs')
      });
    }
  }

  /**
   * Handle general deployment updates from detail view
   * 
   * Manages deployment updates with role-based permissions:
   * - Admin/Superadmin: Can update status and RLM IDs
   * - Developers: Can update production ready flag (if owner and status is Completed)
   * - Superadmin: Can update everything
   * 
   * @param deployment Updated deployment object
   */
  onDeploymentUpdate(deployment: any) {
    if (this.user && deployment.id) {
      // Check user permissions
      const isAdmin = this.user.role === 'admin' || this.user.role === 'superadmin';
      const isDeveloperOwner = this.user.role === 'developer' && 
                               this.user.username === deployment.createdBy && 
                               deployment.status === 'Completed';
      
      // Only proceed if user has appropriate permissions
      if (isAdmin || isDeveloperOwner) {
        this.deploymentService.updateDeployment(deployment.id, deployment).subscribe({
          next: () => {
            alert('Deployment updated successfully');
            this.loadDeployments(); // Refresh list to show changes
          },
          error: () => alert('Error updating deployment')
        });
      }
    }
  }

  // ===== PERMISSION GETTERS =====
  // These computed properties determine what actions are available to the current user

  /**
   * Check if current user can edit the selected deployment
   * @returns boolean indicating edit permission
   */
  get canEdit(): boolean {
    return this.canEditRequest();
  }
  
  /**
   * Check if current user can create new deployment requests
   * @returns boolean indicating create permission
   */
  get canCreate(): boolean {
    return this.canCreateRequest();
  }

  /**
   * Determine if user can edit the currently selected deployment request
   * 
   * Edit permissions depend on user role and deployment state:
   * - Superadmin: Can edit any request (opens edit dialog)
   * - Developers: Can edit own requests if status is Open or Pending
   * - Admins: Cannot use edit dialog (they use inline editing for status/RLM only)
   * 
   * @returns boolean indicating if edit action is allowed
   */
  canEditRequest(): boolean {
    if (!this.user || !this.selectedDeployment) return false;
    
    // Superadmin has full edit access to any request
    if (this.user.role === 'superadmin') return true;
    
    // Developers can edit their own requests with specific status requirements
    if (this.user.role === 'developer') {
      const status = (this.selectedDeployment.status || '').toLowerCase();
      return (status === 'open' || status === 'pending') && 
             this.selectedDeployment.createdBy === this.user.username;
    }
    
    // Admins cannot use the edit dialog (they use inline editing for status/RLM only)
    return false;
  }
  
  /**
   * Determine if user can create new deployment requests
   * 
   * Create permissions:
   * - Developers: Can create requests
   * - Superadmins: Can create requests
   * - Admins: Cannot create requests (admin-only role for management)
   * 
   * @returns boolean indicating if create action is allowed
   */
  canCreateRequest(): boolean {
    return !!this.user && (this.user.role === 'developer' || this.user.role === 'superadmin');
  }
}