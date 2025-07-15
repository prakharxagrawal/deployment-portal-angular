
import { Component, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeploymentService } from '../deployment.service';
import { saveAs } from 'file-saver';
import { Inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-report',
  standalone: true,
  templateUrl: './report.component.html',
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
export class ReportComponent {
  @Input() releases: string[] = [];
  reportForm: FormGroup;
  environments = ['UAT1', 'UAT2', 'UAT3', 'DEV1', 'DEV2', 'DEV3', 'PERF', 'PROD'];

  constructor(
    private fb: FormBuilder,
    private deploymentService: DeploymentService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.reportForm = this.fb.group({
      release: [''],
      environment: ['']
    });
  }

  generateReport() {
    if (isPlatformBrowser(this.platformId)) {
      const { release, environment } = this.reportForm.value;
      this.deploymentService.generateReport(release, environment).subscribe({
        next: response => {
          const blob = new Blob([response], { type: 'text/csv' });
          saveAs(blob, `deployment_report_${release || 'all'}_${environment || 'all'}.csv`);
        },
        error: () => alert('Error generating report')
      });
    }
  }
}