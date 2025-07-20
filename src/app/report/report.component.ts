
// Import Angular core decorators and platform detection utilities
import { Component, Input } from '@angular/core';
// Import CommonModule for basic directives and isPlatformBrowser for SSR compatibility
import { CommonModule, isPlatformBrowser } from '@angular/common';
// Import form-related modules for reactive form handling
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Import deployment service for API calls to generate reports
import { DeploymentService } from '../deployment.service';
// Import file-saver library for downloading generated CSV files
import { saveAs } from 'file-saver';
// Import platform injection tokens for server-side rendering compatibility
import { Inject, PLATFORM_ID } from '@angular/core';
// Import Angular Material components for modern UI elements
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

/**
 * ReportComponent provides functionality to generate and download deployment reports.
 * Users can filter reports by release version and environment, then download the results
 * as a CSV file. The component uses reactive forms for user input and handles file downloads
 * with proper browser compatibility checks for server-side rendering.
 */
@Component({
  selector: 'app-report', // HTML tag to use this component: <app-report>
  standalone: true, // This component doesn't depend on NgModule
  templateUrl: './report.component.html', // External HTML template file
  imports: [ // Import necessary modules for component functionality
    CommonModule, // Basic Angular directives
    FormsModule, // Template-driven forms
    ReactiveFormsModule, // Reactive forms
    MatButtonModule, // Material Design buttons
    MatInputModule, // Material Design input fields
    MatSelectModule, // Material Design select dropdowns
    MatFormFieldModule, // Material Design form field wrapper
    MatCardModule // Material Design card container
  ]
})
export class ReportComponent {
  // Input property: array of available release versions passed from parent component
  @Input() releases: string[] = [];
  
  // Reactive form group for report generation filters (release and environment)
  reportForm: FormGroup;
  
  // Static list of available environments for deployment filtering
  // These represent the different stages where applications can be deployed
  environments = ['UAT1', 'UAT2', 'UAT3', 'DEV1', 'DEV2', 'DEV3', 'PERF', 'PROD'];

  /**
   * Component constructor - sets up dependencies and initializes the reactive form
   * @param fb - FormBuilder service for creating reactive forms
   * @param deploymentService - Service for making API calls to generate reports
   * @param platformId - Platform identifier for SSR compatibility checks
   */
  constructor(
    private fb: FormBuilder,
    private deploymentService: DeploymentService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize reactive form with release and environment filter controls
    // Both fields start empty, meaning "all" releases/environments will be included
    this.reportForm = this.fb.group({
      release: [''], // Selected release version filter (empty = all releases)
      environment: [''] // Selected environment filter (empty = all environments)
    });
  }

  /**
   * Method that generates and downloads a deployment report based on form selections.
   * The report is generated server-side and downloaded as a CSV file.
   * Uses platform detection to ensure file downloads only work in browser environment.
   */
  generateReport() {
    // Check if running in browser (not server-side rendering) before attempting file download
    if (isPlatformBrowser(this.platformId)) {
      // Extract selected release and environment values from the reactive form
      const { release, environment } = this.reportForm.value;
      
      // Call deployment service to generate report with selected filters
      this.deploymentService.generateReport(release, environment).subscribe({
        // Success handler: process the CSV response and trigger file download
        next: response => {
          // Create a Blob object from the CSV response data
          const blob = new Blob([response], { type: 'text/csv' });
          // Generate filename with selected filters, using "all" as default for empty values
          // Example: "deployment_report_v1.2.3_PROD.csv" or "deployment_report_all_all.csv"
          saveAs(blob, `deployment_report_${release || 'all'}_${environment || 'all'}.csv`);
        },
        // Error handler: show user-friendly error message if report generation fails
        error: () => alert('Error generating report')
      });
    }
  }
}