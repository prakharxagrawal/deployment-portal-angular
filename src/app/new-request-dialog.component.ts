import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-request-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title>New Deployment Request</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" class="new-request-form">
      <mat-form-field appearance="fill">
        <mat-label>CSI ID</mat-label>
        <mat-select formControlName="csiId">
          <mat-option *ngFor="let id of csiIds" [value]="id">{{ id }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Services (comma-separated)</mat-label>
        <input matInput formControlName="services">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Request IDs (comma-separated)</mat-label>
        <input matInput formControlName="requestIds">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Environments</mat-label>
        <mat-select formControlName="environments" multiple>
          <mat-option *ngFor="let env of environments" [value]="env">{{ env }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Release Branch</mat-label>
        <input matInput formControlName="releaseBranch">
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Release</mat-label>
        <mat-select formControlName="release">
          <mat-option *ngFor="let release of data.releases" [value]="release">{{ release }}</mat-option>
        </mat-select>
      </mat-form-field>
      <div class="dialog-actions">
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Submit</button>
        <button mat-button mat-dialog-close type="button">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .new-request-form {
      display: flex;
      flex-wrap: wrap;
      gap: 18px 24px;
      padding: 12px 0 0 0;
      min-width: 400px;
      max-width: 600px;
    }
    mat-form-field {
      width: 260px;
      min-width: 180px;
      flex: 1 1 260px;
    }
    .dialog-actions {
      width: 100%;
      display: flex;
      gap: 18px;
      margin-top: 18px;
      justify-content: flex-end;
    }
  `],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class NewRequestDialogComponent {
  form: FormGroup;
  csiIds = ['172033', '172223', '169608'];
  environments = ['UAT1', 'UAT2', 'UAT3', 'DEV1', 'DEV2', 'DEV3', 'PERF', 'PROD'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { releases: string[]; user: any }
  ) {
    this.form = this.fb.group({
      csiId: ['', Validators.required],
      services: ['', Validators.required],
      requestIds: ['', Validators.required],
      environments: [[], Validators.required],
      releaseBranch: ['', Validators.required],
      release: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        services: this.form.value.services.split(',').map((s: string) => s.trim()),
        requestIds: this.form.value.requestIds.split(',').map((r: string) => r.trim()),
        environments: this.form.value.environments
      });
    }
  }
}
