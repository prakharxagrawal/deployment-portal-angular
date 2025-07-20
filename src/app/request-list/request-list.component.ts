/**
 * Request List Component for Deployment Display
 * 
 * This component renders a scrollable list of deployment requests with
 * visual status indicators and selection functionality.
 * 
 * KEY FEATURES:
 * - Displays filtered deployment requests in a clean list format
 * - Visual status indicators with color coding
 * - Click-to-select functionality for viewing details
 * - Highlights currently selected deployment
 * - Responsive Material Design cards
 * 
 * COMPONENT COMMUNICATION:
 * - Receives deployment data from parent component via @Input
 * - Emits selection events to parent via @Output
 * - Tracks selected deployment for visual highlighting
 * 
 * UI DESIGN:
 * - Uses Material Design cards for each deployment
 * - Color-coded status badges for quick visual reference
 * - Responsive layout that works on mobile and desktop
 * - Hover effects for better user experience
 * 
 * @author Deployment Portal Team
 * @version 1.0
 */

// Angular core imports for component communication
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Common Angular directives
import { CommonModule } from '@angular/common';

// Material Design components
import { MatCardModule } from '@angular/material/card';

/**
 * Deployment Request List Component
 * 
 * Displays a list of deployment requests with status indicators
 * and handles user selection for detail viewing.
 */
@Component({
  selector: 'app-request-list', // HTML tag: <app-request-list></app-request-list>
  standalone: true, // Standalone component (no NgModule required)
  imports: [
    CommonModule, // Common directives (ngFor, ngIf, etc.)
    MatCardModule // Material Design card components
  ],
  templateUrl: './request-list.component.html', // External HTML template
  styleUrls: ['./request-list.component.css'] // External CSS styles
})
export class RequestListComponent {
  // ===== INPUT PROPERTIES =====
  
  /**
   * Array of deployment requests to display
   * Received from parent component (typically filtered results)
   */
  @Input() deployments: any[] = [];
  
  /**
   * Currently selected deployment for highlighting
   * Used to show which deployment is being viewed in detail
   */
  @Input() selectedDeployment: any;
  
  // ===== OUTPUT EVENTS =====
  
  /**
   * Event emitter for deployment selection
   * Notifies parent component when user selects a deployment
   */
  @Output() deploymentSelected = new EventEmitter<any>();

  // ===== INTERACTION METHODS =====

  /**
   * Handle deployment selection
   * 
   * Called when user clicks on a deployment card.
   * Emits the selected deployment to the parent component
   * for display in the detail view.
   * 
   * @param deployment The deployment object that was selected
   */
  selectDeployment(deployment: any) {
    this.deploymentSelected.emit(deployment);
  }

  // ===== UI UTILITY METHODS =====

  /**
   * Get color code for deployment status
   * 
   * Returns appropriate CSS color for status indicators.
   * Provides visual feedback for deployment progress and state.
   * 
   * STATUS COLOR MAPPING:
   * - Open: Blue (#1976d2) - New requests awaiting action
   * - In Progress: Yellow (#ffb300) - Currently being worked on
   * - Pending: Red (#e53935) - Waiting for approval or action
   * - Completed: Green (#43a047) - Successfully finished
   * 
   * @param status Deployment status string
   * @returns CSS color code for the status
   */
  getStatusColor(status: string): string {
    // Handle null or undefined status
    if (!status) return '#1976d2'; // Default to Open color
    
    // Map status to color (case-insensitive)
    switch (status.toLowerCase()) {
      case 'open': return '#1976d2'; // Blue - new requests
      case 'in progress': return '#ffb300'; // Yellow - active work
      case 'pending': return '#e53935'; // Red - requires attention
      case 'completed': return '#43a047'; // Green - finished successfully
      default: return '#1976d2'; // Default to blue (Open status)
    }
  }
}
