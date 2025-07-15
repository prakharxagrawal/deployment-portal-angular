import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-main-header',
  standalone: true,
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.css'],
  imports: [CommonModule, MatButtonModule]
})
export class MainHeaderComponent {
  @Input() user: any;
  @Output() logout = new EventEmitter<void>();
}
