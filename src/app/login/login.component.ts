/**
 * Login Component for User Authentication
 * 
 * This component provides a secure login form for the deployment portal.
 * It handles user authentication through a reactive form with validation
 * and integrates with the AuthService for session management.
 * 
 * KEY FEATURES:
 * - Reactive form validation for username and password
 * - Integration with AuthService for authentication
 * - Error handling for invalid credentials and network issues
 * - Material Design UI components for professional appearance
 * - Platform detection for browser-specific operations
 * 
 * AUTHENTICATION FLOW:
 * 1. User enters credentials in the form
 * 2. Form validation ensures required fields are completed
 * 3. AuthService.login() sends credentials to backend
 * 4. On success, emits login event to parent component
 * 5. On failure, displays appropriate error message
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Angular core imports
import { Component, EventEmitter, Output } from '@angular/core';

// Platform and common utilities
import { CommonModule, isPlatformBrowser } from '@angular/common';

// Reactive forms for validation and data binding
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

// Authentication service for login operations
import { AuthService } from '../auth.service';

// Platform detection for browser-specific operations
import { Inject, PLATFORM_ID } from '@angular/core';

// Material Design UI components
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

/**
 * Login Form Component
 * 
 * Provides a clean, professional login interface with form validation
 * and error handling for the deployment portal authentication system.
 */
@Component({
  selector: 'app-login', // HTML tag: <app-login></app-login>
  standalone: true, // Standalone component (no NgModule required)
  templateUrl: './login.component.html', // External HTML template
  imports: [
    // Angular modules
    CommonModule, // Common directives (ngIf, ngFor, etc.)
    FormsModule, // Template-driven forms support
    ReactiveFormsModule, // Reactive forms support
    
    // Material Design components
    MatButtonModule, // Material buttons for form submission
    MatInputModule, // Material input fields
    MatFormFieldModule, // Material form field containers
    MatCardModule // Material card for login form container
  ]
})
export class LoginComponent {
  // ===== COMPONENT OUTPUTS =====
  
  /**
   * Event emitter for successful login
   * Notifies parent component when authentication succeeds
   */
  @Output() login = new EventEmitter<any>();
  
  // ===== FORM PROPERTIES =====
  
  /**
   * Reactive form for login credentials
   * Includes validation for required username and password fields
   */
  loginForm: FormGroup;

  // ===== CONSTRUCTOR AND INITIALIZATION =====
  
  /**
   * Constructor - Initialize login component
   * 
   * Sets up the reactive form with validation rules and injects required services.
   * 
   * @param fb FormBuilder for creating reactive forms
   * @param authService Authentication service for login operations
   * @param platformId Platform identifier for browser detection
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize login form with validation rules
    this.loginForm = this.fb.group({
      username: ['', Validators.required], // Username field - required
      password: ['', Validators.required]  // Password field - required
    });
  }

  // ===== FORM SUBMISSION METHODS =====

  /**
   * Handle login form submission
   * 
   * Processes the login form when user clicks submit button.
   * Validates form data, calls authentication service, and handles responses.
   * 
   * AUTHENTICATION PROCESS:
   * 1. Verify we're in browser environment (not server-side rendering)
   * 2. Check form validation status
   * 3. Extract username and password from form
   * 4. Call AuthService.login() with credentials
   * 5. Handle success by emitting login event
   * 6. Handle errors with appropriate user feedback
   */
  onSubmit() {
    // STEP 1: Only process form submission in browser environment
    if (isPlatformBrowser(this.platformId) && this.loginForm.valid) {
      // STEP 2: Extract form values
      const { username, password } = this.loginForm.value;
      
      // STEP 3: Attempt authentication
      this.authService.login(username, password).subscribe({
        next: response => {
          // STEP 4: Login successful - notify parent component
          this.login.emit(response);
        },
        error: (error) => {
          // STEP 5: Handle login errors with user-friendly messages
          console.error('Login error:', error);
          
          if (error.status === 401) {
            // Invalid credentials - most common error
            alert('Invalid credentials');
          } else {
            // Network or server error
            alert('Login failed. Please try again.');
          }
        }
      });
    }
  }
}