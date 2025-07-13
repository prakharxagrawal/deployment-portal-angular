import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeploymentService } from '../deployment.service';
import { Inject, PLATFORM_ID } from '@angular/core';
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
  csiIds = ['172033', '172223', '169608'];
  environments = ['UAT1', 'UAT2', 'UAT3', 'DEV1', 'DEV2', 'DEV3', 'PERF', 'PROD'];

  constructor(
    private fb: FormBuilder,
    private deploymentService: DeploymentService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.deploymentForm = this.fb.group({
      csiId: ['', Validators.required],
      services: ['', Validators.required],
      requestIds: ['', Validators.required],
      environments: ['', Validators.required],
      releaseBranch: ['', Validators.required],
      release: ['', Validators.required]
    });
  }

  ngOnChanges() {
    if (this.deployment) {
      this.deploymentForm.patchValue({
        csiId: this.deployment.csiId,
        services: this.deployment.services.join(','),
        requestIds: this.deployment.requestIds.join(','),
        environments: this.deployment.environments,
        releaseBranch: this.deployment.releaseBranch,
        release: this.deployment.release
      });
    }
  }

  onSubmit() {
    if (isPlatformBrowser(this.platformId)) {
      const deployment = {
        ...this.deploymentForm.value,
        createdBy: this.user.username,
        services: this.deploymentForm.value.services.split(',').map((s: string) => s.trim()),
        requestIds: this.deploymentForm.value.requestIds.split(',').map((r: string) => r.trim()),
        environments: this.deploymentForm.value.environments
      };
      this.deploymentService.createDeployment(deployment).subscribe(
        response => alert('Deployment created'),
        error => alert('Error creating deployment')
      );
    }
  }

  updateDeployment() {
    if (isPlatformBrowser(this.platformId)) {
      const deployment = {
        ...this.deploymentForm.value,
        services: this.deploymentForm.value.services.split(',').map((s: string) => s.trim()),
        requestIds: this.deploymentForm.value.requestIds.split(',').map((r: string) => r.trim()),
        environments: this.deploymentForm.value.environments
      };
      this.deploymentService.updateDeployment(this.deployment.id, deployment).subscribe(
        response => alert('Deployment updated'),
        error => alert('Error updating deployment')
      );
    }
  }

  deleteDeployment() {
    if (isPlatformBrowser(this.platformId)) {
      this.deploymentService.deleteDeployment(this.deployment.id).subscribe(
        () => alert('Deployment deleted'),
        error => alert('Error deleting deployment')
      );
    }
  }
}