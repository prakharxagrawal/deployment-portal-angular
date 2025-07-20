import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { DeploymentService } from './deployment.service';

@Component({
  selector: 'app-create-release-dialog',
  standalone: true,
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">Create New Release</h2>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="compact-form">
          <div class="form-grid">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Release Name (YYYY-MM)</mat-label>
              <input matInput 
                     formControlName="name" 
                     placeholder="2025-01"
                     maxlength="7">
              <mat-hint>Format: YYYY-MM (e.g., 2025-01, 2025-12)</mat-hint>
              <mat-error *ngIf="form.get('name')?.hasError('required')">
                Release name is required
              </mat-error>
              <mat-error *ngIf="form.get('name')?.hasError('pattern')">
                Release name must be in YYYY-MM format
              </mat-error>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="onCreate()" 
                [disabled]="!form.valid" 
                class="create-btn">
          Create Release
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      width: 400px;
      max-width: 90vw;
    }

    .dialog-title {
      margin: 0 0 16px 0;
      color: #1976d2;
      font-weight: 600;
    }

    .dialog-content {
      padding: 16px 0;
    }

    .compact-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
      justify-content: flex-end;
      gap: 8px;
    }

    .cancel-btn {
      color: #666;
    }

    .create-btn {
      background: #2e7d32 !important;
      color: white !important;
    }

    .create-btn:disabled {
      background: #ccc !important;
      color: #999 !important;
    }

    mat-hint {
      font-size: 12px;
      color: #666;
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ]
})
export class CreateReleaseDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateReleaseDialogComponent>,
    private deploymentService: DeploymentService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern(/^\d{4}-\d{2}$/)
      ]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.form.valid) {
      const releaseName = this.form.get('name')?.value;
      this.deploymentService.createRelease(releaseName).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (error) => {
          // Handle error (could show a snackbar or error message)
          console.error('Error creating release:', error);
          alert(error.error?.error || 'Failed to create release');
        }
      });
    }
  }
}
