import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { NewRequestDialogComponent } from './new-request-dialog.component';

@NgModule({
  imports: [MatDialogModule, NewRequestDialogComponent],
  exports: [NewRequestDialogComponent]
})
export class NewRequestDialogModule {}
