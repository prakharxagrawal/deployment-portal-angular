import { Component, Input, OnChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeploymentService } from '../deployment.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-deployment',
  standalone: true,
  templateUrl: './deployment.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule
  ]
})
export class DeploymentComponent implements OnChanges {
  @Input() deployment: any;
  @Input() releases: string[] = [];
  @Input() user: any;
  deploymentForm: FormGroup;
  editMode = false;
  csiIds = ['172033', '172223', '169608'];
  environments = ['UAT1', 'UAT2', 'UAT3', 'DEV1', 'DEV2', 'DEV3', 'PERF', 'PROD'];
  teams = ['Phoenix', 'Avengers', 'Transformers', 'Hyper Care', 'CRUD', 'Crusaders'];

  get canEdit(): boolean {
    if (!this.user || !this.deployment) return false;
    if (this.user.role === 'admin') return true;
    const status = (this.deployment.status || '').toLowerCase();
    return this.user.role === 'developer' && (status === 'open' || status === 'pending');
  }

  constructor(
    private fb: FormBuilder,
    private deploymentService: DeploymentService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.deploymentForm = this.fb.group({
      csiId: ['', Validators.required],
      service: ['', Validators.required],
      requestId: ['', Validators.required],
      environments: ['', Validators.required],
      team: ['', Validators.required],
      release: ['', Validators.required]
    });
  }

  ngOnChanges() {
    if (this.deployment) {
      this.deploymentForm.patchValue({
        csiId: this.deployment.csiId,
        service: this.deployment.service,
        requestId: this.deployment.requestId,
        environments: this.deployment.environments,
        team: this.deployment.team,
        release: this.deployment.release
      });
      this.editMode = false;
      this.deploymentForm.disable();
    }
  }

  enableEdit() {
    if (this.canEdit) {
      this.editMode = true;
      this.deploymentForm.enable();
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.deploymentForm.patchValue({
      csiId: this.deployment.csiId,
      service: this.deployment.service,
      requestId: this.deployment.requestId,
      environments: this.deployment.environments,
      team: this.deployment.team,
      release: this.deployment.release
    });
    this.deploymentForm.disable();
  }

  onSubmit() {
    if (isPlatformBrowser(this.platformId)) {
      const deployment = {
        ...this.deploymentForm.value,
        createdBy: this.user.username,
        service: this.deploymentForm.value.service.trim(),
        requestId: this.deploymentForm.value.requestId.trim(),
        environments: this.deploymentForm.value.environments
      };
      this.deploymentService.createDeployment(deployment).subscribe({
        next: () => alert('Deployment created'),
        error: () => alert('Error creating deployment')
      });
    }
  }

  updateDeployment() {
    if (isPlatformBrowser(this.platformId)) {
      const deployment = {
        ...this.deploymentForm.value,
        service: this.deploymentForm.value.service.trim(),
        requestId: this.deploymentForm.value.requestId.trim(),
        environments: this.deploymentForm.value.environments
      };
      this.deploymentService.updateDeployment(this.deployment.id, deployment).subscribe({
        next: () => alert('Deployment updated'),
        error: () => alert('Error updating deployment')
      });
    }
  }

  deleteDeployment() {
    if (isPlatformBrowser(this.platformId)) {
      this.deploymentService.deleteDeployment(this.deployment.id).subscribe({
        next: () => alert('Deployment deleted'),
        error: () => alert('Error deleting deployment')
      });
    }
  }

  getStatusColor(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'open': return '#1976d2'; // blue
      case 'in progress': return '#ffb300'; // yellow
      case 'completed': return '#43a047'; // green
      case 'pending': return '#e53935'; // red
      default: return '#bdbdbd';
    }
  }
}