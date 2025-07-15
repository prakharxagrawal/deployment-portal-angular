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
          </div>

          <!-- RLM IDs Section (Always visible, compact layout) -->
          <div class="main-detail-section">
            <div class="rlm-grid-compact">
              <!-- Development Environment -->
              <div class="rlm-env-group-compact" *ngIf="hasRequestedEnvironment('DEV1') || hasRequestedEnvironment('DEV2') || hasRequestedEnvironment('DEV3')">
                <div class="rlm-env-title">Development</div>
                <div class="rlm-fields-row">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdDev1" 
                         placeholder="DEV1 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm"
                         *ngIf="hasRequestedEnvironment('DEV1')">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdDev2" 
                         placeholder="DEV2 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm"
                         *ngIf="hasRequestedEnvironment('DEV2')">
                  <input type="text" 
                         [(ngModel)]="editableDeployment.rlmIdDev3" 
                         placeholder="DEV3 RLM ID"
                         class="rlm-input-compact"
                         [readonly]="!canEditRlm"
                         *ngIf="hasRequestedEnvironment('DEV3')">
                </div>
              </div>

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

  get canEditRlm(): boolean {
    // Both admin and superadmin can edit RLM IDs
    return this.user?.role === 'admin' || this.user?.role === 'superadmin';
  }

  get canEditFullRequest(): boolean {
    // Only superadmin can edit full request, admins can only edit status and RLM IDs
    return this.user?.role === 'superadmin';
  }

  hasRequestedEnvironment(env: string): boolean {
    return this.deployment?.environments?.includes(env) || false;
  }

  ngOnChanges() {
    if (this.deployment) {
      this.editableDeployment = { ...this.deployment };
      this.originalDeployment = { ...this.deployment };
    }
  }

  hasChanges(): boolean {
    if (!this.deployment || !this.editableDeployment) return false;
    
    return this.editableDeployment.status !== this.originalDeployment.status ||
           this.editableDeployment.rlmIdDev1 !== this.originalDeployment.rlmIdDev1 ||
           this.editableDeployment.rlmIdDev2 !== this.originalDeployment.rlmIdDev2 ||
           this.editableDeployment.rlmIdDev3 !== this.originalDeployment.rlmIdDev3 ||
           this.editableDeployment.rlmIdUat1 !== this.originalDeployment.rlmIdUat1 ||
           this.editableDeployment.rlmIdUat2 !== this.originalDeployment.rlmIdUat2 ||
           this.editableDeployment.rlmIdUat3 !== this.originalDeployment.rlmIdUat3 ||
           this.editableDeployment.rlmIdPerf1 !== this.originalDeployment.rlmIdPerf1 ||
           this.editableDeployment.rlmIdPerf2 !== this.originalDeployment.rlmIdPerf2 ||
           this.editableDeployment.rlmIdProd1 !== this.originalDeployment.rlmIdProd1 ||
           this.editableDeployment.rlmIdProd2 !== this.originalDeployment.rlmIdProd2;
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
    if (this.editableDeployment && this.isAdmin) {
      // Update the date modified
      this.editableDeployment.dateModified = new Date().toISOString();
      this.deploymentUpdate.emit(this.editableDeployment);
      // Update original to reflect the saved state
      this.originalDeployment = { ...this.editableDeployment };
    }
  }
}

