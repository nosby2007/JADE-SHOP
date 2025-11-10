import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePreviewPipe } from '../file-preview.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PatientDemographicCardComponent } from './patient-demographic-card/patient-demographic-card.component';


@NgModule({
  declarations: [FilePreviewPipe, ConfirmDialogComponent, PatientDemographicCardComponent],
  imports: [CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule,
     MatButtonModule,

    
  ],
  exports: [FilePreviewPipe, PatientDemographicCardComponent]   // ⬅️ on exporte pour l’utiliser dans d’autres modules
})
export class SharedModule {}
