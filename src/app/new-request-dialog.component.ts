// Import Angular core decorators and lifecycle hooks
import { Component, Inject, OnInit } from '@angular/core';
// Import Angular Material dialog components and injection tokens
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
// Import reactive forms modules and validation
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
// Import Angular Material UI components for the form
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
// Import CommonModule for basic Angular directives
import { CommonModule } from '@angular/common';
// Import deployment service for API calls
import { DeploymentService } from './deployment.service';
// Import type interfaces for type safety
import { Service } from './models/service.interface';
import { Deployment } from './models/deployment.interface';
// Import RxJS operators for reactive programming
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * NewRequestDialogComponent provides a modal dialog for creating new deployment requests
 * Uses Angular Material dialog for consistent UI and reactive forms for validation
 * Supports both creating new requests and editing existing ones
 * 
 * Features:
 * - Service autocomplete with server-side search
 * - Comprehensive form validation including custom validators
 * - Config request toggle with conditional field requirements
 * - Production and performance readiness flags
 * - Environment-specific RLM ID fields with conditional display
 * - Prefix validation for request IDs and branch names
 */
@Component({
  selector: 'app-new-request-dialog',
  standalone: true,
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">{{ isEditMode ? 'Edit Deployment Request' : 'New Deployment Request' }}</h2>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="compact-form">
          <div class="form-grid">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>CSI ID</mat-label>
              <mat-select formControlName="csiId" [disabled]="isFormReadOnly">
                <mat-option *ngFor="let id of csiIds" [value]="id">{{ id }}</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Service</mat-label>
              <input type="text" 
                     matInput 
                     formControlName="service" 
                     [matAutocomplete]="serviceAuto"
                     [readonly]="isFormReadOnly"
                     placeholder="Type to search services...">
              <mat-autocomplete #serviceAuto="matAutocomplete" [displayWith]="displayService">
                <mat-option *ngFor="let service of filteredServices" [value]="service.name">
                  {{ service.name }}
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Request ID</mat-label>
              <input matInput formControlName="requestId" [readonly]="isFormReadOnly">
              <mat-error *ngIf="form.get('requestId')?.errors?.['startsWithPrefix']">
                Request ID must start with "jenkins-"
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Upcoming Branch</mat-label>
              <input matInput formControlName="upcomingBranch" [readonly]="isFormReadOnly" placeholder="Alternative to Request ID">
              <mat-error *ngIf="form.get('upcomingBranch')?.errors?.['startsWithPrefix']">
                Upcoming Branch must start with "upcoming/"
              </mat-error>
            </mat-form-field>
            
            <!-- Validation error for Request ID / Upcoming Branch -->
            <div *ngIf="form.errors?.['atLeastOneRequired'] && (form.get('requestId')?.touched || form.get('upcomingBranch')?.touched)" 
                 class="validation-error">
              Either Request ID or Upcoming Branch is required
            </div>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Team</mat-label>
              <mat-select formControlName="team" [disabled]="isFormReadOnly">
                <mat-option *ngFor="let team of teams" [value]="team">{{ team }}</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field span-2">
              <mat-label>Environments</mat-label>
              <mat-select formControlName="environments" multiple [disabled]="isFormReadOnly"
                         (selectionChange)="onEnvironmentsChange($event)">
                <mat-option *ngFor="let env of environments" [value]="env">{{ env }}</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Release</mat-label>
              <mat-select formControlName="release" [disabled]="isFormReadOnly">
                <mat-option *ngFor="let release of data.releases" [value]="release">{{ release }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          
          <div class="config-section">
            <mat-checkbox formControlName="isConfig" (change)="onConfigChange($event)" [disabled]="isFormReadOnly" class="config-checkbox">
              Config Request
            </mat-checkbox>
            <div *ngIf="form.get('isConfig')?.value" class="config-fields">
              <mat-form-field appearance="outline" class="config-field">
                <mat-label>Config Request ID</mat-label>
                <input matInput formControlName="configRequestId" [readonly]="isFormReadOnly">
                <mat-error *ngIf="form.get('configRequestId')?.errors?.['startsWithPrefix']">
                  Config Request ID must start with "jenkins-"
                </mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline" class="config-field">
                <mat-label>Upcoming Config Branch</mat-label>
                <input matInput formControlName="upcomingConfigBranch" [readonly]="isFormReadOnly" placeholder="Alternative to Config Request ID">
                <mat-error *ngIf="form.get('upcomingConfigBranch')?.errors?.['startsWithPrefix']">
                  Upcoming Config Branch must start with "upcoming/"
                </mat-error>
              </mat-form-field>
              <!-- Validation error for Config Request ID / Upcoming Config Branch -->
              <div *ngIf="form.get('isConfig')?.value && form.errors?.['configAtLeastOneRequired'] && (form.get('configRequestId')?.touched || form.get('upcomingConfigBranch')?.touched)" 
                   class="validation-error">
                Either Config Request ID or Upcoming Config Branch is required when Config is checked
              </div>
            </div>
          </div>
          
          <!-- Admin notice for read-only forms -->
          <div *ngIf="isFormReadOnly && data.user?.role !== 'superadmin'" class="readonly-notice">
            <mat-icon class="warning-icon">lock</mat-icon>
            <span>This request is locked because readiness has been marked. Only Super Admins can make changes.</span>
          </div>
          
          <div class="readiness-section" *ngIf="canMarkProductionReady">
            <mat-checkbox formControlName="productionReady" 
                         (change)="onReadinessChange('productionReady', $event)" 
                         class="readiness-checkbox">
              Mark as Production Ready
            </mat-checkbox>
            <small class="readiness-help">Only available for completed requests</small>
            <mat-checkbox formControlName="performanceReady" 
                         (change)="onReadinessChange('performanceReady', $event)" 
                         [disabled]="isPerfEnvironmentSelected()"
                         class="readiness-checkbox">
              Mark as Performance Ready
            </mat-checkbox>
            <small class="readiness-help" *ngIf="!isPerfEnvironmentSelected()">Only available for completed requests</small>
            <small class="readiness-help" *ngIf="isPerfEnvironmentSelected()">Auto-checked when PERF environment is selected</small>
            <small class="readiness-help">Only available for completed requests</small>
          </div>
          
          <!-- RLM ID Fields Section -->
          <div class="rlm-section" *ngIf="shouldShowRlmFields()">
            <h4 class="rlm-title">RLM IDs</h4>
            <div class="rlm-grid">
              <!-- UAT Environment RLM IDs (always visible when RLM section shown) -->
              <mat-form-field appearance="outline" class="rlm-field" *ngIf="hasEnvironment('UAT1')">
                <mat-label>UAT1 RLM ID</mat-label>
                <input matInput formControlName="rlmIdUat1">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="rlm-field" *ngIf="hasEnvironment('UAT2')">
                <mat-label>UAT2 RLM ID</mat-label>
                <input matInput formControlName="rlmIdUat2">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="rlm-field" *ngIf="hasEnvironment('UAT3')">
                <mat-label>UAT3 RLM ID</mat-label>
                <input matInput formControlName="rlmIdUat3">
              </mat-form-field>
              
              <!-- Performance Environment RLM IDs (show when performanceReady=true OR PERF environment selected) -->
              <mat-form-field appearance="outline" class="rlm-field" *ngIf="shouldShowPerfRlmIds()">
                <mat-label>PERF1 RLM ID</mat-label>
                <input matInput formControlName="rlmIdPerf1">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="rlm-field" *ngIf="shouldShowPerfRlmIds()">
                <mat-label>PERF2 RLM ID</mat-label>
                <input matInput formControlName="rlmIdPerf2">
              </mat-form-field>
              
              <!-- Production Environment RLM IDs (show when productionReady=true OR PROD environment selected) -->
              <mat-form-field appearance="outline" class="rlm-field" *ngIf="shouldShowProdRlmIds() && hasEnvironment('PROD1')">
                <mat-label>PROD1 RLM ID</mat-label>
                <input matInput formControlName="rlmIdProd1">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="rlm-field" *ngIf="shouldShowProdRlmIds() && hasEnvironment('PROD2')">
                <mat-label>PROD2 RLM ID</mat-label>
                <input matInput formControlName="rlmIdProd2">
              </mat-form-field>
            </div>
          </div>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" type="button" class="cancel-btn">Cancel</button>
        <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || isFormReadOnly" class="submit-btn">
          {{ isEditMode ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 600px;
      width: 100%;
    }
    
    .dialog-title {
      margin: 0 0 16px 0;
      font-size: 1.3em;
      font-weight: 500;
      color: #333;
    }
    
    .dialog-content {
      padding: 0 !important;
      margin: 0;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .compact-form {
      width: 100%;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 20px;
      margin-bottom: 20px;
    }
    
    .form-field {
      width: 100%;
    }
    
    .span-2 {
      grid-column: span 2;
    }
    
    .config-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }
    
    .config-checkbox {
      margin-bottom: 8px;
    }
    
    .config-field {
      width: 100%;
      max-width: 300px;
    }
    
    .config-fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }
    
    .readiness-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      margin-top: 16px;
    }
    
    .readiness-checkbox {
      margin-bottom: 4px;
    }
    
    .readiness-help {
      color: #666;
      font-size: 0.85em;
      margin-left: 24px;
      margin-bottom: 8px;
    }
    
    .rlm-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      margin-top: 20px;
    }
    
    .rlm-title {
      margin: 0 0 8px 0;
      font-size: 1.1em;
      font-weight: 500;
      color: #333;
    }
    
    .rlm-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 20px;
    }
    
    .rlm-field {
      width: 100%;
    }
    
    .dialog-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding: 16px 0 0 0 !important;
      justify-content: flex-end;
      border-top: 1px solid #e0e0e0;
    }
    
    .cancel-btn {
      background: #f5f5f5;
      color: #666;
      border: 1px solid #ddd;
    }
    
    .submit-btn {
      background: #1976d2;
      color: white;
      min-width: 100px;
    }
    
    .submit-btn:disabled {
      background: #ccc;
      color: #999;
    }
    
    /* Ensure Material form fields have proper sizing */
    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
    
    ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      height: 48px;
    }
    
    ::ng-deep .mat-mdc-form-field-infix {
      min-height: 40px;
    }
    
    .validation-error {
      color: #f44336;
      font-size: 0.85em;
      margin-top: -8px;
      margin-bottom: 8px;
      padding-left: 16px;
    }
    
    .readonly-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      margin: 16px 0;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      color: #856404;
      font-size: 0.9em;
    }
    
    .warning-icon {
      color: #ff9800;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
  imports: [ // Import necessary modules for dialog and form functionality
    CommonModule, // Basic Angular directives
    FormsModule, // Template-driven forms
    ReactiveFormsModule, // Reactive forms
    MatDialogModule, // Material dialog components
    MatDialogActions, // Material dialog action buttons
    MatDialogContent, // Material dialog content wrapper
    MatDialogTitle, // Material dialog title
    MatButtonModule, // Material buttons
    MatInputModule, // Material input fields
    MatSelectModule, // Material select dropdowns
    MatFormFieldModule, // Material form field wrapper
    MatCheckboxModule, // Material checkboxes
    MatAutocompleteModule, // Material autocomplete
    MatIconModule // Material icons
  ]
})
export class NewRequestDialogComponent implements OnInit {
  // Form group that manages all form controls and validation
  form!: FormGroup;
  
