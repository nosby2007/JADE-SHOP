import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePreviewPipe } from '../file-preview.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [FilePreviewPipe, ConfirmDialogComponent],
  imports: [CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule,
     MatButtonModule,

    
  ],
  exports: [FilePreviewPipe]   // ⬅️ on exporte pour l’utiliser dans d’autres modules
})
export class SharedModule {}
