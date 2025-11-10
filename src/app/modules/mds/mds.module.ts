import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MdsRoutingModule } from './mds-routing.module';
import { MdsListComponent } from './pages/mds-list/mds-list.component';
import { MdsCreateDialogComponent } from './pages/mds-create-dialog/mds-create-dialog.component';
import { MdsShellComponent } from './pages/mds-shell/mds-shell.component';
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
    MdsListComponent,
    MdsCreateDialogComponent,
    MdsShellComponent
  ],
  imports: [
    CommonModule,
    MdsRoutingModule,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatCheckboxModule, MatSnackBarModule, MatProgressBarModule
  ]
})
export class MdsModule { }