  // Component state flags
  isEditMode = false; // Tracks whether we're editing an existing deployment or creating new
  
  // Data arrays for dropdown options
  csiIds: string[] = []; // Available CSI IDs for selection (loaded from backend data)
  teams: string[] = []; // Available development teams (loaded from backend data)
  environments = ['UAT1', 'UAT2', 'UAT3', 'PERF']; // Available target environments (PROD removed - only available through readiness approval)
  // Note: When user selects PERF, backend automatically expands to PERF1 and PERF2
  
  // Service autocomplete related properties
  services: Service[] = []; // Complete list of services from the backend
  filteredServices: Service[] = []; // Filtered list based on user search input

  /**
   * Constructor for NewRequestDialogComponent
   * @param fb - Angular FormBuilder for creating reactive forms
   * @param dialogRef - Reference to the current dialog instance
   * @param data - Injected data containing releases, user info, and optional deployment for editing
   * @param deploymentService - Service for making API calls to backend
   */
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private deploymentService: DeploymentService
  ) {
    // Initialize reactive form with all required fields and validation rules
    this.form = this.fb.group({
      // Form control definitions with initial values and validation rules
      csiId: ['', Validators.required], // Customer Service Identifier - required field
      service: ['', Validators.required], // Service name with autocomplete - required field
      requestId: ['', this.startsWithValidator('jenkins-')], // Must start with 'jenkins-'
      upcomingBranch: ['', this.startsWithValidator('upcoming/')], // Must start with 'upcoming/'
      environments: [[], Validators.required], // Array of target environments - required field
      team: ['', Validators.required], // Requesting team name - required field
      release: ['', Validators.required], // Release version - required field
      isConfig: [false], // Boolean flag for configuration requests - optional
      configRequestId: ['', this.startsWithValidator('jenkins-')], // Config ID must start with 'jenkins-'
      upcomingConfigBranch: ['', this.startsWithValidator('upcoming/')], // Config branch must start with 'upcoming/'
      productionReady: [false], // Production readiness flag - optional
      performanceReady: [false], // Performance readiness flag - optional
      status: ['Open'], // Current deployment status - defaults to Open for new requests
      // RLM ID fields for each environment
      rlmIdUat1: [''], // UAT1 environment RLM ID - optional
      rlmIdUat2: [''], // UAT2 environment RLM ID - optional
      rlmIdUat3: [''], // UAT3 environment RLM ID - optional
      rlmIdPerf1: [''], // Performance 1 environment RLM ID - optional
      rlmIdPerf2: [''], // Performance 2 environment RLM ID - optional
      rlmIdProd1: [''], // Production 1 environment RLM ID - optional
      rlmIdProd2: [''] // Production 2 environment RLM ID - optional
    }, { 
      validators: [
        this.atLeastOneRequiredValidator('requestId', 'upcomingBranch'),
        this.configAtLeastOneRequiredValidator('configRequestId', 'upcomingConfigBranch')
      ] 
    });

    // If editing an existing deployment, populate form with current values
    if (data && data.deployment) {
      this.isEditMode = true; // Switch to edit mode
      const d = data.deployment; // Shorthand reference to deployment data
      
      // Patch form values with existing deployment data
      this.form.patchValue({
        csiId: d.csiId || '',
        service: d.service || '',
        requestId: d.requestId || '',
        upcomingBranch: d.upcomingBranch || '',
        environments: d.environments || [],
        team: d.team || '',
        release: d.release || '',
        isConfig: d.isConfig || false,
        configRequestId: d.configRequestId || '',
        upcomingConfigBranch: d.upcomingConfigBranch || '',
        productionReady: d.productionReady || false,
        performanceReady: d.performanceReady || false,
        status: d.status || 'Open',
        // Include RLM ID fields
        rlmIdUat1: d.rlmIdUat1 || '',
        rlmIdUat2: d.rlmIdUat2 || '',
        rlmIdUat3: d.rlmIdUat3 || '',
        rlmIdPerf1: d.rlmIdPerf1 || '',
        rlmIdPerf2: d.rlmIdPerf2 || '',
        rlmIdProd1: d.rlmIdProd1 || '',
        rlmIdProd2: d.rlmIdProd2 || ''
      });
      
      // The form validation is handled by the configAtLeastOneRequiredValidator
      // No need to set individual validators on config fields
    }
  }

  /**
   * Custom validator that ensures a field starts with a specific prefix
   * @param prefix - Required prefix (e.g., 'jenkins-', 'upcoming/')
   * @returns Validator function
   */
  startsWithValidator(prefix: string) {
    return (control: any) => {
      if (!control.value) {
        return null; // Don't validate empty values - other validators handle required
      }
      const value = control.value.trim();
      if (!value.startsWith(prefix)) {
        return { startsWithPrefix: { requiredPrefix: prefix, actualValue: value } };
      }
      return null;
    };
  }

  /**
   * Custom validator for ensuring at least one of two fields is filled
   * @param field1 - First field name
   * @param field2 - Second field name
   * @returns Validator function
   */
  atLeastOneRequiredValidator(field1: string, field2: string) {
    return (group: FormGroup) => {
      const control1 = group.get(field1);
      const control2 = group.get(field2);
      
      if (!control1 || !control2) {
        return null;
      }
      
      const value1 = control1.value?.trim();
      const value2 = control2.value?.trim();
      
      if (!value1 && !value2) {
        return { atLeastOneRequired: true };
      }
      
      return null;
    };
  }

  /**
   * Custom validator for config fields - ensures at least one config field is filled when config is enabled
   * @param field1 - First config field name
   * @param field2 - Second config field name
   * @returns Validator function
   */
  configAtLeastOneRequiredValidator(field1: string, field2: string) {
    return (group: FormGroup) => {
      const isConfig = group.get('isConfig')?.value;
      const control1 = group.get(field1);
      const control2 = group.get(field2);
      
      if (!isConfig || !control1 || !control2) {
        return null;
      }
      
      const value1 = control1.value?.trim();
      const value2 = control2.value?.trim();
      
      if (!value1 && !value2) {
        return { configAtLeastOneRequired: true };
      }
      
      return null;
    };
  }

  /**
   * Angular lifecycle hook that runs after component initialization
   * Sets up service data loading and search functionality
   */
  ngOnInit() {
    this.loadServices(); // Load initial list of services
    this.setupServiceSearch(); // Set up reactive search for service autocomplete
    this.loadCsiIds(); // Load available CSI IDs from backend data
    this.loadTeams(); // Load available teams from backend data
  }

  /**
   * Method that loads all available services from the backend API
   * Populates both the complete services list and the filtered list for autocomplete
   */
  loadServices() {
    this.deploymentService.getAllServices().subscribe(services => {
      this.services = services; // Store complete list
      this.filteredServices = services; // Initialize filtered list with all services
    });
  }

  /**
   * Method that loads available CSI IDs from existing deployment data
   * Extracts unique CSI IDs from all deployments
   */
  loadCsiIds() {
    this.deploymentService.getDeployments().subscribe(deployments => {
      // Extract unique CSI IDs from all deployments
      const uniqueCsiIds = Array.from(new Set(deployments.map((d: any) => d.csiId).filter((csiId: any) => csiId))) as string[];
      this.csiIds = uniqueCsiIds.sort(); // Sort for consistent ordering
    });
  }

  /**
   * Method that loads available team names from existing deployment data
   * Extracts unique team names from all deployments
   */
  loadTeams() {
    this.deploymentService.getDeployments().subscribe(deployments => {
      // Extract unique team names from all deployments
      const uniqueTeams = Array.from(new Set(deployments.map((d: any) => d.team).filter((team: any) => team))) as string[];
      this.teams = uniqueTeams.sort(); // Sort for consistent ordering
    });
  }

  /**
   * Method that sets up reactive search functionality for the service autocomplete field
   * Uses RxJS operators to debounce user input and perform server-side search
   */
  setupServiceSearch() {
    this.form.get('service')?.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing to avoid excessive API calls
        distinctUntilChanged(), // Only proceed if the value actually changed
        switchMap(query => { // Switch to new search observable, canceling previous ones
          if (query && query.length > 0) {
            // Perform server-side search if query is not empty
            return this.deploymentService.searchServices(query);
          } else {
            // Return all services if query is empty
            return of(this.services);
          }
        })
      )
      .subscribe(services => {
        // Update filtered services list with search results
        this.filteredServices = services;
      });
  }

  /**
   * Method used by Material Autocomplete to display service names
   * @param serviceName - The service name to display
   * @returns The service name or empty string if undefined
   */
  displayService(serviceName?: string): string {
    return serviceName || '';
  }

  /**
   * Method used by Material Select to compare service objects for equality
   * @param service1 - First service name to compare
   * @param service2 - Second service name to compare
   * @returns boolean indicating if the services are the same
   */
  compareServices(service1: string, service2: string): boolean {
    return service1 === service2;
  }

  /**
   * Computed property that determines if form fields should be read-only
   * Form becomes read-only when:
   * 1. Either readiness flag (productionReady or performanceReady) is true
   * 2. Unless user is superadmin (who can always edit)
   */
  get isFormReadOnly(): boolean {
    if (!this.isEditMode || !this.data.deployment) return false;
    if (this.data.user?.role === 'superadmin') return false; // Superadmin can always edit
    
    const deployment = this.data.deployment;
    return deployment.productionReady === true || deployment.performanceReady === true;
  }

  /**
   * Computed property that determines if the production ready checkbox should be visible and editable
   * Production readiness can only be marked by:
   * 1. SuperAdmins (full admin privileges)
   * 2. Original requesters (person who created the deployment)
   * 3. Only when the deployment status is 'Completed'
   * 4. Only in edit mode (not when creating new requests)
   */
  get canMarkProductionReady(): boolean {
    if (!this.isEditMode || !this.data.deployment) return false;
    return this.data.deployment.status === 'Completed' && 
           (this.data.user?.role === 'superadmin' || 
            this.data.user?.username === this.data.deployment.createdBy);
  }

  /**
   * Event handler for configuration request checkbox changes
   * The validation is handled by the custom configAtLeastOneRequiredValidator
   * @param event - Material checkbox change event
   */
  onConfigChange(event: any) {
    const isConfig = event.checked;
    if (!isConfig) {
      // If config request is unchecked, clear the config fields
      this.form.get('configRequestId')?.setValue('');
      this.form.get('upcomingConfigBranch')?.setValue('');
    }
    // Trigger validation update to apply the configAtLeastOneRequiredValidator
    this.form.updateValueAndValidity();
  }

  /**
   * Event handler for readiness flag changes (production/performance ready)
   * When a readiness flag is checked:
   * 1. Reset status to "Pending" to indicate review needed
   * 2. Make form fields read-only except for admin users
   * 3. Trigger validation update
   * @param fieldName - Name of the readiness field ('productionReady' or 'performanceReady')
   * @param event - Material checkbox change event
   */
  onReadinessChange(fieldName: string, event: any) {
    const isChecked = event.checked;
    
    if (isChecked) {
      // When readiness is marked, reset status to Pending for review
      this.form.get('status')?.setValue('Pending');
      
      // Note: Form field restrictions would be handled by the backend
      // or additional component logic based on user roles
      console.log(`${fieldName} marked as ready, status reset to Pending`);
    }
    
    // Trigger validation update
    this.form.updateValueAndValidity();
  }

  /**
   * Method that handles dialog cancellation
   * Closes the dialog without returning any data
   */
  onCancel() {
    this.dialogRef.close();
  }

  /**
   * Method that handles form submission
   * Validates the form and returns the form data to the parent component
   * Includes the original deployment ID if in edit mode
   */
  submit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const result = {
        ...formValue,
        // Include the original ID if editing to identify which deployment to update
        ...(this.isEditMode && this.data.deployment ? { id: this.data.deployment.id } : {})
      };
      // Close dialog and return the form data to the parent component
      this.dialogRef.close(result);
    } else {
      // If form is invalid, mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.form);
    }
  }

  /**
   * Helper method to mark all fields in a form group as touched
   * This triggers validation error display for all invalid fields
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  /**
   * Helper method to determine if RLM ID fields section should be displayed
   * RLM fields are shown only in edit mode AND when status is Completed
   */
  shouldShowRlmFields(): boolean {
    if (!this.isEditMode) return false;
    const status = this.form.get('status')?.value;
    return status === 'Completed';
  }

  /**
   * Helper method to check if a specific environment is selected
   * @param environment - Environment code to check for
   */
  hasEnvironment(environment: string): boolean {
    const environments = this.form.get('environments')?.value || [];
    return environments.includes(environment);
  }

  /**
   * Helper method to determine if Performance RLM ID fields should be shown
   * PERF RLM IDs are visible when:
   * 1. performanceReady flag is true, OR
   * 2. PERF environment is selected (which means user wants both PERF1 and PERF2)
   */
  shouldShowPerfRlmIds(): boolean {
    const performanceReady = this.form.get('performanceReady')?.value;
    const environments = this.form.get('environments')?.value || [];
    const hasPerfEnvironment = environments.includes('PERF');
    
    return performanceReady || hasPerfEnvironment;
  }

  /**
   * Helper method to determine if Production RLM ID fields should be shown
   * PROD RLM IDs are visible when:
   * 1. productionReady flag is true, OR
   * 2. Any PROD environment (PROD1, PROD2) is selected
   */
  shouldShowProdRlmIds(): boolean {
    const productionReady = this.form.get('productionReady')?.value;
    const environments = this.form.get('environments')?.value || [];
    const hasProdEnvironment = environments.some((env: string) => env.startsWith('PROD'));
    
    return productionReady || hasProdEnvironment;
  }

  /**
   * Helper method to check if PERF environment is selected
   * Used to determine if performance ready checkbox should be disabled and auto-checked
   */
  isPerfEnvironmentSelected(): boolean {
    const environments = this.form.get('environments')?.value || [];
    return environments.includes('PERF');
  }

  /**
   * Method that handles environment selection changes
   * Synchronizes PERF environment selection with performance ready checkbox
   * @param event - Mat-select selection change event
   */
  onEnvironmentsChange(event: any) {
    const selectedEnvironments = event.value || [];
    
    // If PERF is selected, auto-check performance ready
    if (selectedEnvironments.includes('PERF')) {
      this.form.get('performanceReady')?.setValue(true);
      console.log('PERF environment selected - auto-checked Performance Ready');
    }
    
    // Trigger validation update
    this.form.updateValueAndValidity();
  }
}