import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css']
})
export class RequestListComponent {
  @Input() deployments: any[] = [];
  @Input() selectedDeployment: any;
  @Output() deploymentSelected = new EventEmitter<any>();

  selectDeployment(deployment: any) {
    this.deploymentSelected.emit(deployment);
  }

  getStatusColor(status: string): string {
    if (!status) return '#1976d2'; // Default to Open color
    switch (status.toLowerCase()) {
      case 'open': return '#1976d2'; // blue
      case 'in progress': return '#ffb300'; // yellow
      case 'pending': return '#e53935'; // red
      case 'completed': return '#43a047'; // green
      default: return '#1976d2'; // default to blue (Open)
    }
  }
}
