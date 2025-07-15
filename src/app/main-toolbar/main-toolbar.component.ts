import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-toolbar',
  standalone: true,
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class MainToolbarComponent {
  @Input() statusFilter: string = '';
  @Input() envFilter: string = '';
  @Input() releaseFilter: string = '';
  @Input() configFilter: string = '';
  @Input() releases: string[] = [];
  @Input() searchQuery: string = '';
  @Input() canEdit: boolean = false;
  @Input() canCreate: boolean = false;
  @Output() statusFilterChange = new EventEmitter<string>();
  @Output() envFilterChange = new EventEmitter<string>();
  @Output() releaseFilterChange = new EventEmitter<string>();
  @Output() configFilterChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() editRequest = new EventEmitter<void>();
  @Output() newRequest = new EventEmitter<void>();

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.statusFilterChange.emit(value);
  }
  onEnvChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.envFilterChange.emit(value);
  }
  onReleaseChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.releaseFilterChange.emit(value);
  }
  
  onConfigChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.configFilterChange.emit(value);
  }
  
  onEditRequest() {
    this.editRequest.emit();
  }
  
  onNewRequest() {
    this.newRequest.emit();
  }
}
