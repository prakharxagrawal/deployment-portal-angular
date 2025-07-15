import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

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
              <mat-select formControlName="csiId">
                <mat-option *ngFor="let id of csiIds" [value]="id">{{ id }}</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Service</mat-label>
              <input matInput formControlName="service">
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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle
  ]
})
export class NewRequestDialogComponent {
  form: FormGroup;
  csiIds = ['172033', '172223', '169608'];
  environments = ['UAT1', 'UAT2', 'UAT3', 'DEV1', 'DEV2', 'DEV3', 'PERF', 'PROD'];
  teams = ['Phoenix', 'Avengers', 'Transformers', 'Hyper Care', 'CRUD', 'Crusaders'];
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { releases: string[]; user: any; deployment?: any }
  ) {
    this.form = this.fb.group({
      csiId: ['', Validators.required],
      service: ['', Validators.required],
      requestId: ['', Validators.required],
      environments: [[], Validators.required],
      team: ['', Validators.required],
      release: ['', Validators.required],
      isConfig: [false],
      configRequestId: ['']
    });

    // If editing, patch form values
    if (data && data.deployment) {
      this.isEditMode = true;
      const d = data.deployment;
      this.form.patchValue({
        csiId: d.csiId || '',
        service: d.service || '',
        requestId: d.requestId || '',
        environments: d.environments || [],
        team: d.team || '',
        release: d.release || '',
        isConfig: d.isConfig || false,
        configRequestId: d.configRequestId || ''
      });
      
      // Set up config validation if already a config request
      if (d.isConfig) {
        this.form.get('configRequestId')?.setValidators([Validators.required]);
        this.form.get('configRequestId')?.updateValueAndValidity();
      }
    }
  }

  onConfigChange(event: any) {
    const isConfig = event.checked;
    if (isConfig) {
      this.form.get('configRequestId')?.setValidators([Validators.required]);
    } else {
      this.form.get('configRequestId')?.clearValidators();
      this.form.get('configRequestId')?.setValue('');
    }
    this.form.get('configRequestId')?.updateValueAndValidity();
  }

  onCancel() {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const result = {
        ...formValue,
        // Include the original ID if editing
        ...(this.isEditMode && this.data.deployment ? { id: this.data.deployment.id } : {})
      };
      this.dialogRef.close(result);
    }
  }
}
