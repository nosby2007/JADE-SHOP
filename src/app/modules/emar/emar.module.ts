import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmarRoutingModule } from './emar-routing.module';
import { EmarListComponent } from './pages/emar-list/emar-list.component';
import { EmarCreateDialogComponent } from './pages/emar-create-dialog/emar-create-dialog.component';
import { EmarAdminDialogComponent } from './pages/emar-admin-dialog/emar-admin-dialog.component';
import { EmarShellComponent } from './pages/emar-shell/emar-shell.component';
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
    EmarListComponent,
    EmarCreateDialogComponent,
    EmarAdminDialogComponent,
    EmarShellComponent
  ],
  imports: [
    CommonModule,
  ReactiveFormsModule,
  MatTableModule, MatButtonModule, MatIconModule,
  MatDialogModule, MatFormFieldModule, MatInputModule,
  MatSelectModule, MatDatepickerModule, MatNativeDateModule,
  MatCheckboxModule, MatSnackBarModule, MatProgressBarModule,
    EmarRoutingModule
  ]
})
export class EmarModule { }
