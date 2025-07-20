// Import Angular core decorators for component functionality
import { Component, Inject } from '@angular/core';
// Import Angular Material dialog components and injection tokens
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
// Import reactive forms modules and validation
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// Import Angular Material UI components for the form
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
// Import CommonModule for basic Angular directives
import { CommonModule } from '@angular/common';

/**
 * CreateReleaseDialogComponent provides a modal dialog for creating new release versions.
 * This component allows administrators to create new releases with a name and description.
 * The release name follows a specific pattern (YYYY-MM format) to ensure consistency
 * across the deployment portal system.
 */
@Component({
  selector: 'app-create-release-dialog', // HTML tag to use this component: <app-create-release-dialog>
  standalone: true, // This component doesn't depend on NgModule
  templateUrl: './create-release-dialog.component.html', // External HTML template file
  styleUrls: ['./create-release-dialog.component.css'], // External CSS styles file
  imports: [ // Import necessary modules for dialog and form functionality
    CommonModule, // Basic Angular directives
    ReactiveFormsModule, // Reactive forms
    MatDialogModule, // Material Design dialog base
    MatFormFieldModule, // Material Design form field wrapper
    MatInputModule, // Material Design input fields
    MatButtonModule // Material Design buttons
  ]
})
export class CreateReleaseDialogComponent {
  // Reactive form group containing release form controls with validation
  releaseForm: FormGroup;

  /**
   * Component constructor - sets up dependencies and initializes the reactive form
   * @param dialogRef - Reference to the Material Dialog for closing and returning results
   * @param data - Injected data (currently unused but available for future extensions)
   * @param fb - FormBuilder service for creating reactive forms
   */
  constructor(
    public dialogRef: MatDialogRef<CreateReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    // Initialize reactive form with release name and description fields
    this.releaseForm = this.fb.group({
      // Release name field with required validation and pattern matching
      // Pattern enforces YYYY-MM format (e.g., "2024-01", "2024-12")
      name: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
      // Release description field with required validation
      // Provides context about what's included in this release
      description: ['', Validators.required]
    });
  }

  /**
   * Method that handles dialog cancellation
   * Closes the dialog without returning any data
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Method that handles form submission and release creation
   * Validates the form and returns the form data to the parent component
   * Only proceeds if all form validation passes
   */
  onSave(): void {
    if (this.releaseForm.valid) {
      // Close dialog and return the form data (name and description) to parent component
      this.dialogRef.close(this.releaseForm.value);
    }
  }
}
