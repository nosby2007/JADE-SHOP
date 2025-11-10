import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediaRoutingModule } from './media-routing.module';
import { MediaListComponent } from './pages/media-list/media-list.component';
import { MediaUploadDialogComponent } from './pages/media-upload-dialog/media-upload-dialog.component';
import { MediaPreviewDialogComponent } from './pages/media-preview-dialog/media-preview-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';


@NgModule({
  declarations: [
    MediaListComponent,
    MediaUploadDialogComponent,
    MediaPreviewDialogComponent
  ],
  imports: [
    CommonModule,
    MediaRoutingModule,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatCheckboxModule, MatSnackBarModule, MatProgressBarModule
  ]
})
export class MediaModule { }
