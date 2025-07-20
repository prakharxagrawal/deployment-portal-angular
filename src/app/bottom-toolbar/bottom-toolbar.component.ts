import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bottom-toolbar',
  standalone: true,
  templateUrl: './bottom-toolbar.component.html',
  styleUrls: ['./bottom-toolbar.component.css'],
  imports: [CommonModule, FormsModule]
})
export class BottomToolbarComponent {
  @Input() releases: string[] = [];
  @Input() teams: string[] = [];
  @Input() selectedRelease: string = '';
  @Input() selectedEnv: string = '';
  @Input() selectedTeam: string = '';
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Output() selectedReleaseChange = new EventEmitter<string>();
  @Output() selectedEnvChange = new EventEmitter<string>();
  @Output() selectedTeamChange = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() exportCSV = new EventEmitter<{release: string, env: string, team: string, startDate: string, endDate: string}>();

  // Updated environment list for new model
  environments = ['UAT1', 'UAT2', 'UAT3', 'PERF', 'PROD'];

  onReleaseChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.selectedReleaseChange.emit(value);
  }
  
  onEnvChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.selectedEnvChange.emit(value);
  }
  
  onTeamChange(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || '';
    this.selectedTeamChange.emit(value);
  }
  
  onStartDateChange(event: Event) {
    const value = (event.target as HTMLInputElement)?.value || '';
    this.startDateChange.emit(value);
  }
  
  onEndDateChange(event: Event) {
    const value = (event.target as HTMLInputElement)?.value || '';
    this.endDateChange.emit(value);
  }
  
  onExportCSV() {
    this.exportCSV.emit({
      release: this.selectedRelease,
      env: this.selectedEnv,
      team: this.selectedTeam,
      startDate: this.startDate,
      endDate: this.endDate
    });
  }
}
