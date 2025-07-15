import { Component, Input, Output, EventEmitter } from '@angular/core';

import { CommonModule, DatePipe, NgFor, NgStyle } from '@angular/common';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, DatePipe, NgFor, NgStyle],
  template: `
    <div class="request-list" cdkScrollable>
      <div class="request-item compact flex-request-item"
           *ngFor="let deployment of deployments"
           (click)="select.emit(deployment)"
           [class.selected]="deployment === selected">
        <div class="request-row-top flex-request-row-top">
          <span class="request-number left">{{ deployment.serialNumber }}</span>
          <span class="request-date right">{{ deployment.dateRequested | date:'mediumDate' }}</span>
        </div>
        <div class="request-row-bottom flex-request-row-bottom">
          <span class="request-service left">{{ deployment.service || '-' }}</span>
          <span class="request-status right" [ngStyle]="{'color': getStatusColor(deployment.status)}">{{ deployment.status }}</span>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RequestListComponent {
  @Input() deployments: any[] = [];
  @Input() selected: any;
  @Output() select = new EventEmitter<any>();

  getStatusColor(status: string): string {
    if (!status) return '#1976d2'; // Default to Open color
    switch (status.toLowerCase()) {
      case 'open': return '#1976d2';
      case 'in progress': return '#0288d1';
      case 'pending': return '#ff9800';
      case 'completed': return '#388e3c';
      default: return '#1976d2';
    }
  }
}
