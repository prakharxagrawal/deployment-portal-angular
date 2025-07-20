// Import required Angular core decorators and interfaces for component functionality
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
// Import CommonModule for basic Angular directives like *ngIf, *ngFor
import { CommonModule } from '@angular/common';
// Import FormsModule for two-way data binding with ngModel
import { FormsModule } from '@angular/forms';

/**
 * RequestDetailsComponent displays detailed information about a selected deployment request.
 * This component shows all the fields of a deployment including status, RLM IDs, environments,
 * and production readiness. It provides different editing permissions based on user roles:
 * - Regular users: Read-only view
 * - Admins: Can edit status and RLM IDs
 * - SuperAdmins: Can edit all fields
 * - Original requesters: Can edit production readiness when status is Completed
 */
@Component({
  selector: 'app-request-details', // HTML tag to use this component: <app-request-details>
  standalone: true, // This component doesn't depend on NgModule
  imports: [CommonModule, FormsModule], // Import necessary modules for template functionality
  template: `
    <div class="main-detail-container">
      <div class="main-detail-card" *ngIf="!deployment">
        <div class="empty-detail">
          <p>Please select a request from the left panel to view details.</p>
        </div>
      </div>

      <div class="main-detail-card" *ngIf="deployment">
        <!-- Header Section -->
        <div class="main-detail-header">
          <div class="main-detail-title">
            <h2 class="main-detail-heading">Request Details</h2>
            <p class="main-detail-number">#{{ deployment.serialNumber }}</p>
          </div>
          <div class="main-detail-status-section">
            <div class="status-container">
              <span class="status-badge" 
                    [ngClass]="getStatusClass(deployment.status)"
                    *ngIf="!isAdmin">
                {{ deployment.status }}
              </span>
              <select *ngIf="isAdmin" 
                      [(ngModel)]="editableDeployment.status" 
                      class="status-select"
                      [ngClass]="getStatusClass(editableDeployment.status)">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <!-- Update Button for Admins (moved here below status) -->
            <div *ngIf="isAdmin && hasChanges()" class="status-update-section">
              <button (click)="updateDeployment()" 
                      class="update-button status-update-btn">
                Update Request
              </button>
              <span class="unsaved-indicator">
                ● Unsaved changes
              </span>
            </div>
          </div>
        </div>

        <div class="main-detail-content">
          <!-- Basic Information Section -->
          <div class="main-detail-section">            
            <div class="main-detail-row">
              <span class="main-detail-label">CSI ID:</span>
              <span class="main-detail-value">{{ deployment.csiId }}</span>
            </div>
            
            <div class="main-detail-row">
              <span class="main-detail-label">Service:</span>
              <span class="main-detail-value">{{ deployment.service }}</span>
            </div>
            
            <div class="main-detail-row">
              <span class="main-detail-label">Request ID:</span>
              <span class="main-detail-value">{{ deployment.requestId }}</span>
            </div>
            
            <div class="main-detail-row" *ngIf="deployment.isConfig">
              <span class="main-detail-label">Config Request ID:</span>
              <span class="main-detail-value">{{ deployment.configRequestId }}</span>
            </div>
            
            <div class="main-detail-row">
              <span class="main-detail-label">Team:</span>
              <span class="main-detail-value">{{ deployment.team }}</span>
            </div>
            
            <div class="main-detail-row">
              <span class="main-detail-label">Release:</span>
              <span class="main-detail-value">{{ deployment.release }}</span>
            </div>
            
            <div class="main-detail-row">
              <span class="main-detail-label">Requested By:</span>
              <span class="main-detail-value">{{ deployment.createdBy }}</span>
            </div>
            
            <div class="main-detail-row" *ngIf="deployment.dateRequested">
              <span class="main-detail-label">Date Requested:</span>
              <span class="main-detail-value">{{ deployment.dateRequested | date:'medium' }}</span>
            </div>
            
            <div class="main-detail-row" *ngIf="deployment.dateModified">
              <span class="main-detail-label">Date Modified:</span>
              <span class="main-detail-value">{{ deployment.dateModified | date:'medium' }}</span>
            </div>

            <!-- Environments Section (inline) -->
            <div class="main-detail-row" *ngIf="deployment.environments && deployment.environments.length > 0">
              <span class="main-detail-label">Environments:</span>
              <span class="main-detail-value">{{ deployment.environments.join(', ') }}</span>
            </div>

            <!-- Production Ready Section (visible when status is Completed) -->
            <div class="main-detail-row" *ngIf="deployment.status === 'Completed'">
              <span class="main-detail-label">Production Ready:</span>
              <div class="production-ready-container">
                <label class="production-ready-checkbox">
                  <input type="checkbox" 
                         [(ngModel)]="editableDeployment.productionReady"
                         [disabled]="!canEditProductionReady()">
                  Ready for Production
                </label>
                <!-- Update Button for Production Ready Changes -->
                <div *ngIf="canEditProductionReady() && hasProductionReadyChanges()" class="production-ready-update-section">
                  <button (click)="updateProductionReady()" 
                          class="update-button production-ready-btn">
                    Update
                  </button>
                  <span class="unsaved-indicator">
                    ● Unsaved changes
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- RLM IDs Section (Always visible, compact layout) -->
          <div class="main-detail-section">
            <div class="rlm-grid-compact">
              <!-- UAT Environment -->
              <div class="rlm-env-group-compact" *ngIf="hasRequestedEnvironment('UAT1') || hasRequestedEnvironment('UAT2') || hasRequestedEnvironment('UAT3')">
                <div class="rlm-env-title">UAT</div>
                <div class="rlm-fields-row">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdUat1" 
                         placeholder="UAT1 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm"
                         *ngIf="hasRequestedEnvironment('UAT1')">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdUat2" 
                         placeholder="UAT2 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm"
                         *ngIf="hasRequestedEnvironment('UAT2')">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdUat3" 
                         placeholder="UAT3 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm"
                         *ngIf="hasRequestedEnvironment('UAT3')">
                </div>
              </div>

              <!-- Performance Environment (Always visible) -->
              <div class="rlm-env-group-compact">
                <div class="rlm-env-title">Performance</div>
                <div class="rlm-fields-row">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdPerf1" 
                         placeholder="PERF1 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdPerf2" 
                         placeholder="PERF2 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm">
                </div>
              </div>

              <!-- Production Environment (Always visible) -->
              <div class="rlm-env-group-compact">
                <div class="rlm-env-title">Production</div>
                <div class="rlm-fields-row">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdProd1" 
                         placeholder="PROD1 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdProd2" 
                         placeholder="PROD2 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./request-details.component.css'] // Link to component-specific CSS styles
})
export class RequestDetailsComponent implements OnChanges {
  // Input property: deployment object passed from parent component (app.component)
  @Input() deployment: any;
  // Input property: current user object with role and permissions information
  @Input() user: any;
  // Output event: emitted when deployment data is updated, parent component listens for this
  @Output() deploymentUpdate = new EventEmitter<any>();

  // Local copy of deployment data that can be edited without affecting the original
  editableDeployment: any = {};
  // Original deployment data to track changes and determine if update is needed
  originalDeployment: any = {};
  
  /**
   * Computed property that checks if current user has admin privileges
   * Returns true if user role is 'admin' or 'superadmin'
   */
  get isAdmin(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'superadmin';
  }

  /**
   * Computed property that checks if current user has superadmin privileges
   * SuperAdmins have the highest level of permissions in the system
   */
  get isSuperAdmin(): boolean {
    return this.user?.role === 'superadmin';
  }

  /**
   * Computed property that determines if user can edit RLM (Release Management) IDs
   * Both admin and superadmin roles have permission to edit RLM IDs
   */
  get canEditRlm(): boolean {
    // Both admin and superadmin can edit RLM IDs
    return this.user?.role === 'admin' || this.user?.role === 'superadmin';
  }

  /**
   * Computed property that determines if user can edit the entire request
   * Only superadmins have full editing privileges for all request fields
   */
  get canEditFullRequest(): boolean {
    // Only superadmin can edit full request, admins can only edit status and RLM IDs
    return this.user?.role === 'superadmin';
  }

  /**
   * Method that checks if current user can edit the production ready checkbox
   * Production readiness can only be edited by:
   * 1. The original requester (person who created the deployment request)
   * 2. SuperAdmins
   * 3. Only when the deployment status is 'Completed'
   */
  canEditProductionReady(): boolean {
    // Only original requester (createdBy) or superadmin can edit production ready, only when status is Completed
    return this.deployment?.status === 'Completed' && 
           (this.user?.role === 'superadmin' || 
            this.user?.username === this.deployment?.createdBy);
  }

  /**
   * Method that checks if a specific environment was requested for this deployment
   * @param env - Environment name to check (e.g., 'UAT1', 'UAT2', 'PERF1', 'PROD1')
   * @returns boolean indicating if the environment is included in the deployment's environment list
   */
  hasRequestedEnvironment(env: string): boolean {
    return this.deployment?.environments?.includes(env) || false;
  }

  /**
   * Angular lifecycle hook that runs when input properties change
   * This ensures the component updates when a new deployment is selected
   */
  ngOnChanges() {
    if (this.deployment) {
      // Create editable copy of deployment data for form binding
      this.editableDeployment = { ...this.deployment };
      // Store original deployment data to track changes
      this.originalDeployment = { ...this.deployment };
    }
  }

  /**
   * Method that determines if any changes have been made to the deployment data
   * Compares current editable data with original data for admin-editable fields
   * @returns boolean indicating if there are unsaved changes
   */
  hasChanges(): boolean {
    if (!this.deployment || !this.editableDeployment) return false;
    
    // For admin changes (status and RLM IDs) - exclude production ready
    return this.editableDeployment.status !== this.originalDeployment.status ||
           // Check all RLM ID fields for changes across different environments
           this.editableDeployment.rlmIdUat1 !== this.originalDeployment.rlmIdUat1 ||
           this.editableDeployment.rlmIdUat2 !== this.originalDeployment.rlmIdUat2 ||
           this.editableDeployment.rlmIdUat3 !== this.originalDeployment.rlmIdUat3 ||
           this.editableDeployment.rlmIdPerf1 !== this.originalDeployment.rlmIdPerf1 ||
           this.editableDeployment.rlmIdPerf2 !== this.originalDeployment.rlmIdPerf2 ||
           this.editableDeployment.rlmIdProd1 !== this.originalDeployment.rlmIdProd1 ||
           this.editableDeployment.rlmIdProd2 !== this.originalDeployment.rlmIdProd2;
  }

  /**
   * Method that checks specifically if the production ready flag has been changed
   * This is tracked separately because it has different permission requirements
   * @returns boolean indicating if production ready status has been modified
   */
  hasProductionReadyChanges(): boolean {
    if (!this.deployment || !this.editableDeployment) return false;
    return this.editableDeployment.productionReady !== this.originalDeployment.productionReady;
  }

  /**
   * Method that returns the appropriate CSS class for deployment status styling
   * Each status has a different color scheme to provide visual feedback
   * @param status - The deployment status string
   * @returns CSS class name for status styling
   */
  getStatusClass(status: string): string {
    if (!status) return 'status-open';
    switch (status.toLowerCase()) {
      case 'open': return 'status-open'; // Typically blue/gray for new requests
      case 'in progress': return 'status-progress'; // Typically yellow/orange for active work
      case 'pending': return 'status-pending'; // Typically orange for waiting states
      case 'completed': return 'status-completed'; // Typically green for finished work
      default: return 'status-open'; // Default to open status styling
    }
  }

  /**
   * Method that handles updating deployment data (status and RLM IDs)
   * This method is called when admin users save their changes
   * Emits the updated deployment to the parent component for API calls
   */
  updateDeployment() {
    if (this.editableDeployment && this.isAdmin) {
      // Update the date modified to current timestamp for audit trail
      this.editableDeployment.dateModified = new Date().toISOString();
      // Emit the updated deployment data to parent component
      this.deploymentUpdate.emit(this.editableDeployment);
      // Update original to reflect the saved state and reset change tracking
      this.originalDeployment = { ...this.editableDeployment };
    }
  }

  /**
   * Method that handles updating only the production ready status
   * This is a separate update method because production ready has different permissions
   * Only original requesters and superadmins can modify this when status is Completed
   */
  updateProductionReady() {
    if (this.editableDeployment && this.canEditProductionReady()) {
      // Update the date modified to current timestamp for audit trail
      this.editableDeployment.dateModified = new Date().toISOString();
      // Emit the updated deployment data to parent component
      this.deploymentUpdate.emit(this.editableDeployment);
      // Update original to reflect the saved state and reset change tracking
      this.originalDeployment = { ...this.editableDeployment };
    }
  }
}

