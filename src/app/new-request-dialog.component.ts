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
 * or editing existing ones. The component supports:
 * - Creating new deployment requests with all required fields
 * - Editing existing deployment requests (with permission checks)
 * - Service autocomplete with server-side search
 * - Configuration request handling
 * - Production readiness marking (for completed requests)
 * - Form validation and error handling
 */

@Component({
  selector: 'app-new-request-dialog', // HTML tag to use this component: <app-new-request-dialog>
  standalone: true, // This component doesn't depend on NgModule
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">{{ isEditMode ? 'Edit Deployment Request' : 'New Deployment Request' }}</h2>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="compact-form">
          <div class="form-grid">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>CSI ID</mat-label>
              <mat-select formControlName="csiId">
                <mat-option *ngFor="let id of csiIds" [value]="id">{{ id }}</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Service</mat-label>
              <input type="text" 
                     matInput 
                     formControlName="service" 
                     [matAutocomplete]="serviceAuto"
                     placeholder="Type to search services...">
              <mat-autocomplete #serviceAuto="matAutocomplete" [displayWith]="displayService">
                <mat-option *ngFor="let service of filteredServices" [value]="service.name">
                  {{ service.name }}
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Request ID</mat-label>
              <input matInput formControlName="requestId">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Team</mat-label>
              <mat-select formControlName="team">
                <mat-option *ngFor="let team of teams" [value]="team">{{ team }}</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field span-2">
              <mat-label>Environments</mat-label>
              <mat-select formControlName="environments" multiple>
                <mat-option *ngFor="let env of environments" [value]="env">{{ env }}</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Release</mat-label>
              <mat-select formControlName="release">
                <mat-option *ngFor="let release of data.releases" [value]="release">{{ release }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          
          <div class="config-section">
            <mat-checkbox formControlName="isConfig" (change)="onConfigChange($event)" class="config-checkbox">
              Config Request
            </mat-checkbox>
            <mat-form-field *ngIf="form.get('isConfig')?.value" appearance="outline" class="config-field">
              <mat-label>Config Request ID</mat-label>
              <input matInput formControlName="configRequestId">
            </mat-form-field>
          </div>
          
          <div class="production-section" *ngIf="canMarkProductionReady">
            <mat-checkbox formControlName="productionReady" class="production-checkbox">
              Mark as Production Ready
            </mat-checkbox>
            <small class="production-help">Only available for completed requests</small>
          </div>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" type="button" class="cancel-btn">Cancel</button>
        <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid" class="submit-btn">
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
    
    .production-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      margin-top: 16px;
    }
    
    .production-checkbox {
      margin-bottom: 4px;
    }
    
    .production-help {
      color: #666;
      font-size: 0.85em;
      margin-left: 24px;
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
  `],
  imports: [ // Import necessary modules for dialog and form functionality
    CommonModule, // Basic Angular directives
    FormsModule, // Template-driven forms
    ReactiveFormsModule, // Reactive forms
    MatButtonModule, // Material Design buttons
    MatInputModule, // Material Design input fields
    MatSelectModule, // Material Design select dropdowns
    MatFormFieldModule, // Material Design form field wrapper
    MatCheckboxModule, // Material Design checkboxes
    MatAutocompleteModule, // Material Design autocomplete
    MatDialogModule, // Material Design dialog base
    MatDialogActions, // Material Design dialog action buttons
    MatDialogContent, // Material Design dialog content area
    MatDialogTitle // Material Design dialog title
  ]
})
export class NewRequestDialogComponent implements OnInit {
  // Reactive form group containing all form controls with validation
  form: FormGroup;
  
  // Static list of available CSI (Customer Service Identifier) IDs
  // These are predefined identifiers for different customer services
  csiIds = ['172033', '172223', '169608'];
  
  // Static list of available deployment environments
  // Represents different stages where applications can be deployed
  environments = ['UAT1', 'UAT2', 'UAT3', 'PERF', 'PROD'];
  
  // Static list of available teams that can make deployment requests
  // Each team represents a different development group or project
  teams = ['Phoenix', 'Avengers', 'Transformers', 'Hyper Care', 'CRUD', 'Crusaders'];
  
  // Flag indicating whether the dialog is in edit mode (true) or create mode (false)
  isEditMode: boolean = false;
  
  // Service management properties for autocomplete functionality
  services: Service[] = []; // Complete list of all available services
  filteredServices: Service[] = []; // Filtered list based on user search input

  /**
   * Component constructor - sets up dependencies and initializes the reactive form
   * @param fb - FormBuilder service for creating reactive forms
   * @param deploymentService - Service for making API calls to manage deployments and services
   * @param dialogRef - Reference to the Material Dialog for closing and returning results
   * @param data - Injected data containing releases, user info, and optional deployment for editing
   */
  constructor(
    private fb: FormBuilder,
    private deploymentService: DeploymentService,
    public dialogRef: MatDialogRef<NewRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { releases: string[]; user: any; deployment?: any }
  ) {
    // Initialize reactive form with all required fields and validation rules
    this.form = this.fb.group({
      // Form control definitions with initial values and validation rules
      csiId: ['', Validators.required], // Customer Service Identifier - required field
      service: ['', Validators.required], // Service name with autocomplete - required field
      requestId: ['', Validators.required], // Unique request identifier - required field
      environments: [[], Validators.required], // Array of target environments - required field
      team: ['', Validators.required], // Requesting team name - required field
      release: ['', Validators.required], // Release version - required field
      isConfig: [false], // Boolean flag for configuration requests - optional
      configRequestId: [''], // Config-specific request ID - conditional validation
      productionReady: [false] // Production readiness flag - optional
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
        environments: d.environments || [],
        team: d.team || '',
        release: d.release || '',
        isConfig: d.isConfig || false,
        configRequestId: d.configRequestId || '',
        productionReady: d.productionReady || false
      });
      
      // Set up conditional validation for config request ID if already a config request
      if (d.isConfig) {
        this.form.get('configRequestId')?.setValidators([Validators.required]);
        this.form.get('configRequestId')?.updateValueAndValidity();
      }
    }
  }

  /**
   * Angular lifecycle hook that runs after component initialization
   * Sets up service data loading and search functionality
   */
  ngOnInit() {
    this.loadServices(); // Load initial list of services
    this.setupServiceSearch(); // Set up reactive search for service autocomplete
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
   * Sets up conditional validation for the config request ID field
   * @param event - Material checkbox change event
   */
  onConfigChange(event: any) {
    const isConfig = event.checked;
    if (isConfig) {
      // If config request is checked, make config request ID required
      this.form.get('configRequestId')?.setValidators([Validators.required]);
    } else {
      // If config request is unchecked, remove validation and clear the field
      this.form.get('configRequestId')?.clearValidators();
      this.form.get('configRequestId')?.setValue('');
    }
    // Update validation status after changing validators
    this.form.get('configRequestId')?.updateValueAndValidity();
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
    }
  }
}
