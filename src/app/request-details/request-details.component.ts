import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
                    *ngIf="!canEditStatus">
                {{ deployment.status }}
              </span>
              <select *ngIf="canEditStatus" 
                      [(ngModel)]="editableDeployment.status" 
                      class="status-select"
                      [ngClass]="getStatusClass(editableDeployment.status)">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div *ngIf="canEditStatus && hasChanges()" class="update-section">
              <button (click)="updateDeployment()" class="update-button">
                Update Status
              </button>
              <span class="unsaved-indicator">● Unsaved changes</span>
            </div>
          </div>
        </div>

        <div class="main-detail-content">
          <!-- Basic Information -->
          <div class="main-detail-grid">
            <div class="detail-row">
              <label class="detail-label">Application Name:</label>
              <span class="detail-value">{{ deployment.applicationName }}</span>
            </div>
            <div class="detail-row">
              <label class="detail-label">Version:</label>
              <span class="detail-value">{{ deployment.version }}</span>
            </div>
            <div class="detail-row">
              <label class="detail-label">Branch:</label>
              <span class="detail-value">{{ deployment.branch }}</span>
            </div>
            <div class="detail-row">
              <label class="detail-label">Feature Name:</label>
              <span class="detail-value">{{ deployment.featureName || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <label class="detail-label">Created By:</label>
              <span class="detail-value">{{ deployment.createdBy }}</span>
            </div>
            <div class="detail-row">
              <label class="detail-label">Date Created:</label>
              <span class="detail-value">{{ deployment.dateCreated | date:'medium' }}</span>
            </div>
            <div class="detail-row">
              <label class="detail-label">Date Modified:</label>
              <span class="detail-value">{{ deployment.dateModified | date:'medium' }}</span>
            </div>
            <div class="detail-row">
              <label class="detail-label">Description:</label>
              <span class="detail-value">{{ deployment.description || 'No description provided' }}</span>
            </div>
          </div>

          <!-- Environment Section -->
          <div class="environment-section">
            <h3 class="section-heading">Environments</h3>
            <div class="environment-tags">
              <span *ngFor="let env of deployment.environments" 
                    class="environment-tag"
                    [ngClass]="'env-' + env.toLowerCase()">
                {{ env }}
              </span>
            </div>
          </div>

          <!-- Production and Performance Ready Section -->
          <div class="readiness-section">
            <h3 class="section-heading">Deployment Readiness</h3>
            <div class="readiness-controls">
              <!-- Performance Ready -->
              <div class="readiness-item">
                <div class="checkbox-wrapper">
                  <input type="checkbox" 
                         id="performanceReady"
                         [(ngModel)]="editableDeployment.performanceReady"
                         [disabled]="isPerfEnvironmentSelected() || !canEditPerformanceReady()"
                         class="readiness-checkbox">
                  <label for="performanceReady" class="readiness-label">
                    Ready for Performance
                    <span *ngIf="isPerfEnvironmentSelected()" class="auto-checked">(Auto-checked: PERF environment selected)</span>
                  </label>
                </div>
                <div *ngIf="hasPerformanceReadyChanges() && canEditPerformanceReady()" class="readiness-update">
                  <button (click)="updatePerformanceReady()" class="update-button readiness-update-btn">
                    Update Performance Ready
                  </button>
                </div>
              </div>

              <!-- Production Ready -->
              <div class="readiness-item">
                <div class="checkbox-wrapper">
                  <input type="checkbox" 
                         id="productionReady"
                         [(ngModel)]="editableDeployment.productionReady"
                         [disabled]="!canEditProductionReady()"
                         class="readiness-checkbox">
                  <label for="productionReady" class="readiness-label">Ready for Production</label>
                </div>
                <div *ngIf="hasProductionReadyChanges() && canEditProductionReady()" class="readiness-update">
                  <button (click)="updateProductionReady()" class="update-button readiness-update-btn">
                    Update Production Ready
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- RLM IDs Section -->
          <div class="rlm-section">
            <h3 class="section-heading">RLM IDs</h3>
            
            <!-- UAT Environment RLM IDs -->
            <div class="rlm-environment-group">
              <h4 class="rlm-env-title">UAT Environments</h4>
              <div class="rlm-grid">
                <div class="rlm-field" *ngIf="hasRequestedEnvironment('UAT1')">
                  <label class="rlm-label">UAT1 RLM ID:</label>
                  <input *ngIf="canEditRlm" 
                         type="text" 
                         [(ngModel)]="editableDeployment.rlmIdUat1"
                         class="rlm-input"
                         placeholder="Enter UAT1 RLM ID">
                  <span *ngIf="!canEditRlm && canViewRlm" class="rlm-readonly">
                    {{ editableDeployment.rlmIdUat1 || 'Not set' }}
                  </span>
                </div>
                
                <div class="rlm-field" *ngIf="hasRequestedEnvironment('UAT2')">
                  <label class="rlm-label">UAT2 RLM ID:</label>
                  <input *ngIf="canEditRlm" 
                         type="text" 
                         [(ngModel)]="editableDeployment.rlmIdUat2"
                         class="rlm-input"
                         placeholder="Enter UAT2 RLM ID">
                  <span *ngIf="!canEditRlm && canViewRlm" class="rlm-readonly">
                    {{ editableDeployment.rlmIdUat2 || 'Not set' }}
                  </span>
                </div>
                
                <div class="rlm-field" *ngIf="hasRequestedEnvironment('UAT3')">
                  <label class="rlm-label">UAT3 RLM ID:</label>
                  <input *ngIf="canEditRlm" 
                         type="text" 
                         [(ngModel)]="editableDeployment.rlmIdUat3"
                         class="rlm-input"
                         placeholder="Enter UAT3 RLM ID">
                  <span *ngIf="!canEditRlm && canViewRlm" class="rlm-readonly">
                    {{ editableDeployment.rlmIdUat3 || 'Not set' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Performance Environment RLM IDs - Show when PERF selected OR performance ready checked -->
            <div class="rlm-environment-group" *ngIf="shouldShowPerfRlmFields()">
              <h4 class="rlm-env-title">Performance Environment</h4>
              <div class="rlm-grid">
                <div class="rlm-field">
                  <label class="rlm-label">PERF1 RLM ID:</label>
                  <input *ngIf="canEditRlm" 
                         type="text" 
                         [(ngModel)]="editableDeployment.rlmIdPerf1"
                         class="rlm-input"
                         placeholder="Enter PERF1 RLM ID">
                  <span *ngIf="!canEditRlm && canViewRlm" class="rlm-readonly">
                    {{ editableDeployment.rlmIdPerf1 || 'Not set' }}
                  </span>
                </div>
                
                <div class="rlm-field">
                  <label class="rlm-label">PERF2 RLM ID:</label>
                  <input *ngIf="canEditRlm" 
                         type="text" 
                         [(ngModel)]="editableDeployment.rlmIdPerf2"
                         class="rlm-input"
                         placeholder="Enter PERF2 RLM ID">
                  <span *ngIf="!canEditRlm && canViewRlm" class="rlm-readonly">
                    {{ editableDeployment.rlmIdPerf2 || 'Not set' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Production Environment RLM IDs - Show only when production ready checked -->
            <div class="rlm-environment-group" *ngIf="shouldShowProdRlmFields()">
              <h4 class="rlm-env-title">Production Environment</h4>
              <div class="rlm-grid">
                <div class="rlm-field">
                  <label class="rlm-label">PROD1 RLM ID:</label>
                  <input *ngIf="canEditRlm" 
                         type="text" 
                         [(ngModel)]="editableDeployment.rlmIdProd1"
                         class="rlm-input"
                         placeholder="Enter PROD1 RLM ID">
                  <span *ngIf="!canEditRlm && canViewRlm" class="rlm-readonly">
                    {{ editableDeployment.rlmIdProd1 || 'Not set' }}
                  </span>
                </div>
                
                <div class="rlm-field">
                  <label class="rlm-label">PROD2 RLM ID:</label>
                  <input *ngIf="canEditRlm" 
                         type="text" 
                         [(ngModel)]="editableDeployment.rlmIdProd2"
                         class="rlm-input"
                         placeholder="Enter PROD2 RLM ID">
                  <span *ngIf="!canEditRlm && canViewRlm" class="rlm-readonly">
                    {{ editableDeployment.rlmIdProd2 || 'Not set' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- RLM Update Button and Status (only for users who can edit) -->
            <div *ngIf="canEditRlm && hasRlmChanges()" class="rlm-update-section">
              <button (click)="updateDeployment()" 
                      class="update-button rlm-update-btn">
                Update RLM IDs
              </button>
              <span class="unsaved-indicator">
                ● Unsaved RLM changes
              </span>
            </div>
            
            <!-- Show read-only message for non-editing users -->
            <div *ngIf="!canEditRlm && canViewRlm" class="readonly-notice">
              <span class="readonly-status">RLM IDs are view-only for your role</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./request-details.component.css']
})
export class RequestDetailsComponent implements OnChanges {
  @Input() deployment: any;
  @Input() user: any;
  @Output() deploymentUpdate = new EventEmitter<any>();

  editableDeployment: any = {};
  originalDeployment: any = {};
  
  get isAdmin(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'superadmin';
  }

  get isSuperAdmin(): boolean {
    return this.user?.role === 'superadmin';
  }

  get isDeveloper(): boolean {
    return this.user?.role === 'developer';
  }

  // FIX #1: Separate view from edit permissions for RLM
  get canViewRlm(): boolean {
    return true; // All users can view RLM IDs
  }

  get canEditRlm(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'superadmin';
  }

  // FIX #3: Super admin complete access
  get canEditFullRequest(): boolean {
    return this.user?.role === 'superadmin';
  }

  get canEditStatus(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'superadmin';
  }

  // FIX #2: Bulletproof readiness flow with proper role and status validation
  canEditProductionReady(): boolean {
    if (!this.deployment || this.deployment.status !== 'Completed') {
      return false;
    }
    
    // Superadmin has complete access to any completed request
    if (this.user?.role === 'superadmin') {
      return true;
    }
    
    // Original request creator can mark their own completed requests ready
    if (this.user?.role === 'developer' && 
        this.user?.username === this.deployment?.createdBy) {
      return true;
    }
    
    // Admins cannot mark readiness (not request creators)
    return false;
  }

  canEditPerformanceReady(): boolean {
    if (!this.deployment || this.deployment.status !== 'Completed') {
      return false;
    }
    
    // Superadmin has complete access to any completed request
    if (this.user?.role === 'superadmin') {
      return true;
    }
    
    // Original request creator can mark their own completed requests ready
    if (this.user?.role === 'developer' && 
        this.user?.username === this.deployment?.createdBy) {
      return true;
    }
    
    // Admins cannot mark readiness (not request creators)
    return false;
  }

  hasRequestedEnvironment(env: string): boolean {
    return this.deployment?.environments?.includes(env) || false;
  }

  ngOnChanges() {
    if (this.deployment) {
      this.editableDeployment = { ...this.deployment };
      this.originalDeployment = { ...this.deployment };
      
      // Auto-check performance ready if PERF environment is selected (bulletproof logic)
      if (this.isPerfEnvironmentSelected()) {
        // Only auto-check if not already set and user has permission to modify
        if (!this.editableDeployment.performanceReady && this.canEditPerformanceReady()) {
          this.editableDeployment.performanceReady = true;
        }
        // For read-only users, just ensure the sync is visible in the UI
        else if (!this.editableDeployment.performanceReady) {
          // Force sync for display purposes (will be validated on backend)
          this.editableDeployment.performanceReady = true;
        }
      }
    }
  }

  hasChanges(): boolean {
    if (!this.deployment || !this.editableDeployment) return false;
    
    return this.editableDeployment.status !== this.originalDeployment.status ||
           this.editableDeployment.rlmIdUat1 !== this.originalDeployment.rlmIdUat1 ||
           this.editableDeployment.rlmIdUat2 !== this.originalDeployment.rlmIdUat2 ||
           this.editableDeployment.rlmIdUat3 !== this.originalDeployment.rlmIdUat3 ||
           this.editableDeployment.rlmIdPerf1 !== this.originalDeployment.rlmIdPerf1 ||
           this.editableDeployment.rlmIdPerf2 !== this.originalDeployment.rlmIdPerf2 ||
           this.editableDeployment.rlmIdProd1 !== this.originalDeployment.rlmIdProd1 ||
           this.editableDeployment.rlmIdProd2 !== this.originalDeployment.rlmIdProd2;
  }

  hasProductionReadyChanges(): boolean {
    if (!this.deployment || !this.editableDeployment) return false;
    return this.editableDeployment.productionReady !== this.originalDeployment.productionReady;
  }

  hasPerformanceReadyChanges(): boolean {
    if (!this.deployment || !this.editableDeployment) return false;
    return this.editableDeployment.performanceReady !== this.originalDeployment.performanceReady;
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-open';
    switch (status.toLowerCase()) {
      case 'open': return 'status-open';
      case 'in progress': return 'status-progress';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      default: return 'status-open';
    }
  }

  updateDeployment() {
    if (this.editableDeployment && this.canEditStatus) {
      this.editableDeployment.dateModified = new Date().toISOString();
      this.deploymentUpdate.emit(this.editableDeployment);
      this.originalDeployment = { ...this.editableDeployment };
    }
  }

  updateProductionReady() {
    if (this.editableDeployment && this.canEditProductionReady()) {
      this.editableDeployment.dateModified = new Date().toISOString();
      this.deploymentUpdate.emit(this.editableDeployment);
      this.originalDeployment = { ...this.editableDeployment };
    }
  }

  updatePerformanceReady() {
    if (this.editableDeployment && this.canEditPerformanceReady()) {
      this.editableDeployment.dateModified = new Date().toISOString();
      this.deploymentUpdate.emit(this.editableDeployment);
      this.originalDeployment = { ...this.editableDeployment };
    }
  }

  hasRlmChanges(): boolean {
    if (!this.deployment || !this.editableDeployment) return false;
    
    return this.editableDeployment.rlmIdUat1 !== this.originalDeployment.rlmIdUat1 ||
           this.editableDeployment.rlmIdUat2 !== this.originalDeployment.rlmIdUat2 ||
           this.editableDeployment.rlmIdUat3 !== this.originalDeployment.rlmIdUat3 ||
           this.editableDeployment.rlmIdPerf1 !== this.originalDeployment.rlmIdPerf1 ||
           this.editableDeployment.rlmIdPerf2 !== this.originalDeployment.rlmIdPerf2 ||
           this.editableDeployment.rlmIdProd1 !== this.originalDeployment.rlmIdProd1 ||
           this.editableDeployment.rlmIdProd2 !== this.originalDeployment.rlmIdProd2;
  }

  isPerfEnvironmentSelected(): boolean {
    return this.hasRequestedEnvironment('PERF');
  }

  shouldShowPerfRlmFields(): boolean {
    return this.hasRequestedEnvironment('PERF') || 
           this.hasRequestedEnvironment('PERF1') || 
           this.hasRequestedEnvironment('PERF2') || 
           this.editableDeployment?.performanceReady;
  }

  shouldShowProdRlmFields(): boolean {
    return this.editableDeployment?.productionReady;
  }
}
