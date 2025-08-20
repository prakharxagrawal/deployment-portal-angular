// Import Angular core decorators and lifecycle hooks
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
// Import Angular forms module for template-driven forms
import { FormsModule } from '@angular/forms';
// Import Angular Material UI components for toolbar functionality
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
// Import CommonModule for basic Angular directives
import { CommonModule } from '@angular/common';
// Import deployment service for API calls
import { DeploymentService } from '../deployment.service';
// Import Service interface for type safety
import { Service } from '../models/service.interface';

/**
 * MainToolbarComponent provides filtering and action controls for the deployment list.
 * This component contains all the filter dropdowns, search functionality, and action buttons
 * that allow users to filter deployments by various criteria and perform operations like
 * creating new requests, editing existing ones, and creating new releases.
 * The toolbar adjusts its available actions based on user roles and permissions.
 */
@Component({
  selector: 'app-main-toolbar', // HTML tag to use this component: <app-main-toolbar>
  standalone: true, // This component doesn't depend on NgModule
  templateUrl: './main-toolbar.component.html', // External HTML template file
  styleUrls: ['./main-toolbar.component.css'], // External CSS styles file
  imports: [ // Import necessary modules for toolbar functionality
    CommonModule, // Basic Angular directives
    FormsModule, // Template-driven forms
    MatFormFieldModule, // Material Design form field wrapper
    MatSelectModule, // Material Design select dropdowns
    MatInputModule, // Material Design input fields
    MatButtonModule, // Material Design buttons
    MatIconModule, // Material Design icons
    MatCheckboxModule // Material Design checkboxes
  ]
})
export class MainToolbarComponent implements OnInit {
  // Input properties: filter values passed from parent component (app.component)
  @Input() statusFilter: string = ''; // Current status filter value
  @Input() envFilter: string = ''; // Current environment filter value
  @Input() releaseFilter: string = ''; // Current release filter value
  @Input() configFilter: string = ''; // Current configuration filter value
  @Input() serviceFilter: string = ''; // Current service filter value
  @Input() teamFilter: string = ''; // Current team filter value
  @Input() releases: string[] = []; // Available release versions for filtering
  @Input() searchQuery: string = ''; // Current search query string
  @Input() canEdit: boolean = false; // Whether current user can edit deployments
  @Input() canCreate: boolean = false; // Whether current user can create new deployments
  @Input() userRole: string = ''; // Current user's role for permission checks
  
  // Output events: emitted to parent component when filters or actions are triggered
  @Output() statusFilterChange = new EventEmitter<string>(); // Status filter changed
  @Output() envFilterChange = new EventEmitter<string>(); // Environment filter changed
  @Output() releaseFilterChange = new EventEmitter<string>(); // Release filter changed
  @Output() configFilterChange = new EventEmitter<string>(); // Configuration filter changed
  @Output() serviceFilterChange = new EventEmitter<string>(); // Service filter changed
  @Output() teamFilterChange = new EventEmitter<string>(); // Team filter changed
  @Output() searchChange = new EventEmitter<string>(); // Search query changed
  @Output() editRequest = new EventEmitter<void>(); // Edit request button clicked
  @Output() newRequest = new EventEmitter<void>(); // New request button clicked
  @Output() createRelease = new EventEmitter<void>(); // Create release button clicked

  // Component data properties
  services: Service[] = []; // List of all available services loaded from API
  // Static list of available teams for filtering - represents development teams
  teams: string[] = ['Phoenix', 'Crusaders', 'Transformers', 'Avengers', 'CRUD', 'Hyper Care'];

  /**
   * Component constructor - sets up dependencies
   * @param deploymentService - Service for making API calls to load services
   */
  constructor(private deploymentService: DeploymentService) {}

  /**
   * Angular lifecycle hook that runs after component initialization
   * Loads the initial list of services for the service filter dropdown
   */
  ngOnInit() {
    this.loadServices();
  }

  /**
   * Method that loads all available services from the backend API
   * Populates the services array for the service filter dropdown
   */
  loadServices() {
    this.deploymentService.getAllServices().subscribe(services => {
      this.services = services;
    });
  }

  // Filter change event handlers - each method handles changes to specific filter dropdowns
  
  /**
   * Event handler for status filter dropdown changes
   * @param event - HTML select change event
   */
  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.statusFilterChange.emit(value);
  }
  
  /**
   * Event handler for environment filter dropdown changes
   * @param event - HTML select change event
   */
  onEnvChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.envFilterChange.emit(value);
  }
  
  /**
   * Event handler for release filter dropdown changes
   * @param event - HTML select change event
   */
  onReleaseChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.releaseFilterChange.emit(value);
  }
  
  /**
   * Event handler for configuration filter dropdown changes
   * @param event - HTML select change event
   */
  onConfigChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.configFilterChange.emit(value);
  }
  
  /**
   * Event handler for service filter dropdown changes
   * @param event - HTML select change event
   */
  onServiceChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.serviceFilterChange.emit(value);
  }
  
  /**
   * Event handler for team filter dropdown changes
   * @param event - HTML select change event
   */
  onTeamChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.teamFilterChange.emit(value);
  }
  
  /**
   * Method that clears all active filters and resets the toolbar to default state
   * Emits empty string values for all filter types to remove any active filtering
   */
  clearFilters() {
    // Reset all local filter values to empty strings
    this.statusFilter = '';
    this.envFilter = '';
    this.releaseFilter = '';
    this.configFilter = '';
    this.serviceFilter = '';
    this.teamFilter = '';
    
    // Emit empty values to parent component to clear all active filters
    this.statusFilterChange.emit('');
    this.envFilterChange.emit('');
    this.releaseFilterChange.emit('');
    this.configFilterChange.emit('');
    this.serviceFilterChange.emit('');
    this.teamFilterChange.emit('');
  }
  
  /**
   * Event handler for edit request button click
   * Emits event to parent component to trigger edit mode for selected deployment
   */
  onEditRequest() {
    this.editRequest.emit();
  }
  
  /**
   * Event handler for new request button click
   * Emits event to parent component to open the new request dialog
   */
  onNewRequest() {
    this.newRequest.emit();
  }
  
  /**
   * Computed property that determines if the current user can create new releases
   * Only admin and superadmin roles have permission to create new releases
   * @returns boolean indicating if user can create releases
   */
  get canCreateRelease(): boolean {
    return this.userRole === 'admin' || this.userRole === 'superadmin';
  }
  
  /**
   * Event handler for create release button click
   * Emits event to parent component to open the create release dialog
   */
  onCreateRelease() {
    this.createRelease.emit();
  }
}
